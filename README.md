# PetCare - Pet Management System

A MERN stack (MongoDB, Express, React Native, Node.js) mobile application for pet management.

## Project Structure

```
pet-management-system/
├── backend/                   # Node.js + Express API
│   ├── config/                # Database configuration
│   ├── controllers/           # Route handlers
│   ├── middleware/             # Auth & error middleware
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API route definitions
│   ├── scripts/               # Utility scripts (seedAdmin.js)
│   └── server.js              # Entry point
│
└── mobile-app/                # React Native (Expo) app
    ├── src/                   # Application source code
    │   ├── api/               # Axios API client
    │   ├── components/        # Reusable UI components
    │   ├── constants/         # Theme colors & shared styles
    │   ├── context/           # Auth context provider
    │   ├── navigation/        # Stack & Tab navigators
    │   └── screens/           # App screens (auth, main, user, admin)
    ├── assets/                # Images, icons, splash
    ├── App.jsx                # Root component
    └── index.jsx              # Expo entry point
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Expo Go app on your mobile device

### Backend Setup
```bash
cd backend
npm install
npm start          # Production
npm run dev        # Development (with nodemon)
```

### Mobile App Setup
```bash
cd mobile-app
npm install
npm start
```
Scan the QR code with Expo Go. **Both your phone and laptop must be on the same Wi-Fi network.**

### Seed Admin Account
```bash
cd backend
node scripts/seedAdmin.js
# Login: admin@petcare.com / Password: admin123
```

## Authentication
The app uses a simple session-based authentication via `x-user-id` header. User data is stored in `AsyncStorage` on the device and sent with every API request.

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/users/register` | Public | Register new user |
| POST | `/api/users/login` | Public | Login |
| GET | `/api/users/profile` | Protected | Get profile |
| PUT | `/api/users/profile` | Protected | Update profile |
| PUT | `/api/users/password` | Protected | Change password |
| DELETE | `/api/users/me` | Protected | Delete own account |
| GET | `/api/users/` | Admin | List all users |
| POST | `/api/users/` | Admin | Create user |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |