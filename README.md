# 🚀 TaskFlow

**TaskFlow** is a minimal, dark-themed personal task & project tracker built with Next.js.  
It focuses on clarity, speed, and zero clutter — just projects, tasks, and progress.

> Built for people who want to execute, not manage tools.

---

## ✨ Features

- 📁 Project-based task organization  
- 📊 Real-time dashboard stats (projects, tasks, completed, overdue)  
- 📅 Calendar view  
- 🌙 Dark-first UI  
- 📈 Progress tracking per project  
- 📤 Import / export support  
- ⚡ Clean, distraction-free interface  

---

## 🖼 UI Overview

- Left sidebar navigation (Dashboard, Calendar, Projects)
- Top dashboard summary cards
- Project cards with progress indicators
- Clean, modern typography
- Dark UI with accent highlights

---

## 🛠 Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- (Add your DB here: Prisma / Supabase / MongoDB / etc.)
- (Add auth if applicable: NextAuth / Clerk / etc.)

---

## 📂 Project Structure (example)

```

taskflow/
│
├── app/                # Next.js app router
├── components/         # UI components
├── lib/                # Utilities / helpers
├── hooks/              # Custom React hooks
├── types/              # Type definitions
├── public/             # Static assets
└── styles/             # Global styles

````

Adjust this to match your actual structure.

---

## ⚙️ Installation

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
npm install
````

Run development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🧠 Core Concepts

### Projects

A project contains multiple tasks and tracks overall completion percentage.

### Tasks

Each task:

* Belongs to a project
* Has a status (pending / completed)
* May have a due date

### Dashboard Metrics

* Total Projects
* Total Tasks
* Completed Tasks
* Overdue Tasks

---

## 🔥 Why This Exists

Most task managers are bloated.

TaskFlow strips everything down to:

* Clear projects
* Clear progress
* No noise

It’s built for focused execution.

---

## 📌 Roadmap

* [ ] Drag-and-drop tasks
* [ ] Recurring tasks
* [ ] Tags / labels
* [ ] Mobile optimization
* [ ] PWA support
* [ ] Analytics dashboard
* [ ] Team collaboration mode

---

## 🧪 Scripts

```bash
npm run dev       # Development
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Lint
```

---

## 🚀 Deployment

Recommended platforms:

* Vercel
* Railway
* Render

If using Vercel:

```bash
vercel
```

---

## 🤝 Contributing

1. Fork it
2. Create a feature branch
3. Open a PR
4. Keep it clean

---

## 📄 License

MIT

``` 
MIT License

Copyright (c) 2026 M Ishaq Paktin Yar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
