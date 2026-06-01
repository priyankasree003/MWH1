# Mental Health & Wellness - Starter

Full-stack starter app (JavaScript) with:
- Express backend with SQLite
- React + Vite frontend
- Email/password auth (bcrypt + JWT)
- Sentiment analysis using OpenAI
- Dark/light theme toggle

Quick start

1) Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit backend/.env and set:
# OPENAI_API_KEY=your_openai_key
# JWT_SECRET=your_jwt_secret
npm run start
```

2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Notes
- Authentication: simple email/password (bcrypt + JWT). Use the `/api/auth/register` and `/api/auth/login` endpoints.
- Sentiment: uses OpenAI (set `OPENAI_API_KEY` in `backend/.env`). If missing, a simple fallback heuristic is used.
- Feedback: submissions are stored anonymously (no user_id saved). Endpoints:
	- `POST /api/sentiment` { text }
	- `POST /api/feedback` { token?, text, sentiment, score }
	- `GET /api/feedback` — fetch recent feedback

Running frontend & backend on different ports
- The backend uses CORS and accepts requests from the frontend dev server. If you run frontend and backend separately, ensure the frontend requests go to the backend origin (or configure a proxy in Vite).

Vite dev proxy
- The frontend dev server is preconfigured to proxy requests starting with `/api` to the backend at `http://localhost:4000`. This lets the frontend call `/api/*` without additional CORS or full backend URLs during development. The proxy config is in `frontend/vite.config.js`.

Security
- Keep `OPENAI_API_KEY` and `JWT_SECRET` secret. Do not commit `.env` to source control.

What's next
- UI polish: feedback list and improved styles (implemented).
- Optionally add OAuth, email verification, or a hosted DB for production.

