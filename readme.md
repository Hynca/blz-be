# Backend API

A Node.js/TypeScript backend API using Express, Sequelize, and PostgreSQL.

## Features

- User authentication (JWT, refresh tokens)
- Task management (CRUD, many-to-many user-task relation)
- PostgreSQL database (NeonDB-ready)
- RESTful API

## Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database (or NeonDB)
- Yarn or npm

## Setup

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd be
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory with the following variables:

   ```
   DATABASE_URL=postgres://user:password@host:port/dbname
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   CORS_ORIGIN=http://localhost:5173
   PORT=3000
   ```

   Adjust values as needed for your environment.

## Database

### Sync database schema

**Warning:** This will drop and recreate all tables (destructive).

```bash
npm run db:sync
# or
yarn db:sync
```

## Running the App

### Development

```bash
npm run dev
# or
yarn dev
```

### Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## API Endpoints

- `/api/auth` - Authentication routes (register, login, logout, refresh, me)
- `/api/tasks` - Task CRUD and management

## License

MIT
