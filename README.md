# AI Finance Coach

AI Finance Coach is a personal finance web app that helps users track income and expenses, set goals, and receive AI-powered budgeting insights.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose
- Integrations: OpenAI API, Nodemailer

## Features
- JWT Authentication
- Income & Expense Tracking
- AI Predictive Budgeting
- Emotional Spending Insights
- Financial Nudges
- Goal-Based Saving Plans
- Weekly Email Reports
- Interactive Charts

## Environment Variables

### Backend (`backend/.env`)
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `EMAIL_USER`
- `EMAIL_PASS`
- `FRONTEND_URL`

### Frontend (`frontend/.env`)
- `VITE_API_URL`

## Local Setup
1. Clone the repo
2. Backend:
   - `cd backend`
   - `npm install`
   - `npm start`
3. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## Deployment

### Backend (Render)
1. Push to GitHub
2. Connect the repo to Render
3. Add environment variables
4. Deploy

### Frontend (Vercel)
1. Push to GitHub
2. Connect the repo to Vercel
3. Add `VITE_API_URL`
4. Deploy
