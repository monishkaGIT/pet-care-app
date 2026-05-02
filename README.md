<div align="center">

# 🐾 PetBuddy — Smart Pet Care Management System

[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A full-stack **MERN** (MongoDB, Express, React Native, Node.js) mobile application designed to simplify and enhance pet care management. PetBuddy empowers pet owners to manage pet profiles, track health records, book veterinary services, engage with a pet-loving community, and get AI-powered advice — all in one place.

</div>

---

## 👥 Group Members — DS 1.1 | Group 10

<div align="center">

| # | Name | Student ID | GitHub Profile |
|:-:|:-----|:----------:|:--------------:|
| 01 | Disanayaka S.K | `IT24102217` | [![GitHub](https://img.shields.io/badge/-Komal--Disanayaka-181717?style=flat-square&logo=github)](https://github.com/Komal-Disanayaka) |
| 02 | Kommalage S.G | `IT24100641` | [![GitHub](https://img.shields.io/badge/-savinikommalage-181717?style=flat-square&logo=github)](https://github.com/savinikommalage) |
| 03 | Jayathunga N.P | `IT24102981` | [![GitHub](https://img.shields.io/badge/-Nehara--Jay-181717?style=flat-square&logo=github)](https://github.com/Nehara-Jay) |
| 04 | Gamlath G.M.W.S | `IT24102959` | [![GitHub](https://img.shields.io/badge/-wathsalagamlath-181717?style=flat-square&logo=github)](https://github.com/wathsalagamlath) |
| 05 | Athukorala M.B | `IT24101937` | [![GitHub](https://img.shields.io/badge/-monishkaGIT-181717?style=flat-square&logo=github)](https://github.com/monishkaGIT) |
| 06 | Jayarathna W.A.S.H.S | `IT24102968` | [![GitHub](https://img.shields.io/badge/-shyamaljayarathne-181717?style=flat-square&logo=github)](https://github.com/shyamaljayarathne) |

</div>

---

## 🚀 Deployment Details

| Resource | Link |
|:---------|:-----|
| 🌐 **Backend API** | [https://pet-care-app-6a8l.onrender.com](https://pet-care-app-6a8l.onrender.com) |
| 📱 **APK Download** | [Download .APK File](https://mysliit-my.sharepoint.com/:f:/g/personal/it24102217_my_sliit_lk/IgARgdctwW4dRpRlHDVzkrKhAcRrZ1DlS2g9BRcJDbXUtBA?e=u8uWJX) |

> **Note:** The backend is hosted on Render's free tier. The first request after inactivity may take ~30 seconds to spin up.

---

## ✨ Key Features

### 👤 User Management & Authentication
- Email & password registration with OTP verification
- Secure JWT-based login/logout
- Profile management with image upload (Cloudinary)
- Role-based access control (User / Admin)

### 🐶 Pet Management
- Add, edit, and delete pet profiles
- Track pet details (name, breed, age, weight, etc.)
- Upload pet profile photos

### 🏥 Health Records & Tracking
- Create and manage detailed health records per pet
- Log vaccinations with date tracking
- Weight log history with progress monitoring

### 📅 Service Booking
- Browse available pet care services
- Book appointments with date/time selection
- View and manage upcoming bookings
- Admin: Create, update, and manage service listings

### 💬 Social Community
- Create posts with text and images
- Like, comment, and interact with other pet owners
- Community feed for pet-related discussions

### 🤖 AI-Powered Pet Assistant (Ask Pawly)
- Get instant AI-generated advice on pet care
- Powered by OpenAI via OpenRouter API

### 🔔 Notifications
- In-app notification system for updates and reminders

### 📝 Feedback System
- Submit feedback and ratings for booked services
- Admin: View and manage user feedback

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|:------|:-----------|
| **Frontend** | React Native 0.81.5 with Expo SDK 54 |
| **Navigation** | React Navigation 7 (Stack + Bottom Tabs) |
| **State Management** | React Context API |
| **Backend** | Node.js + Express 5 |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | JWT + bcrypt |
| **File Storage** | Cloudinary |
| **AI Integration** | OpenAI (via OpenRouter) |
| **Email Service** | Nodemailer |
| **HTTP Client** | Axios |
| **Animations** | Lottie React Native |

</div>

---

## 📁 Project Structure

```
pet-care-app/
├── backend/                        # Node.js + Express REST API
│   ├── config/                     # Database configuration (MongoDB)
│   ├── controllers/                # Route handler logic
│   │   ├── askPawlyController.js   # AI chatbot logic
│   │   ├── authController.js       # Authentication & user management
│   │   ├── bookingController.js    # Booking operations
│   │   ├── feedbackController.js   # Feedback/review handling
│   │   ├── healthRecordController.js # Pet health records
│   │   ├── notificationController.js # Notification management
│   │   ├── petController.js        # Pet CRUD operations
│   │   ├── postController.js       # Social post operations
│   │   ├── serviceController.js    # Service management
│   │   ├── vaccinationController.js # Vaccination tracking
│   │   └── weightLogController.js  # Weight tracking
│   ├── middleware/                  # Auth & error middleware
│   ├── models/                     # Mongoose schemas
│   │   ├── Booking.js
│   │   ├── Feedback.js
│   │   ├── HealthRecord.js
│   │   ├── Notification.js
│   │   ├── OTP.js
│   │   ├── Pet.js
│   │   ├── Post.js
│   │   ├── Service.js
│   │   ├── User.js
│   │   ├── Vaccination.js
│   │   └── WeightLog.js
│   ├── routes/                     # API route definitions
│   ├── scripts/                    # Utility scripts (seed admin, etc.)
│   ├── utils/                      # Helper utilities
│   └── server.js                   # Application entry point
│
└── mobile-app/                     # React Native (Expo) Mobile App
    ├── src/
    │   ├── api/                    # Axios API client configuration
    │   ├── components/             # Reusable UI components
    │   ├── constants/              # Theme colors & shared styles
    │   ├── context/                # Auth context provider
    │   ├── hooks/                  # Custom React hooks
    │   ├── navigation/             # Stack & Tab navigators
    │   ├── screens/                # Feature-organized screens
    │   │   ├── AI-ChatBot/         # Ask Pawly AI assistant
    │   │   ├── admin/              # Admin dashboard & management
    │   │   ├── auth/               # Login, Register, OTP screens
    │   │   ├── feedback/           # Feedback & review screens
    │   │   ├── health/             # Health records & tracking
    │   │   ├── notifications/      # Notification center
    │   │   ├── pet-management/     # Pet profile CRUD screens
    │   │   ├── service-booking/    # Service browsing & booking
    │   │   ├── social/             # Community feed & posts
    │   │   └── user/               # User profile & settings
    │   └── utils/                  # Utility functions
    ├── assets/                     # Images, icons, splash screen
    ├── App.jsx                     # Root component
    └── index.jsx                   # Expo entry point
```

---

## 🔌 API Endpoints

### Authentication & Users
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/users/register` | Register a new user |
| `POST` | `/api/users/login` | User login |
| `POST` | `/api/users/verify-otp` | Verify OTP |
| `GET` | `/api/users/profile` | Get user profile |
| `PUT` | `/api/users/profile` | Update profile |

### Pets
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/pets` | Get all pets for user |
| `POST` | `/api/pets` | Add a new pet |
| `PUT` | `/api/pets/:id` | Update pet details |
| `DELETE` | `/api/pets/:id` | Delete a pet |

### Health Records
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/pets/:petId/health` | Get health records |
| `POST` | `/api/pets/:petId/health` | Add health record |
| `PUT` | `/api/pets/:petId/health/:id` | Update record |
| `DELETE` | `/api/pets/:petId/health/:id` | Delete record |

### Services & Bookings
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/services` | List all services |
| `POST` | `/api/services` | Create a service (Admin) |
| `POST` | `/api/bookings` | Book a service |
| `GET` | `/api/bookings` | Get user bookings |

### Social / Posts
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/posts` | Get community posts |
| `POST` | `/api/posts` | Create a new post |
| `PUT` | `/api/posts/:id/like` | Like/unlike a post |
| `POST` | `/api/posts/:id/comment` | Comment on a post |

### AI Assistant
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/ask-pawly` | Ask Pawly AI a question |

### Notifications & Feedback
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/notifications` | Get user notifications |
| `POST` | `/api/feedbacks` | Submit feedback |
| `GET` | `/api/feedbacks` | Get all feedback |

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB instance)
- **Expo Go** app on your mobile device (for development)
- **Cloudinary** account (for image uploads)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Pet-Care-Labs/pet-care-app.git
cd pet-care-app
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# AI Integration (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key
```

Start the backend server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 3️⃣ Mobile App Setup

```bash
cd mobile-app
npm install
```

Update the API base URL in `src/api/` to point to your backend:
- **Local development:** `http://<your-ip>:5000/api`
- **Production:** `https://pet-care-app-6a8l.onrender.com/api`

Start the Expo development server:

```bash
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS) to launch the app.

### 4️⃣ Seed Admin User (Optional)

```bash
cd backend
node scripts/seedAdmin.js
```

---

## 📱 Building the APK

To generate a standalone Android APK:

```bash
cd mobile-app
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

The APK will be available at:
```
mobile-app/android/app/build/outputs/apk/release/app-release.apk
```

Or download the pre-built APK from the [📥 Download Link](https://mysliit-my.sharepoint.com/:f:/g/personal/it24102217_my_sliit_lk/IgARgdctwW4dRpRlHDVzkrKhAcRrZ1DlS2g9BRcJDbXUtBA?e=u8uWJX).

---

## 📄 License

This project was developed as part of the **DS 1.1 Module** at **SLIIT (Sri Lanka Institute of Information Technology)**.

---

<div align="center">

**Made with ❤️ by Group 10**

</div>
