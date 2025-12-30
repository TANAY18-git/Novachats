# 💬 Novachats

A secure, real-time one-to-one chat application built with modern web technologies. Focused on private messaging with a clean, intuitive interface.

![Novachats Banner](https://img.shields.io/badge/Novachats-Real%20Time%20Chat-0ea5e9?style=for-the-badge&logo=message-circle&logoColor=white)

## ✨ Features

- **🔐 Secure Authentication** - JWT-based auth with bcrypt password hashing
- **💬 Real-time Messaging** - Instant message delivery using Socket.IO
- **🔗 Unique Chat Links** - Generate shareable links that expire after 60 minutes
- **⌨️ Typing Indicators** - See when the other person is typing
- **🟢 Online Status** - Real-time online/offline presence
- **📱 Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- **🌙 Dark Mode** - Easy on the eyes with dark theme support
- **⚡ Rate Limiting** - Protected against abuse and spam
- **✅ Input Validation** - Frontend and backend validation

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Socket.IO** - WebSocket server
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB Atlas account or local MongoDB installation
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TANAY18-git/Novachats.git
   cd Novachats
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure server environment**
   Create a `.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   CHAT_LINK_EXPIRY_MINUTES=60
   NODE_ENV=development
   ```

4. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

5. **Configure client environment**
   Create a `.env` file in the client directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

6. **Start the development servers**

   Terminal 1 (Server):
   ```bash
   cd server
   npm run dev
   ```

   Terminal 2 (Client):
   ```bash
   cd client
   npm run dev
   ```

7. **Open your browser** at `http://localhost:5173`

## 📁 Project Structure

```
novachats/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand state stores
│   │   ├── utils/          # Helper functions
│   │   └── App.jsx         # Main app component
│   └── ...
│
└── server/                 # Backend Node.js application
    └── src/
        ├── config/         # Database and socket config
        ├── controllers/    # Route handlers
        ├── middleware/     # Auth, validation, rate limiting
        ├── models/         # Mongoose schemas
        ├── routes/         # API routes
        ├── services/       # Business logic
        └── index.js        # Server entry point
```

## 🔒 Security Features

- **Password Hashing** - All passwords are hashed using bcrypt with 12 salt rounds
- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Prevents brute force attacks on login/registration
- **Input Validation** - All user inputs are validated and sanitized
- **Link Expiration** - Chat links automatically expire after 60 minutes
- **CORS Protection** - Restricted cross-origin access

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password
- `PUT /api/users/profile-picture` - Upload profile picture
- `GET /api/users/chat-link` - Get current chat link
- `POST /api/users/chat-link` - Generate new chat link
- `DELETE /api/users/chat-link` - Invalidate chat link

### Chats
- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:chatId` - Get single chat
- `DELETE /api/chats/:chatId` - Delete chat
- `POST /api/chats/join/:code` - Join via link

### Messages
- `GET /api/messages/:chatId` - Get messages
- `POST /api/messages/:chatId` - Send message
- `PUT /api/messages/:chatId/read` - Mark as read
- `DELETE /api/messages/:messageId` - Delete message

## 📱 Screenshots

The application features a modern, clean design with:
- Glassmorphism effects
- Smooth animations
- Gradient accents
- Dark mode support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**TANAY18-git**

---

⭐ Star this repo if you find it useful!
