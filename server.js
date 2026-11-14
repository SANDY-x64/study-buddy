const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3210);
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';
const DB = new DatabaseSync(path.join(ROOT, 'study-buddy.db'));
DB.exec('CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
const allowedOrigins = new Set(['https://sandy-x64.github.io', 'http://localhost:3210', 'http://127.0.0.1:3210']);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml' };

function send(res, status, body, type='application/json; charset=utf-8') { res.writeHead(status, {'Content-Type':type,'Cache-Control':'no-store'}); res.end(typeof body === 'string' ? body : JSON.stringify(body)); }
function readBody(req) { return new Promise((resolve,reject)=>{let data='';req.on('data',chunk=>{data+=chunk;if(data.length>1_000_000){reject(new Error('Request too large'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(data||'{}'))}catch{reject(new Error('Invalid JSON'))}});req.on('error',reject)}); }

const server = http.createServer(async (req,res) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) { res.setHeader('Access-Control-Allow-Origin',origin); res.setHeader('Vary','Origin'); res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS'); res.setHeader('Access-Control-Allow-Headers','Content-Type'); }
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url,'http://localhost');
  if (url.pathname === '/api/health' && req.method === 'GET') return send(res,200,{ok:true,model:MODEL});
  if (url.pathname === '/api/state' && req.method === 'GET') { const row=DB.prepare('SELECT payload FROM app_state WHERE id=1').get(); return send(res,200,row?JSON.parse(row.payload):null); }
  if (url.pathname === '/api/state' && req.method === 'POST') { try { const state=await readBody(req); DB.prepare('INSERT INTO app_state(id,payload,updated_at) VALUES(1,?,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=CURRENT_TIMESTAMP').run(JSON.stringify(state)); return send(res,200,{ok:true}); } catch(e) { return send(res,400,{error:e.message}); } }
  if (url.pathname === '/api/chat' && req.method === 'POST') {
    try {
      const {subject='the current subject',question='',syllabus=[]}=await readBody(req);
      const topics=Array.isArray(syllabus)?syllabus.map(u=>`${u.title}: ${(u.topics||[]).join(', ')}`).join('\n'):"Use the student's subject context.";
      const prompt=`You are Sandy Study Buddy, a clear and supportive JNTUH R25 study tutor. Focus on ${subject}. Explain accurately at undergraduate level. For 2-mark answers be concise; for 10-mark answers use headings, steps, examples, and diagrams described in words when useful. If uncertain, say so and encourage checking class notes.\nSyllabus context:\n${topics}\n\nStudent question: ${question}`;
      const response=await fetch('http://127.0.0.1:11434/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,stream:false,messages:[{role:'user',content:prompt}],options:{temperature:0.4}}),signal:AbortSignal.timeout(120000)});
      if(!response.ok) return send(res,502,{error:`Ollama returned HTTP ${response.status}`});
      const data=await response.json(); return send(res,200,{answer:data.message?.content||'The local model returned an empty answer.'});
    } catch(e) { return send(res,503,{error:`Could not reach local Ollama (${e.message}). Start Ollama and try again.`}); }
  }
  const pathname=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
  const file=path.resolve(ROOT,'.'+pathname);
  if (!file.startsWith(ROOT+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res,404,{error:'Not found'});
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}); fs.createReadStream(file).pipe(res);
});
server.listen(PORT,'127.0.0.1',()=>console.log(`Sandy Study Buddy: http://127.0.0.1:${PORT} · SQLite: ${path.join(ROOT,'study-buddy.db')} · Model: ${MODEL}`));
