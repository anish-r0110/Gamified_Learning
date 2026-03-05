# Gamified SST Learning Platform (MERN)

MERN stack starter for 8th-grade SST learning with gamification and role-based access.

## Structure

- `/client` React + Tailwind frontend
- `/server` Express backend API
- `/models` MongoDB schemas (`User.js`, `Level.js`, `Score.js`)
- `/server/routes` route modules (`auth.js`, `lessons.js`, `progress.js`)

## Features Implemented

1. Role-based authentication (`student`, `teacher`) with JWT.
2. Level roadmap with two levels: Beginner and Intermediate.
3. Level locking: next level unlocks only after passing prior quiz.
4. Student dashboard: points, badges (`History Hero`), progress bar.
5. 5-question quiz engine per level with score and points persistence.
6. Teacher dashboard table with student name, level reached, total score.

## Backend API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/lessons`
- `GET /api/lessons/:levelId`
- `GET /api/progress/me`
- `POST /api/progress/quiz/:levelId`
- `GET /api/progress/teacher/students`

## Setup

1. Install dependencies:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

2. Create env files:

- Copy `server/.env.example` to `server/.env`
- Copy `client/.env.example` to `client/.env`

3. Seed lesson data:

```bash
npm run seed --prefix server
```

4. Start app (client + server):

```bash
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:5000`

## Notes

- Passing score is `>= 3/5` per level.
- Points awarded = `10 x correct answers`.
- Badge `History Hero` is awarded automatically at 50+ points.
