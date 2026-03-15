# 🗒️ closedNote

> *"Because even ChatGPT forgets sometimes..."*

### 👉 [closednote.vercel.app](https://closednote.vercel.app) — try it live

---

## 👋 What is closedNote?

A web app for saving, organizing, and re-using your best AI prompts — built for students, teachers, engineers, and anyone tired of retyping the same thing twice.

---

## 💡 The Story

I got tired of re-engineering my "perfect ChatGPT prompts" every time I needed a particular kind of answer. Then my mum started doing the same thing (don't ask how she got into it 😭). Then my grandma. Then my classmates.

Meanwhile, prompt engineers were dropping crazy tips on X (Twitter) and Stack Overflow, but I had nowhere to store them neatly.

So, I built one. That's what closedNote is all about — a small home to make prompt saving easier for everyone. 🙂

Completely open source, open to contributions, and continuously improving.

---

## 🧠 Features

- 🔍 **Instant Search** — command palette (`⌘K`) across all prompts
- 📁 **Collections** — group prompts by topic, project, or vibe
- 🖼️ **Image to Text (OCR)** — upload screenshots → extract text → save as prompt
- ✨ **AI Refinement** — clean up extracted text into a polished, reusable prompt
- 💾 **One-Click Copy** — paste straight into ChatGPT, Claude, Cursor, whatever
- 🌗 **Dark Mode** — because your eyes matter
- 📱 **Fully Responsive** — works on mobile without crying
- 🔒 **Private by Default** — RLS ensures your data stays yours

---

## 🖥️ Demo

### Dashboard

![Desktop Screenshot 1](./screenshots/desktop1.png)

![Desktop Screenshot 2](./screenshots/desktop2.png)

### Prompt Editor

![Desktop Screenshot 3](./screenshots/desktop3.png)

### Image to Text (OCR)

![OCR Feature](./screenshots/OCR.png)

### 📱 Mobile

|                                                   |                                                   |
| ------------------------------------------------- | ------------------------------------------------- |
| ![Mobile Screenshot 1](./screenshots/mobile1.png) | ![Mobile Screenshot 2](./screenshots/mobile2.png) |

---

## ⚙️ Tech Stack

**Frontend:** Next.js 14 · React 18 · TypeScript · Tailwind CSS

**Backend:** Supabase (PostgreSQL + PKCE Auth + RLS) · Next.js API Routes

**AI / OCR:** OpenAI GPT-4o-mini · HuggingFace Zephyr-7b · Tesseract.js (offline fallback)

**Deployment:** Vercel

Users without API keys still get full prompt management + offline OCR. AI features unlock when they add a key in Settings.

---

## 🧪 Tests

![Test Results](./screenshots/test.png)

25 tests passing across auth logic and UI components.

```bash
npm test
```

---

## ⚡ Run Locally

```bash
git clone https://github.com/aboderinsamuel/closedNote.git
cd closedNote
npm install
cp .env.example .env.local
# Fill in your Supabase keys in .env.local
npm run dev
```

**.env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

AI features are optional — users add their own OpenAI or HuggingFace key in Settings.

---

## 🚀 Deploy

1. Fork this repo
2. Import to [Vercel](https://vercel.com) and add the two env vars above
3. In Supabase → Authentication → URL Configuration, add your Vercel domain to Redirect URLs

---

## 🛣️ Open Issues & Roadmap

See the [open issues](https://github.com/aboderinsamuel/closedNote_v0.01/issues) for what's being worked on.

Got ideas? Dark mode themes, AI tag suggestions, team sharing, prompt history — contributions welcome!

1. Fork this repo 🍴
2. Create a branch (`feature/my-new-idea`)
3. Commit, push, and open a pull request 🚀

---

## 👨🏽‍🎓 About

Built by [**Samuel Aboderin**](https://github.com/aboderinsamuel),
Computer Engineering student at **UNILAG 🇳🇬**

[LinkedIn](https://www.linkedin.com/in/samuelaboderin) · [GitHub](https://github.com/aboderinsamuel)

---

## 🧾 License

MIT — use it, remix it, improve it. Just don't lock it behind a paywall. 🙏🏽

---

*closedNote — because your prompts deserve better than browser history.* ✨
