# Login Application

A simple login application built with React (frontend) and Node.js (backend) featuring robust form validation with Zod.

## 🚀 Technologies Used

### Frontend

- **React 18** - Modern React with hooks
- **Material-UI (MUI)** - Beautiful React components
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **React Hot Toast** - Beautiful notifications

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development server with auto-restart
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Mongoose** - MongoDB object modeling

## 📁 Project Structure

```
ProjectM/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/          # Login page
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── backend/                # Node.js backend
│   ├── index.js            # Server entry point
│   ├── package.json
│   └── .env                # Environment variables
├── package.json            # Root package.json
└── README.md
```

## 🛠️ Installation & Setup

### 1. Install all dependencies

```bash
npm run install-all
```

This command will install dependencies for:

- Root project (concurrently)
- Backend server
- Frontend client

### 2. Run the development servers

```bash
npm run dev
```

This will start both servers concurrently:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 📝 Available Scripts

### Root Level

- `npm run dev` - Start both frontend and backend in development mode
- `npm run install-all` - Install dependencies for all projects
- `npm run build` - Build the frontend for production
- `npm start` - Start the backend in production mode

### Frontend (frontend/)

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend (backend/)

- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start in production mode

## 🌐 API Endpoints

- `GET /` - Server status
- `GET /api/health` - Health check endpoint
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user

## 🎯 Features

- **Responsive Design** - Works on desktop and mobile
- **Modern UI** - Material-UI components with consistent theming
- **API Integration** - Frontend communicates with backend via REST API
- **Hot Reload** - Both frontend and backend support hot reloading
- **Error Handling** - Proper error handling and user feedback
- **Routing** - Multiple pages with React Router

## 🔧 Development

The application uses a proxy configuration in Vite to forward API requests from the frontend to the backend during development. This eliminates CORS issues and provides a seamless development experience.

## 📦 Production Build

To build the frontend for production:

```bash
npm run build
```

The built files will be in the `frontend/dist` directory.

## ✅ Form Validation Features

This application includes comprehensive form validation using Zod and React Hook Form:

- **User Management Forms** - Add/Edit users with name, email, and role validation
- **Authentication Forms** - Login and registration with secure password validation
- **Real-time Validation** - Instant feedback as users type
- **Custom Error Messages** - Clear, user-friendly error messages
- **Password Strength** - Enforced password complexity rules
- **Email Validation** - Proper email format checking
- **Confirm Password** - Password confirmation matching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
