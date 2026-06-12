# PRMS Backend Documentation

## Project Overview
PRMS Backend is a TypeScript + Express.js + Firebase Admin-based application for Property Management System. Aims to integrate: 
- Firebase Auth for authentication
- SQLite for database persistence
- Express.js for REST APIs

## Setup Guidelines

### Manual Requirements
The following prerequisites must be met:
- Node.js (v16+, v18+ recommended)
- npm or yarn (recommended: npm v9+)
- Firebase Project Account with: 
  - Enabled Authentication 

### Installing Dependencies
Run the below commands at the backend directory:

```bash
npm install express cors @types/express @types/cors firebase-admin dotenv typescript ts-node nodemon prisma --save
npx prisma generate
```

- Initialize SQLite database:
```bash
npx prisma migrate dev --name init_migration
```

### Environment Configuration
Ensure a `.env` file exists at the root:

```bash
FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
PORT=3500
```

### Backend Structure
```
aprms-backend/
│  ├── package.json     
│  ├── prisma/          
│  │   ├── schema.prisma
│  │   └── *.db           
│  ├── src/             
│  │   ├── modules/       
│  │   │   ├── auth/       
│  │   └── app.ts        
│  └── README.txt       
```

### Running The Backend
Start with the following:

```bash
npm run dev
```

This initializes a **NODDEMON** server and runs TypeScript via `ts-node`. Ensure all the following run in the terminal:
- `Database migration`
- `TypeScript compilation`
- `Server initialization`


## API Endpoints

### Health Check
- **Endpoint**: 
  GET  /health 
- **Description**: Serves an OK response, confirming the server is live.

### Authentication
- **Endpoint**: 
  POST /auth/verify
- **Description:** Verifies Firebase token and maps it to the SQLite User.

### Error Handling
- **401 Authentication Error**: Returns when Firebase token is invalid or missing.
- **500 Server Error**: Returns internal server errors.

## Code Reference Links
- **Firebase Documentation**: https://firebase.google.com/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **ExpressJS**: https://expressjs.com/