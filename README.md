# Chat Application

A real-time chat application with file sharing capabilities.

## Features

- Real-time messaging
- File sharing (images and documents)
- User authentication
- Profile pictures
- Message history
- Online/offline status

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install server dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/chat_app
   JWT_SECRET=your_jwt_secret
   ```

4. Create an `uploads` directory in the root folder:
   ```bash
   mkdir uploads
   ```

## Running the Application

1. Start the server:
   ```bash
   npm run server
   ```

2. In a new terminal, start the client:
   ```bash
   cd client
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/users/register - Register a new user
- POST /api/users/login - Login user
- GET /api/users/current - Get current user

### Messages
- GET /api/messages/:userId - Get messages between current user and another user
- POST /api/messages - Send a new message

### Profile
- POST /api/users/avatar - Upload user avatar

## Technologies Used

- Frontend:
  - React
  - Socket.io-client
  - Axios
  - React Router

- Backend:
  - Node.js
  - Express
  - Socket.io
  - MongoDB
  - Mongoose
  - JWT Authentication
  - Multer (file uploads) 