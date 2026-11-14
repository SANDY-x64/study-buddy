# Sandy Study Buddy

A multi-subject JNTUH R25 study dashboard for MSF, SE, DBMS, COA, and OOPJ. It can run as a static GitHub Pages app or with an optional local Node.js server, SQLite database, and Ollama tutor.

## Open it

### Static / GitHub Pages

Open `index.html` or the published GitHub Pages site. Progress and custom sessions are saved in browser storage. Attached files are stored in that browser's IndexedDB.

### Local database and AI tutor

Install Node.js 22.5+ and Ollama. Pull the local model once with `ollama pull llama3.2:1b`, then start the app from this folder with `npm start` and open `http://127.0.0.1:3210`. The server creates `study-buddy.db` in this project folder; it stores app state locally and is excluded from Git. Start Ollama before asking the tutor questions. When the app is open on GitHub Pages, it can also use your local tutor if this server and Ollama are running on your computer. If the local service is unavailable, the built-in syllabus explanations remain available.

The local server is for your own computer. SQLite and the local model are not hosted by GitHub Pages.

## Included sessions

- MSF — MA401BS Mathematical and Statistical Foundations
- COA — CS302PC Computer Organization and Architecture
- OOPJ — CS303PC Object Oriented Programming through Java
- SE — CS304PC Software Engineering
- DBMS — CS305PC Database Management Systems

The unit checklists, question prompts, and built-in explanations follow the JNTUH R25 B.Tech CSE (AI&ML), II Year I Semester syllabus. The 2-mark and 10-mark prompts are study practice authored from the syllabus, not official exam questions or predictions. The generated papers are labeled as model practice sets.

The original Desktop files are not copied into this repository. Add selected documents from the `MSF`, `SE`, `DBMS`, `COA`, and `OOPSJava` folders through each subject's Question papers & files tab; attached files are saved in the browser on that device.

## Features

- Independent checklists and saved progress for each subject.
- R25 unit coverage, search, completion filters, and custom topics.
- 2-mark and 10-mark question bank by unit, plus a random practice-paper builder.
- Subject-aware built-in topic explanations and quiz prompts.
- Desktop material links, per-subject file attachments, and custom subject sessions.

## Syllabus source

Official JNTUH R25 CSE (AI&ML) syllabus: https://jntuh.ac.in/uploads/academics/R25B.Tech.CSE%28AIML%29IIIYearSyllabus.pdf
