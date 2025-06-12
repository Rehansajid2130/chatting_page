import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatMainPage from './components/ChatMainPage';
import Login from './components/Login';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  console.log('ProtectedRoute - Token exists:', !!token);
  
  if (!token) {
    console.log('ProtectedRoute - No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('ProtectedRoute - Token found, rendering protected content');
  return children;
};

function App() {
  console.log('App component rendering');
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatMainPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 