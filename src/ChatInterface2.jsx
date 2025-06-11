import { useNavigate } from "react-router-dom";
import React from "react";

const ChatInterface2 = ({ chat, onBack }) => {
  const navigate = useNavigate();

  // Sample messages - Replace with actual message data
  const messages = [
    { text: "Hi Furqan I saw your profile and thought you'd be a great fit for the CEO role. Are you interested?", sender: "received", time: "Sat 9:10 AM" },
    { text: "thank you for reaching out! Yes, I'm interested. Could you share more details about the role?", sender: "sent", time: "Sat 9:15 AM" },
    // Add more sample messages here if needed
  ];

  return (
    <div className="chat-box-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="back-arrow" onClick={onBack}> {/* Use onBack prop to go back to contact list */}
          <img src="/assets/images/icon_3.svg" alt="Back Arrow" />
        </div>
        <div className="contact-info">
          <div className="avatar">
            <img src="/assets/images/ellipse_37.png" alt="Contact Avatar" /> {/* Use ellipse_37.png for contact avatar */}
          </div>
          <span className="contact-name">{chat?.name || "Chat"}</span>
        </div>
        {/* Add more header icons/info here if needed - these would typically be on the right */}
         <div className="header-icons">{/* Placeholder for potential icons on the right */}</div>
      </div>

      {/* Chat Messages Area */}
      <div className="messages-area">
        {messages.map((message, index) => (
          <div key={index} className={`message-bubble ${message.sender}`}>
            <p>{message.text}</p>
            <span className="message-time">{message.time}</span>
          </div>
        ))}
        </div>

      {/* Message Input Area */}
      <div className="message-input-area">
        {/* Add icons for attachments/emoji */}
        <div className="input-icons">
             <img src="/assets/images/icon_4.svg" alt="Attachment Icon" /> {/* Placeholder icon */}
             <img src="/assets/images/icon_4.svg" alt="Emoji Icon" /> {/* Placeholder icon */}
        </div>
        <input type="text" placeholder="Start a new message" className="message-input" />
        {/* Add send button/icon */}
         <img src="/assets/images/icon_4.svg" alt="Send Icon" className="send-icon" /> {/* Placeholder icon */}
      </div>

      {/* Add CSS styles for the chat box */}
      <style>{`
        .chat-box-container {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          height: 100vh;
          background-color: #f0f2f5;
          font-family: 'Axiforma', sans-serif; /* Apply Axiforma */
        }

        .chat-header {
          display: flex;
          align-items: center;
          padding: 10px 15px; /* Adjust padding */
          background-color: #fff;
          border-bottom: 1px solid #e0e0e0;
        }

        .chat-header .back-arrow {
            margin-right: 15px; /* Increase space after arrow */
            cursor: pointer;
        }

        .chat-header .back-arrow img {
            height: 24px;
        }

        .chat-header .contact-info {
            display: flex;
            align-items: center;
            flex-grow: 1; /* Allow contact info to take up space */
        }

        .chat-header .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 10px; /* Space between avatar and name */
        }

        .chat-header .avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .chat-header .contact-name {
            font-weight: bold;
            font-size: 18px;
        }

         .header-icons {
            /* Styles for potential icons on the right side of the header */
            margin-left: auto; /* Push icons to the right */
         }

        .messages-area {
          flex-grow: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .message-bubble {
          max-width: 70%;
          padding: 10px 15px;
          border-radius: 10px;
          margin-bottom: 10px;
          position: relative;
        }

        .message-bubble p {
            margin: 0;
            padding-bottom: 15px;
        }

        .message-bubble .message-time {
            position: absolute;
            bottom: 5px;
            right: 10px;
            font-size: 0.7em;
            color: rgba(0, 0, 0, 0.5);
        }

        .message-bubble.sent {
          background-color: #0D473B;
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 2px;
        }

        .message-bubble.received {
          background-color: #fff;
          color: #333;
          align-self: flex-start;
          border-bottom-left-radius: 2px;
          box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.1);
        }

        .message-input-area {
          display: flex;
          align-items: center;
          padding: 10px 15px;
          background-color: #f0f2f5;
          border-top: 1px solid #e0e0e0;
        }

        .message-input-area .input-icons img {
            height: 24px;
            margin-right: 10px;
            cursor: pointer;
        }

        .message-input {
          flex-grow: 1;
          padding: 10px 15px;
          border: none;
          border-radius: 20px;
          outline: none;
          margin: 0 10px;
          font-size: 16px;
          font-family: 'Axiforma', sans-serif; /* Ensure input uses Axiforma */
        }

        .send-icon {
            height: 24px;
            cursor: pointer;
        }

      `}</style>
    </div>
  );
};

export default ChatInterface2; 