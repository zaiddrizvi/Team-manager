# Team Task Manager

MERN task manager app with admin/member roles.

## Tech

- React + Vite + Tailwind
- Node + Express
- MongoDB + Mongoose
- JWT auth

## Features

- Login/signup
- Admin can create projects and tasks
- Admin can add members to projects
- Members can see assigned projects/tasks
- Members can update task status
- Dashboard task stats

## Demo Login

```txt
Admin:  admin@test.com / 123456
Member: member@test.com / 123456
```

## Setup

Install dependencies:

```bash
npm run install:all
```

Create env files:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Add MongoDB URI in `backend/.env`.

Seed demo data:

```bash
npm run seed
```

Run project:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000/api`

## Env

Backend:

```env
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
PORT=5000
```

Frontend:

```env
VITE_API_URL=http://localhost:5000/api
```
