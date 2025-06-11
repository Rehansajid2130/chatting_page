import React, { useState } from 'react';
import ChatInterface1 from './ChatInterface1';
import ChatInterface2 from './ChatInterface2';

const ChatMainPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);

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