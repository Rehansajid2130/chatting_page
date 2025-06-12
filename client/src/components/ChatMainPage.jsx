import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface1 from './ChatInterface1';
import ChatInterface2 from './ChatInterface2';

const ChatMainPage = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      console.error('Missing authentication data, redirecting to login');
      navigate('/login');
    }
  }, [navigate]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  return (
    <div className="chat-main-page" style={{ display: 'flex', height: '100vh' }}>
      <ChatInterface1 onSelectChat={handleSelectChat} />
      {!selectedChat && (
        <div style={{ flex: 1 }}>
          <ChatInterface2 />
        </div>
      )}
    </div>
  );
};

export default ChatMainPage; 