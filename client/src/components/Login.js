import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Added for registration
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // For registration success
  const [isRegisterMode, setIsRegisterMode] = useState(false); // To toggle forms
  const navigate = useNavigate();

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      console.log('Attempting login with:', { email });
      const response = await axios.post('/api/users/login', {
        email,
        password
      });
      console.log('Login response:', response.data);

      // Store the token in localStorage without the "Bearer " prefix
      const token = response.data.token.replace('Bearer ', '');
      console.log('Storing token:', token);
      localStorage.setItem('token', token);
      
      // Decode token to get user ID and name
      const tokenPayload = token.split('.')[1];
      const decodedToken = JSON.parse(atob(tokenPayload));
      console.log('Decoded token:', decodedToken);
      
      localStorage.setItem('userId', decodedToken.id);
      localStorage.setItem('userName', decodedToken.name);

      console.log('Redirecting to chat page...');
      navigate('/chat');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  // Registration handler
  // NOTE: This is a basic structure, not tested, and needs verification.
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      // Basic validation
      if (!name || !email || !password) {
        setError('All fields are required for registration.');
        return;
      }
      const response = await axios.post('/api/users/register', {
        name,
        email,
        password
      });
      // Backend currently returns user object, not token.
      // For now, show success and let user login.
      setSuccessMessage('Registration successful! Please login.');
      setIsRegisterMode(false); // Switch to login mode
      // Clear fields after successful registration
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setSuccessMessage('');
    // Clear input fields when toggling
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="login-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div className="login-form" style={{
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Conditional Rendering based on isRegisterMode */}
        {isRegisterMode ? (
          // Registration Form
          // NOTE: This is a basic structure, not tested, and needs verification.
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Register</h2>
            {error && (
              <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
            {successMessage && (
              <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>
                {successMessage}
              </div>
            )}
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Register
              </button>
            </form>
            <button onClick={toggleMode} style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', backgroundColor: 'transparent', color: '#007bff', border: 'none', cursor: 'pointer' }}>
              Already have an account? Login
            </button>
          </>
        ) : (
          // Login Form (Existing)
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Login</h2>
            {error && (
              <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
            {successMessage && (
              <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>
                {successMessage}
              </div>
            )}
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Login
              </button>
            </form>
            <button onClick={toggleMode} style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', backgroundColor: 'transparent', color: '#007bff', border: 'none', cursor: 'pointer' }}>
              Don't have an account? Register
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login; 