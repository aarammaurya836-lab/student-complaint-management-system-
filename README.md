<div align="center">

<!-- Animated top banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366F1,100:06B6D4&height=220&section=header&text=Student%20Complaint%20Management%20System&fontSize=34&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Digitizing%20Campus%20Grievances%20%E2%80%94%20One%20Complaint%20at%20a%20Time&descAlignY=58&descSize=18" width="100%"/>

<!-- Animated typing tagline -->
<a href="#">
  <img src="https://readme-typing-svg.demolab.com/?font=Fira+Code&weight=600&size=22&duration=3000&pause=800&color=6366F1&center=true&vCenter=true&width=650&lines=Digital+Complaints.+Zero+Paperwork.;Raise+%E2%80%A2+Track+%E2%80%A2+Resolve+%E2%80%94+All+in+One+Place;Built+with+React+%2B+TypeScript+%2B+Supabase" alt="Typing SVG" />
</a>

<br/>

<!-- Badges -->
<p>
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-2.57-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/github/stars/aarammaurya836-lab/student-complaint-management-system-?style=flat-square&color=6366F1" />
  <img src="https://img.shields.io/github/forks/aarammaurya836-lab/student-complaint-management-system-?style=flat-square&color=06B6D4" />
  <img src="https://img.shields.io/github/last-commit/aarammaurya836-lab/student-complaint-management-system-?style=flat-square&color=8B5CF6" />
  <img src="https://img.shields.io/github/license/aarammaurya836-lab/student-complaint-management-system-?style=flat-square&color=EC4899" />
</p>

</div>

---

### 📌 About

**Student Complaint Management System** is a full digital grievance-redressal platform built for colleges and universities. It replaces slow, paper-based complaint registers with a fast, transparent web app — students raise issues online, admins/staff track and resolve them in real time, and everyone can follow the status without a single physical form.

> *"It's been good to resolve all complaints in a digital way — to nullify paperwork."*

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="60%">
</div>

---

### ✨ Features

<table>
<tr>
<td width="50%" valign="top">

**🎓 For Students**
- 📝 Submit complaints with category & description
- 📍 Real-time status tracking (Pending → In Progress → Resolved)
- 🔔 Instant updates on complaint progress
- 🔐 Secure authentication via Supabase

</td>
<td width="50%" valign="top">

**🛠️ For Admins**
- 📊 Centralized dashboard for all complaints
- ✅ Update status & respond to students
- 🔎 Filter and search complaints by category/status
- 📈 Clean, data-driven overview — zero paperwork

</td>
</tr>
</table>

---

### 🧰 Tech Stack

<div align="center">

![React](https://skillicons.dev/icons?i=react) ![TypeScript](https://skillicons.dev/icons?i=typescript) ![Vite](https://skillicons.dev/icons?i=vite) ![TailwindCSS](https://skillicons.dev/icons?i=tailwind) ![Supabase](https://skillicons.dev/icons?i=supabase) ![ESLint](https://skillicons.dev/icons?i=eslint)

</div>

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend / Auth / DB | Supabase |
| Linting | ESLint + typescript-eslint |

---

### ⚡ Getting Started

<details open>
<summary><b>Click to expand setup instructions</b></summary>

```bash
# 1. Clone the repository
git clone https://github.com/aarammaurya836-lab/student-complaint-management-system-.git

# 2. Move into the project folder
cd student-complaint-management-system-

# 3. Install dependencies
npm install

# 4. Set up environment variables
# Create a .env file in the root with your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 5. Run the development server
npm run dev

# 6. Build for production
npm run build
```

</details>

---

### 📁 Project Structure

```
student-complaint-management-system-/
├── src/              # Application source code
├── dist/             # Production build output
├── index.html        # Entry HTML
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

### 🗺️ Workflow

```mermaid
flowchart LR
    A([👨‍🎓 Student]) -->|Submits Complaint| B[(Supabase DB)]
    B --> C{Admin Dashboard}
    C -->|Pending| D[🕒 In Review]
    D -->|Action Taken| E[✅ Resolved]
    E -->|Notifies| A
    style A fill:#6366F1,color:#fff
    style B fill:#3ECF8E,color:#000
    style C fill:#06B6D4,color:#fff
    style E fill:#22C55E,color:#fff
```

---

### 🤝 Contributing

Contributions are welcome! Feel free to fork this repo, create a feature branch, and open a pull request.

```bash
git checkout -b feature/your-feature-name
git commit -m "Add: your feature"
git push origin feature/your-feature-name
```

---

### 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">

### 💬 Let's Connect

<a href="https://github.com/aarammaurya836-lab"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/></a>

⭐ **If this project helped you, consider giving it a star!** ⭐

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:06B6D4,100:6366F1&height=100&section=footer" width="100%"/>

</div>
