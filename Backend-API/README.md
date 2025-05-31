# 📝 Real-Time Collaborative Notes App

A secure, real-time note-taking application that allows authenticated users to create, manage, and collaborate on notes. It supports live chat, group sharing, activity logs, and real-time updates via Socket.IO.

---

## 🚀 Features

- ✅ **JWT Authentication** with secure cookies or Authorization headers
- 🧾 **Notes API** with CRUD operations and bulk updates
- 📚 Notes include: `title`, `content`, `labels[]`, `sharedWith[]`, `archived`, `pinned`, `updatedAt`
- 💬 **Real-Time Chat** using Socket.IO with:
  - Username search
  - Chat request approval system
  - Group-based chat and note sharing
- 🔐 **Role-Based Socket Access Control**
- ♻️ **MongoDB Transactions** for atomic operations
- 📜 **Activity Logs** for note actions (create, update, delete)
- ✏️ **Comment System** per note

---

## 📦 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Real-Time**: Socket.IO
- **Authentication**: JWT + Bcrypt
- **Security**: Helmet, Rate Limiting, CORS
- **Validation**: Joi
- **Logging**: Winston
- **Environment Management**: dotenv

---

## 🗂️ Project Structure

src/
│
├── config/
│ └── db.js # MongoDB connection
│
├── controllers/
│ ├── auth.controller.js
│ ├── note.controller.js
│ └── comment.controller.js
│
├── middlewares/
│ ├── auth.middleware.js
│ └── errorHandler.middleware.js
│
├── models/
│ ├── user.model.js
│ ├── note.model.js
│ ├── log.model.js
│ └── comment.model.js
│ ├── chat.model.js
│ ├── chatRequest.model.js
│ └── group.model.js
│
├── routes/
│ ├── auth.routes.js
│ ├── note.routes.js
│ └── comment.routes.js
│
├── sockets/
│ └── chat.js # Socket.IO server setup and handlers
│
├── utils/
│ └── logger.js # Winston logger setup
│ └──jwt.js
|
├── validations/
│ └── userValidation.js # Joi Validations
│ 
│
└── server.js # App entry point


---

## 🧪 API Endpoints

### 🔐 Auth Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user and return token
- `POST /logout` - Logout user

### 📝 Note Routes (`/api/notes`)
- `POST /` - Create a new note
- `GET /` - Get all user's notes
- `PUT /:id` - Update a note
- `DELETE /:id` - Delete a note
- `PUT /bulk/update` - Bulk update notes

### 💬 Comment Routes (`/api/comments`)
- `POST /:noteId` - Add a comment to a note

---

## 💡 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/Manikanta1413/Real-Time-Notes-App.git
cd real-time-notes-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

---

### 🛡️ Security Best Practices
- Passwords are hashed using bcrypt
- JWT tokens stored securely via cookies or headers
- Socket.IO connections validated with JWT
- Routes protected using middleware
- Helmet and Rate Limiting enabled

---

### 📭 Postman Collection
- A full Postman Collection is included to help you test all the API routes.

### 📥 Import Instructions:
- Open Postman.
- Click Import → Upload Files.
- Select postmancollections.json.
- Make sure to update the environment variables (like {{base_url}}, {{token}}) in the collection.