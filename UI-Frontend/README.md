# 📘 Real-Time Collaborative Notes App — Frontend

This is the **frontend** of the Real-Time Collaborative Notes App, built using **React**, **Socket.IO**, and **Vite**.  
It allows users to register, log in, and collaborate on notes in real time with other connected users.

---

## 🚀 Features

- 🔐 User Authentication (Register & Login)
- 📝 Collaborative Notes Editing
- 🌐 Real-Time Synchronization via Socket.IO
- ⚡ Built with React 19, Vite, and Socket.IO Client
- 📦 Proxy-enabled API requests to backend
- 💅 Minimal and clean UI design

---

## 📁 Project Structure
UI-Frontend/
├── public/
├── src/
│ ├── components/ # Reusable components (Home, Register, Login, Notes etc.)
│ ├── context/ # Socket context provider
│ ├── sockets/ # Socket.IO client setup
│ ├── utils/ # Axios
│ ├── App.jsx # App root component
│ ├── main.jsx # Entry point
│ └── App.css # Styling
├── .env # Environment variables
├── vite.config.js # Vite config with proxy
└── package.json


---

## ⚙️ Environment Setup

Create a `.env` file in the root of the frontend project:

```env
VITE_SOCKET_URL=http://localhost:3000
---

```
### 📦 Installation & Development
1. **Clone the repository**
```bash 
git clonehttps://github.com/Manikanta1413/Real-Time-Notes-App.git
cd real-time-notes-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```
✅ Make sure your backend server is running at http://localhost:3000

4. 🌐 **Proxy Setup for API Requests**
To avoid CORS issues while making API requests to the backend (localhost:3000) during development, a proxy has been configured in vite.config.js:
```bash
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000", // backend server URL
    },
  },
});
```

🔧 **Available Scripts**
```bash
# Development
npm run dev

# Production
npm start
```

## 📚 Tech Stack
- Frontend Framework: React 19
- Bundler: Vite
- Routing: React Router DOM v7
- Real-Time Communication: Socket.IO Client
- HTTP Client: Axios
- Linting: ESLint


## 🤝 Backend Repository
Link to backend repo


## 🛡️ Authentication
- JWT-based authentication
- Token stored in localStorage
- Socket.IO client includes the token via auth config