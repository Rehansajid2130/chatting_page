import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface1 from './ChatInterface1';
import ChatInterface2 from './ChatInterface2';

const ChatMainPage = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = React.useState(null);

  return (
    <div className="chat-container">
      <ChatInterface1 onSelectChat={(chat) => setSelectedChat(chat)} />

      {!selectedChat ? (
        <div className="welcome-message">
          <h2>You don't have a message selected.</h2>
          <p>Choose one from your existing messages, or start a new one.</p>
          <button className="new-message-button">New Message</button>
          <img src="/assets/images/Newsletter.png" alt="Welcome Illustration" className="welcome-image"/>
        </div>
      ) : (
        <ChatInterface2 chat={selectedChat} onBack={() => setSelectedChat(null)} />
      )}

      <style>{`
        .chat-container {
          display: flex;
          height: 100vh; /* Full viewport height */
        }

        .welcome-message {
          flex-grow: 1; /* Takes up the remaining space */
          display: flex;
          flex-direction: column;
          justify-content: center; /* Center content vertically */
          align-items: center; /* Center content horizontally */
          text-align: center;
          padding: 20px;
          background-color: #fff; /* White background for the welcome section */
        }

        .welcome-message h2 {
          font-size: 40px; /* Adjust font size */
          font-weight: bold; /* Make text bold */
          margin-bottom: 10px; /* Space below the heading */
          font-family: "Axiforma";
        }

        .welcome-message p {
          font-size: 16px; /* Adjust font size */
          color: #666; /* Grey out the text */
          margin-bottom: 20px; /* Space below the paragraph */
        }
        
        .welcome-image {
            max-width: 80%; /* Ensure image is not too large */
            height: auto;
        }

        /* Styling for the New Message button */
        .new-message-button {
            background-color: #0D473B; /* Dark green color */
            color: white; /* White text */
            padding: 12px 24px; /* Adjust padding to match the image */
            border: none;
            border-radius: 30px; /* Rounded corners */
            font-size: 20px; /* Adjust font size */
            cursor: pointer;
            margin-bottom: 30px; /* Space between button and image */
            transition: background-color 0.3s ease; /* Smooth hover effect */
        }

        .new-message-button:hover {
            background-color: #1a5e4f; /* Slightly lighter green on hover */
        }
      `}</style>
    </div>
  );
};

export default ChatMainPage; 