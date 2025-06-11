import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const ChatInterface1 = ({ onSelectChat }) => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to socket server
    socketRef.current = io("http://localhost:5000");

    // Join room with user ID
    const userId = localStorage.getItem("userId");
    if (userId) {
      socketRef.current.emit("join", userId);
    }

    // Listen for new messages
    socketRef.current.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Load messages when chat is selected
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`/api/messages/${selectedChat.id}`);
          setMessages(response.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages();
    }
  }, [selectedChat]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    onSelectChat(chat);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message && !file) return;

    const formData = new FormData();
    formData.append("content", message);
    formData.append("receiverId", selectedChat.id);
    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await axios.post("/api/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setMessage("");
      setFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <>
      <div className="chat-sidebar">
        <div className="header">
          <div className="logo-container">
            <img src="/assets/images/group_3_1.svg" alt="Logo" className="logo-img" />
            <span className="job-text">Job</span>
            <span className="fiesta-text">Fiesta</span>
          </div>
          <div className="messages-header">
             <div className="back-arrow" onClick={() => navigate("/RecruiterDashBoardPage")}>
                <img src="/assets/images/icon_3.svg" alt="Back Arrow" />
             </div>
            <h2>Messages</h2>
          </div>
        </div>

        <div className="search-container">
          <input type="text" placeholder="Search people or message" />
        </div>

        <div className="contacts-list">
          <div className="contact-item" onClick={() => handleChatSelect({ id: "1", name: "Hassan", lastMessage: "Chris Martin reacted with" })}>
            <div className="avatar">
              <img src="/assets/images/ellipse_37.png" alt="User Avatar" />
            </div>
            <div className="contact-info">
              <span className="name">Hassan</span>
              <span className="last-message">Chris Martin reacted with</span>
            </div>
          </div>

           <div className="contact-item" onClick={() => handleChatSelect({ name: "Talal", lastMessage: "Thank u lot for your good recommendati..." })}>
            <div className="avatar">
              <img src="/assets/images/ellipse_37.png" alt="User Avatar" />
            </div>
            <div className="contact-info">
              <span className="name">Talal</span>
              <span className="last-message">Thank u lot for your good recommendati...</span>
            </div>
          </div>

           <div className="contact-item" onClick={() => handleChatSelect({ name: "Zain Zeeshan", lastMessage: "Chris Martin reacted with love" })}>
            <div className="avatar">
              <img src="/assets/images/ellipse_37.png" alt="User Avatar" />
            </div>
            <div className="contact-info">
              <span className="name">Zain Zeeshan</span>
              <span className="last-message">Chris Martin reacted with love</span>
            </div>
          </div>

           <div className="contact-item" onClick={() => handleChatSelect({ name: "M A L I", lastMessage: "thank u lot for your good recommendation" })}>
            <div className="avatar">
              <img src="/assets/images/ellipse_37.png" alt="User Avatar" />
            </div>
            <div className="contact-info">
              <span className="name">M A L I</span>
              <span className="last-message">thank u lot for your good recommendation</span>
            </div>
          </div>

           <div className="contact-item" onClick={() => handleChatSelect({ name: "Furqan Zeeshan", lastMessage: "Thanks for your time" })}>
            <div className="avatar">
              <img src="/assets/images/ellipse_37.png" alt="User Avatar" />
            </div>
            <div className="contact-info">
              <span className="name">Furqan Zeeshan</span>
              <span className="last-message">Thanks for your time</span>
            </div>
          </div>

           <div className="contact-item" onClick={() => handleChatSelect({ name: "Rehan Sajjid", lastMessage: "Looking forward to work with you" })}>
            <div className="avatar">
              <img src="/assets/images/ellipse_37.png" alt="User Avatar" />
            </div>
            <div className="contact-info">
              <span className="name">Rehan Sajjid</span>
              <span className="last-message">Looking forward to work with you</span>
            </div>
          </div>

        </div>

        <div className="current-user-profile">
            <div className="avatar">
                 <img src="/assets/images/ellipse_37.png" alt="Current User Avatar" />
            </div>
            <div className="username">
                Furqan12
            </div>
            <div className="options-icon">...</div>
        </div>

      </div>

      {selectedChat && (
        <div className="chat-main">
          <div className="chat-header">
            <div className="chat-user-info">
              <img src="/assets/images/ellipse_37.png" alt="User Avatar" />
              <span>{selectedChat.name}</span>
            </div>
          </div>

          <div className="messages-container">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === localStorage.getItem("userId") ? "sent" : "received"}`}
              >
                {msg.fileUrl && (
                  <div className="message-file">
                    {msg.fileType.startsWith("image/") ? (
                      <img src={msg.fileUrl} alt="Shared file" />
                    ) : (
                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                        Download File
                      </a>
                    )}
                  </div>
                )}
                <div className="message-content">{msg.content}</div>
                <div className="message-time">
                  {new Date(msg.date).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="message-input-container">
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="file-input"
            />
            <label htmlFor="file-input" className="file-attach-button">
              📎
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="message-input"
            />
            <button type="submit" className="send-button">
              Send
            </button>
          </form>
        </div>
      )}

      <style>{`
        .chat-sidebar {
          width: 350px;
          background-color: #f0f2f5;
          height: 100vh;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #e0e0e0;
          font-family: 'Axiforma', sans-serif;
        }

        .header {
          padding: 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .logo-container {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .logo-img {
          height: 30px;
          margin-right: 10px;
        }

        .job-text {
            font-weight: bold;
            margin-right: 5px;
            font-size: 24px;
            font-family: 'Axiforma', sans-serif;
        }

        .fiesta-text {
             font-size: 28px;
             font-family: 'Axiforma', sans-serif;
        }

        .messages-header {
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

        .messages-header h2 {
          font-size: 20px;
          margin: 0;
        }

        .search-container {
          padding: 10px 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .search-container input {
          width: 100%;
          padding: 8px 15px;
          border: 1px solid #ccc;
          border-radius: 20px;
          outline: none;
          font-family: 'Axiforma', sans-serif;
        }

        .contacts-list {
          flex-grow: 1;
          overflow-y: auto;
        }

        .contact-item {
          display: flex;
          align-items: center;
          padding: 10px 15px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
        }

        .contact-item:hover {
          background-color: #e9ebee;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          overflow: hidden;
        }

        .contact-info .name {
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Axiforma', sans-serif;
        }

        .contact-info .last-message {
          color: #666;
          font-size: 0.9em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Axiforma', sans-serif;
        }

        .current-user-profile {
            display: flex;
            align-items: center;
            padding: 10px 15px;
            border-top: 1px solid #e0e0e0;
            background-color: #fff;
        }

        .current-user-profile .avatar {
            margin-right: 10px;
        }

        .current-user-profile .username {
            font-weight: bold;
            flex-grow: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: 'Axiforma', sans-serif;
        }

        .current-user-profile .options-icon {
            font-size: 20px;
            cursor: pointer;
            padding: 5px;
            font-family: 'Axiforma', sans-serif;
        }

        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #fff;
        }

        .chat-header {
          padding: 15px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
        }

        .chat-user-info {
          display: flex;
          align-items: center;
        }

        .chat-user-info img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 10px;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .message {
          max-width: 70%;
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 10px;
        }

        .message.sent {
          align-self: flex-end;
          background-color: #0084ff;
          color: white;
        }

        .message.received {
          align-self: flex-start;
          background-color: #e9ebee;
        }

        .message-file {
          margin-bottom: 5px;
        }

        .message-file img {
          max-width: 200px;
          max-height: 200px;
          border-radius: 5px;
        }

        .message-time {
          font-size: 0.7em;
          margin-top: 5px;
          opacity: 0.7;
        }

        .message-input-container {
          padding: 15px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
        }

        .file-attach-button {
          font-size: 24px;
          cursor: pointer;
          margin-right: 10px;
        }

        .message-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
          outline: none;
        }

        .send-button {
          margin-left: 10px;
          padding: 10px 20px;
          background-color: #0084ff;
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
        }

        .send-button:hover {
          background-color: #0073e6;
        }
      `}</style>
    </>
  );
};

export default ChatInterface1; 