# PetCare — Pet Management Mobile App

## Stitch AI Prompt

> **Build a complete, production-ready React Native (Expo) mobile application for pet management called "PetCare".** The app uses a MERN stack backend (MongoDB, Express, Node.js) already built and connected. Generate all UI screens described below with full navigation, role-based authentication, and the exact design system specified. Every screen must be fully functional with API integration, form validation, loading states, and error handling.

---

## 🎨 Design System & Theme

Use this **exact color palette and design language** across the entire app:

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#A2D2FF` | Soft Blue — headers, buttons, active tab, input borders |
| `secondary` | `#6F4E37` | Warm Brown — text on buttons, titles, icons |
| `background` | `#FAF3E0` | Cream — main screen backgrounds |
| `surface` | `#FFFFFF` | White — cards, modals, form containers |
| `lightGray` | `#F3F4F6` | Light gray — alternate screen backgrounds |
| `inputBg` | `#F9FAFB` | Input field background |
| `inputBorder` | `#E5E7EB` | Default input border |
| `danger` | `#EF4444` | Red — delete, logout, destructive actions |
| `success` | `#10B981` | Green — success states |
| `admin` | `#8B5CF6` | Purple — admin accent (card left border) |
| `adminLight` | `#DBEAFE` | Light blue — admin badges |
| `adminText` | `#1D4ED8` | Dark blue — admin badge text |
| `textPrimary` | `#1F2937` | Dark — primary body text |
| `textSecondary` | `#4B5563` | Medium gray — secondary text |
| `textMuted` | `#6B7280` | Muted text, placeholders |
| `disabledBg` | `#E5E7EB` | Disabled input background |
| `disabledText` | `#9CA3AF` | Disabled text |

### Design Rules
- **Typography:** Bold titles (24–32px) in `secondary` brown. Body text in `textPrimary` or `textSecondary`.
- **Cards:** White (`surface`) with `borderRadius: 12`, `elevation: 4` shadow.
- **Buttons (Primary):** `primary` blue background, `secondary` brown bold text, `borderRadius: 8–10`, subtle blue shadow.
- **Buttons (Secondary/Outline):** White background, `secondary` brown border (2px), brown text.
- **Buttons (Destructive):** Red `danger` background or white with red border.
- **Inputs:** `inputBg` background, 1px `primary` blue border, `borderRadius: 8`, 12px padding.
- **Headers:** `primary` blue background with `borderBottomLeftRadius: 30` and `borderBottomRightRadius: 30`, brown shadow underneath.
- **Icons:** Use Ionicons throughout. Icon color matches `secondary` brown (active) or `primary` blue (inactive).

---

## 📱 Navigation Architecture

### Three Conditional Stacks (role-based routing)

```
if (user === null)       → Auth Stack
if (user.role === 'admin') → Admin Stack
if (user.role === 'user')  → User Stack (contains Bottom Tabs)
```

### Auth Stack (unauthenticated)
```
Splash → Landing → Login
                  → Register
```

### User Stack (authenticated, role = "user")
```
MainTabs (Bottom Tab Navigator)
  ├── MyPets (Home)        — icon: home/home-outline
  ├── Services             — icon: paw/paw-outline
  ├── Social               — icon: people/people-outline
  ├── PetHealth            — icon: medkit/medkit-outline
  └── Feedback             — icon: chatbubble-ellipses/chatbubble-ellipses-outline

Stack screens above tabs:
  ├── Profile
  └── ChangePassword
```

**Bottom Tab Bar Style:**
- Background: `background` cream
- Active tint: `secondary` brown
- Inactive tint: `primary` blue
- Height: 95px, paddingBottom: 40, paddingTop: 5
- No top border, elevation: 10
- Label: 11px, bold

### Admin Stack (authenticated, role = "admin")
```
AdminDashboard → UserList → EditUser
               → CreateUser
```
All admin screens show a header bar with `primary` blue background and `secondary` brown text.

---

## 📄 All Screens — Detailed Specifications

### 1. Splash Screen
- Full screen, `background` cream color
- Centered app logo (150×150px)
- Auto-navigates to Landing after 2 seconds
- No buttons, no text — just the logo with a fade-in animation

