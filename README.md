# ✂️ BG Remover MVP

Modern, privacy-first background remover MVP (client-side AI approach).

## 🔗 Live Intent
This project is optimized for fast prototyping and can be deployed to Vercel/Netlify.

## 🧰 Stack
- React + TypeScript (Vite)
- Tailwind CSS
- Framer Motion
- Lucide React
- Transformers.js (client-side inference)

## ✨ Features (MVP)
- Drag & drop / click upload
- In-browser background removal flow
- Before/After preview blocks
- Transparent PNG download CTA
- Responsive dark UI

## 🚀 Quick Start
```bash
npm install
npm run dev
```

## 🏗️ Build
```bash
npm run build
npm run preview
```

## 📁 Project Structure
```text
bg-remover-mvp/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── tailwind.config.js
└── README.md
```

## 🗺️ Roadmap
- [ ] Real before/after slider
- [ ] Local history (IndexedDB)
- [ ] Background color/image switch
- [ ] Batch processing (phase 2)
- [ ] Performance split (worker + lazy model)

## ⚠️ Notes
- First model load may take longer.
- Client-side AI performance depends on user device/browser.

## 📄 License
MIT
