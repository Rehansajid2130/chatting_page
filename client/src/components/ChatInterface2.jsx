import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatInterface2 = () => {
  const navigate = useNavigate();

  return (
    <div className="chat-interface2">
      <div className="header">
        <div className="back-arrow" onClick={() => navigate("/RecruiterDashBoardPage")}>
          <img src="/assets/images/icon_3.svg" alt="Back Arrow" />
        </div>
        <h2>Messages</h2>
      </div>

      <div className="no-chat-selected">
        <div className="message">
          <h3>Select a chat to start messaging</h3>
          <p>Choose from your existing conversations or start a new one</p>
        </div>
      </div>

      <style>{`
        .chat-interface2 {
          height: 100vh;
          background-color: #f0f2f5;
          display: flex;
          flex-direction: column;
        }

        .header {
          padding: 15px;
          background-color: #fff;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
        }

        .back-arrow {
          margin-right: 10px;
          cursor: pointer;
        }

        .back-arrow img {
          height: 24px;
        }

        .header h2 {
          margin: 0;
          font-size: 20px;
          font-family: 'Axiforma', sans-serif;
        }

        .no-chat-selected {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
        }

        .message h3 {
          margin: 0 0 10px 0;
          color: #1c1e21;
          font-family: 'Axiforma', sans-serif;
        }

        .message p {
          margin: 0;
          color: #65676b;
          font-family: 'Axiforma', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default ChatInterface2; 