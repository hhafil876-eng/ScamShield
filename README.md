<div align="center">

# 🛡️ ScamShield — Cyber Threat Defense & Intelligence

**A full-stack cybersecurity awareness and education platform combining interactive 3D threat visualization with user authentication.**

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-scam--shield--gules.vercel.app-00FF66?style=for-the-badge&logo=vercel&logoColor=black)](https://scam-shield-gules.vercel.app)
[![React](https://img.shields.io/badge/React-19.2.8-00E5FF?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F_9.7-00FF66?style=for-the-badge&logo=threedotjs&logoColor=black)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 📌 01 // Overview

**ScamShield** is an educational web application designed to help everyday internet users identify and protect themselves against common online scams, deceptive phishing tactics, and social engineering attacks.

By pairing **interactive 3D graphics (React Three Fiber & Three.js)** with structured safety modules and user authentication, ScamShield turns cybersecurity awareness into an engaging, visual experience.

- **Live Application:** [https://scam-shield-gules.vercel.app](https://scam-shield-gules.vercel.app)
- **Repository:** [https://github.com/hhafil876-eng/ScamShield](https://github.com/hhafil876-eng/ScamShield)
- **Status:** Live Web Application (Full-Stack Core)

---

## ⚡ 02 // Core Features

- **Interactive 3D Visuals**: Real-time 3D grid and node scenes built using `@react-three/fiber` and `@react-three/drei` (`CyberWorld.jsx`, `CyberGrid.jsx`, `SecurityCore.jsx`, `ThreatNetwork.jsx`).
- **User Authentication**: Secure signup and login workflows with password hashing (`bcryptjs`) and session management via JSON Web Tokens (JWT).
- **Protected User Profile**: Guarded client routes (`ProtectedRoute.jsx`) rendering personalized user profile details (`Profile.jsx`).
- **Scam Categorization & Education**: Clear breakdowns of widespread digital fraud categories:
  - Phishing emails and malicious links
  - OTP and password theft schemes
  - Impersonation and authority scams
  - Fake payment portals and prize notifications
- **Decoupled Architecture**: Modular React frontend client communicating with an independent Express/MongoDB backend service.

---

## 🛠️ 03 // Technology Stack

### Frontend Client
- **Framework:** React 19 (`react: ^19.2.8`, `react-dom: ^19.2.8`)
- **Routing:** React Router v7 (`react-router-dom: ^7.18.3`)
- **3D Graphics Engine:** Three.js (`three: ^0.185.1`), `@react-three/fiber: ^9.7.0`, `@react-three/drei: ^10.7.8`
- **Iconography:** Lucide React (`^1.37.0`)
- **Build Tool:** Vite 8 (`vite: ^8.2.2`)

### Backend Server (`/server`)
- **Runtime:** Node.js
- **Server Framework:** Express 5 (`express: ^5.2.1`)
- **Database & ODM:** MongoDB with Mongoose (`mongoose: ^9.9.4`)
- **Security:** `bcryptjs` (`^3.0.3`), `jsonwebtoken` (`^9.0.3`), `cors` (`^2.8.6`)
- **Development Tools:** `dotenv` (`^17.4.2`), `nodemon` (`^3.1.14`)

---

## 📂 04 // Project Architecture

```text
ScamShield/
├── server/                         # Backend Express Service
│   ├── config/                     # Database connection & config
│   ├── controller/                 # Route logic (auth, user accounts)
│   ├── middleware/                 # JWT authentication middleware
│   ├── models/                     # Mongoose data schemas (User)
│   ├── index.js                    # Server listener
│   ├── server.js                   # Express app setup
│   └── package.json                # Server dependencies
├── src/                            # Frontend React Application
│   ├── assets/                     # Media & icons
│   ├── components/                 # UI & 3D canvas components
│   │   ├── CyberGrid.jsx           # 3D animated floor grid
│   │   ├── CyberWorld.jsx          # Parent Three.js canvas
│   │   ├── ProtectedRoute.jsx      # Route authentication guard
│   │   ├── ScrollScene.jsx         # Scroll interaction wrapper
│   │   ├── SecurityCore.jsx        # 3D core visual
│   │   └── ThreatNetwork.jsx       # 3D node network graph
│   ├── pages/                      # Page views
│   │   ├── Login.jsx               # Login page
│   │   ├── Signup.jsx              # Account registration
│   │   ├── Profile.jsx             # User profile page
│   │   └── profile.css             # Page styles
│   ├── App.jsx                     # Route configuration
│   ├── main.jsx                    # Client entry point
│   └── index.css                   # Global styles
├── package.json                    # Frontend dependencies
└── vite.config.js                  # Vite configuration
```

---

## 🚀 05 // Installation & Running Instructions

### 1. Clone the repository
```bash
git clone https://github.com/hhafil876-eng/ScamShield.git
cd ScamShield
```

### 2. Configure & Run Backend Server
```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the server:
```bash
# Development mode
npm run dev

# Or production start
npm start
```
The server will run at `http://localhost:5000`.

### 3. Run Frontend Client
In a separate terminal, navigate to the repository root:
```bash
cd ScamShield
npm install
npm run dev
```
Open `http://localhost:5173` in your web browser.

---

## 📈 06 // Current Status & Next Steps

- [x] Full-stack user authentication with JWT and password encryption
- [x] Interactive 3D threat visuals via React Three Fiber
- [x] Responsive login, signup, and profile pages
- [x] Deployed live on Vercel Edge Network
- [ ] Educational quiz module for interactive scam scenario testing
- [ ] Real-time suspicious link report submission

---

## 📄 07 // Author & License

Developed by **Mohammed Hapiz** ([@hhafil876-eng](https://github.com/hhafil876-eng)).  
Released under the MIT License.