### 2. Landing Screen
- Background: `background` cream
- Center content vertically:
  - App logo (150×150px, `resizeMode: contain`)
  - Title: **"Welcome to PetCare!"** — 32px bold, `secondary` brown
  - Subtitle: **"The ultimate pet management system."** — 18px, gray (#888)
- Bottom footer with two buttons (full width):
  - **"Get Started"** — Primary button → navigates to Register
  - **"I already have an account"** — Outline/secondary button → navigates to Login

### 3. Login Screen
- Background: `background` cream
- Centered white card (surface, borderRadius: 12, elevation: 4, padding: 24):
  - Title: **"Welcome Back!"** — 24px bold, centered, `secondary` brown
  - Email input (email-address keyboard, no auto-capitalize)
  - Password input (secureTextEntry)
  - **"Login"** primary button (shows ActivityIndicator while loading)
  - Link text below: **"Don't have an account? Register"** → navigates to Register
- **Validation:** Alert if any field is empty
- **Error handling:** Show API error message in Alert on failure

### 4. Register Screen
- Background: `background` cream, ScrollView
- White card container:
  - Title: **"Create Account"** — 24px bold, centered, `secondary` brown
  - **Profile image picker** — circular (100×100px), gray placeholder with "+ Add Photo" text, tap to open image library (cropped to 1:1, base64)
  - Input fields: Full Name, Email, Password, Phone Number, Address
  - **Role selector** — two side-by-side toggle buttons ("User" | "Admin"), active one gets `primary` blue background
  - **"Register"** primary button (shows ActivityIndicator while loading)
  - Link: **"Already have an account? Login"** → navigates to Login
- **Validation:** Alert if any required field is empty
- Auto-login after successful registration

### 5. Home Screen (MyPets tab)
- Background: `lightGray`
- **Curved header:** `primary` blue background, rounded bottom corners (30px radius), brown shadow
  - **Profile icon button** — top-left, circular white button (44×44px) with brown border, person icon (Ionicons), navigates to Profile screen
  - Title: **"My Pets"** — 28px bold, `secondary` brown, centered
  - Subtitle: **"Welcome back to PetCare!"** — 16px, `secondary` brown
- **Content area:** Center — Beagle mascot Lottie animation (empty state)
- *Future feature: list of user's pets with cards showing pet name, breed, age, photo*

### 6. Services Screen (Services tab)
- Background: `lightGray`
- **Curved header** (same style as Home):
  - Title: **"Pet Services"** — 28px bold, `secondary` brown
  - Subtitle: **"Discover grooming, walking, and boarding."**
- **Content:** Empty state with Beagle mascot Lottie animation
- *Future feature: service category cards (Grooming, Walking, Boarding, Veterinary, Training) with icons, descriptions, and booking buttons*

### 7. Social Screen (Social tab)
- Background: `background` cream
- **Curved header** (same style):
  - Title: **"Community Feed"** — 28px bold, `secondary` brown
  - Subtitle: **"See what other pets are doing near you!"**
- **Content:** Empty state with Beagle mascot Lottie animation
- *Future feature: social media-style feed with pet photos, like/comment functionality*

### 8. Pet Health Screen (PetHealth tab)
- Background: `background` cream
- Has header bar: title "Pet Health", `primary` blue bg, `secondary` brown text, centered
- **Content:** Centered vertically:
  - Medkit icon (Ionicons `medkit-outline`, size 64, `primary` blue)
  - Text: **"No Data Available Yet"** — 18px bold, `secondary` brown
- *Future feature: health records, vaccination tracker, vet appointment scheduler*

### 9. Feedback Screen (Feedback tab)
- Has header bar: title "Feedback", `primary` blue bg, `secondary` brown text, centered
- Placeholder/empty state screen
- *Future feature: feedback form with rating stars, text area, submit button*

### 10. Profile Screen
- Stack screen with header: "My Profile", `primary` blue bg, `secondary` brown tint, centered
- Background: `background` cream, ScrollView, centered content
- White card:
  - **Profile image picker** — same as Register (circular 100×100, tap to change)
  - **Email** — labeled "Email Address (Cannot be changed)", disabled input (gray background)
  - **Full Name** — editable input with label
  - **Phone Number** — editable, phone-pad keyboard
  - **Address** — editable input
  - **"Save Changes"** — primary button (ActivityIndicator while loading)
  - **"Logout"** — white button with red danger border, red text → logs user out
  - **"Delete Account"** — white button with red danger border, red text → confirmation Alert → permanently deletes account and logs out

### 11. Change Password Screen
- Stack screen with header: "Change Password", `primary` blue bg, `secondary` brown tint
- White card with:
  - Current Password input
  - New Password input
  - Confirm New Password input
  - **"Update Password"** primary button
- Validation: all fields required, new passwords must match

### 12. Admin Dashboard Screen
- Header bar: "Admin Home", `primary` blue bg, `secondary` brown tint
- Background: `background` cream
- Welcome section: **"Admin Panel"** (32px bold), subtitle "Welcome back, {username}"
- Two action cards (white, borderRadius: 12, elevation: 2, **purple left border 4px**):
  - **"Manage Users"** — "View, edit, or delete registered user accounts" → navigates to UserList
  - **"Create New User"** — "Manually register a user or assign admin privileges" → navigates to CreateUser
- **"Logout"** — red danger button at bottom

### 13. User List Screen (Admin)
- Header: "Manage Users", `primary` blue bg, `secondary` brown tint
- List/FlatList of all registered users
- Each user card shows: name, email, role badge
- Tap a user → navigate to EditUser with user data
- Swipe-to-delete or delete icon per row with confirmation

### 14. Create User Screen (Admin)
- Header: "Create User", `primary` blue bg, `secondary` brown tint
- Form with: Full Name, Email, Password, Phone, Address
- Role selector toggle (User | Admin)
- **"Create User"** primary button
- Validation and error handling

### 15. Edit User Screen (Admin)
- Header: "Edit User", `primary` blue bg, `secondary` brown tint
- Pre-populated form with existing user data: Name, Email (disabled), Phone, Address
- Role selector toggle (User | Admin)
- **"Save Changes"** primary button
- **"Delete User"** destructive button with confirmation Alert

---

## 🔌 Backend API (Already Built)

Base URL: `http://<server-ip>:5000/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | Public | Register new user (name, email, password, phone, address, profileImage, role) |
| `POST` | `/login` | Public | Login with email + password → returns user object |
| `GET` | `/profile` | Protected | Get current user's profile |
| `PUT` | `/profile` | Protected | Update profile (name, phone, address, profileImage) |
| `PUT` | `/password` | Protected | Change password (currentPassword, newPassword) |
| `DELETE` | `/me` | Protected | Delete own account |
| `GET` | `/` | Admin | List all users |
| `POST` | `/` | Admin | Admin create a new user |
| `PUT` | `/:id` | Admin | Admin update a user |
| `DELETE` | `/:id` | Admin | Admin delete a user |

**Authentication:** Uses `x-user-id` header. After login, store user data in AsyncStorage and attach user ID to every API request via Axios interceptor.

---

## 🗄️ Data Model — User Schema

```javascript
{
  name:         String (required),
  email:        String (required, unique),
  password:     String (required, hashed with bcrypt),
  role:         String (enum: ["user", "admin"], default: "user"),
  phone:        String (optional),
  address:      String (optional),
  profileImage: String (optional, base64 data URI),
  createdAt:    Date (auto),
  updatedAt:    Date (auto)
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native (Expo SDK) |
| Navigation | React Navigation (Native Stack + Bottom Tabs) |
| State Management | React Context API (AuthContext) |
| HTTP Client | Axios with interceptor for `x-user-id` header |
| Icons | `@expo/vector-icons` (Ionicons) |
| Image Picker | `expo-image-picker` (base64) |
| Animations | Lottie (`lottie-react-native`) — Beagle mascot |
| Storage | AsyncStorage |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | bcrypt (password hashing) |

---

## 📂 Project Structure

```
pet-care-app/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/authController.js  # All auth & user CRUD logic
│   ├── middleware/                # Auth & error middleware
│   ├── models/User.js            # Mongoose User schema
│   ├── routes/authRoutes.js      # API route definitions
│   ├── scripts/seedAdmin.js      # Seed default admin account
│   └── server.js                 # Express entry point (port 5000)
│
└── mobile-app/
    ├── App.jsx                   # Root component (AuthProvider wrapper)
    ├── src/
    │   ├── api/axiosConfig.js    # Axios instance + x-user-id interceptor
    │   ├── components/
    │   │   └── BeagleLottie.jsx  # Lottie animation component
    │   ├── constants/theme.js    # COLORS & SHADOWS design tokens
    │   ├── context/AuthContext.js # Auth state, login, register, logout
    │   ├── navigation/
    │   │   ├── AppNavigator.jsx  # Root navigator (role-based stacks)
    │   │   └── MainTabNavigator.jsx # Bottom tab navigator (5 tabs)
    │   └── screens/
    │       ├── auth/             # SplashScreen, LandingScreen, LoginScreen, RegisterScreen
    │       ├── main/             # HomeScreen, ServicesScreen, SocialScreen, PetHealthScreen
    │       ├── user/             # ProfileScreen, ChangePasswordScreen, FeedbackScreen
    │       └── admin/            # AdminDashboardScreen, UserListScreen, CreateUserScreen, EditUserScreen
    └── assets/                   # logo.png, Lottie JSON files
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas or local MongoDB
- Expo Go app on your phone

### Backend
```bash
cd backend
npm install
npm run dev        # Starts with nodemon on port 5000
```

### Seed Admin
```bash
cd backend
node scripts/seedAdmin.js
# Default admin: admin@petcare.com / admin123
```

### Mobile App
```bash
cd mobile-app
npm install
npm start          # Opens Expo dev tools
```
Scan QR code with Expo Go. **Phone and laptop must be on the same Wi-Fi network.**

---

## 📋 Feature Roadmap (Planned)

- [ ] Pet profiles (CRUD) with photo, breed, age, weight
- [ ] Pet health records & vaccination tracking
- [ ] Vet appointment scheduling & reminders
- [ ] Service booking (grooming, walking, boarding, training)
- [ ] Social feed — pet photos, likes, comments
- [ ] Push notifications for reminders
- [ ] Feedback & rating system
- [ ] Chat/messaging between pet owners
- [ ] Lost & found pets feature
- [ ] Pet adoption marketplace