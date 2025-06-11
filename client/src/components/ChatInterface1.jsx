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
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const socket = io('http://localhost:5000', {
      withCredentials: true,
      auth: {
        token: token
      }
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
      const userId = localStorage.getItem('userId'); // Ensure this is correctly fetched
      if (userId) {
        socket.emit('join', userId);
      }
    });

    socket.on('receiveMessage', (message) => { // Changed from 'message' to 'receiveMessage'
      setMessages((prevMessages) => [...prevMessages, message]);
      // Update localStorage as well when a new message is received
      if (selectedChat && message.receiver === localStorage.getItem('userId')) { // Only if message is for current user
        const currentMessages = JSON.parse(localStorage.getItem(`chat_messages_${message.sender}`)) || [];
        localStorage.setItem(`chat_messages_${message.sender}`, JSON.stringify([...currentMessages, message]));
      } else if (selectedChat && message.sender === localStorage.getItem('userId')) { // Message sent by current user, confirmed by server
        const currentMessages = JSON.parse(localStorage.getItem(`chat_messages_${message.receiver}`)) || [];
        // This part might be redundant if optimistic update already updated with server's final message
        const existingMsg = currentMessages.find(m => m._id === message._id || (m.tempId && message.tempId && m.tempId === message.tempId));
        if (!existingMsg) {
          localStorage.setItem(`chat_messages_${message.receiver}`, JSON.stringify([...currentMessages, message]));
        }
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (error.message === 'Authentication error') {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Load messages when chat is selected
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/login');
            return;
          }

          const response = await axios.get(`/api/messages/${selectedChat.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const messagesData = Array.isArray(response.data) ? response.data : [];
          setMessages(messagesData);
          // Store messages in localStorage
          localStorage.setItem(`chat_messages_${selectedChat.id}`, JSON.stringify(messagesData));
        } catch (error) {
          console.error('Error fetching messages:', error);
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            navigate('/login');
          }
          // Try to load from localStorage if API fails
          const savedMessages = localStorage.getItem(`chat_messages_${selectedChat.id}`);
          setMessages(savedMessages ? JSON.parse(savedMessages) : []);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedChat, navigate]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    onSelectChat(chat);
  };

  const formatTime = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    if (isNaN(messageDate.getTime())) return '';
    
    const hours = messageDate.getHours();
    const minutes = messageDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message && !file) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append("content", message);
      formData.append("receiverId", selectedChat.id);
      if (file) {
        formData.append("file", file);
      }

      // Create a temporary message object
      const tempMessage = {
        tempId: Date.now().toString(), // Unique temporary ID
        content: message,
        sender: localStorage.getItem("userId"),
        receiver: selectedChat.id, // Ensure receiver is part of temp message
        date: new Date().toISOString(),
        fileUrl: file ? URL.createObjectURL(file) : null,
        fileType: file ? file.type : null
      };

      // Add the message to the UI immediately
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      // Store in localStorage (optimistically)
      // Note: this will be updated again once server confirms
      const currentMessagesForStorage = [...messages, tempMessage];
      localStorage.setItem(`chat_messages_${selectedChat.id}`, JSON.stringify(currentMessagesForStorage));
      
      // Clear the input
      setMessage("");
      setFile(null);

      // Send to server
      const response = await axios.post("/api/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });

      // Update the message with server response
      if (response.data) {
        const finalMessageFromServer = response.data;
        setMessages(prevMessages => {
          const updated = prevMessages.map(msg =>
            msg.tempId === tempMessage.tempId ? finalMessageFromServer : msg
          );
          // Update localStorage with the final message from server
          localStorage.setItem(`chat_messages_${selectedChat.id}`, JSON.stringify(updated));
          return updated;
        });
      } else {
        // If server didn't return a message, remove the temp one or mark as failed
        // For now, just log it. A more robust solution would be to mark message as failed.
        console.warn("Message sent, but no confirmation message received from server.", tempMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally, remove the optimistic message or mark it as failed on error
      setMessages(prevMessages => prevMessages.filter(msg => msg.tempId !== tempMessage.tempId));
      // Re-set local storage without the failed optimistic message
      localStorage.setItem(`chat_messages_${selectedChat.id}`, JSON.stringify(messages.filter(msg => msg.tempId !== tempMessage.tempId)));
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
      }
      alert("Failed to send message. Please try again.");
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
            {/* TODO: Update navigation for RecruiterDashboardPage when implemented */}
            <div className="back-arrow" onClick={() => navigate("/")}>
              <img src="/assets/images/icon_3.svg" alt="Back Arrow" />
            </div>
            <h2>Messages</h2>
          </div>
        </div>

        <div className="search-container">
          <input type="text" placeholder="Search people or message" />
        </div>

        {/* TODO: Replace with dynamic user list fetching */}
        {/* FIXME: Hardcoded user ID for testing. Needs dynamic user loading. */}
        <div className="contacts-list">
          <div className="contact-item" onClick={() => handleChatSelect({ id: "REPLACE_WITH_A_VALID_USER_ID_YOU_CAN_TEST_WITH", name: "Test User", lastMessage: "Click to chat" })}>
            <div className="avatar">
              <img src="/assets/images/ellipse_37.png" alt="User Avatar" />
            </div>
            <div className="contact-info">
              <span className="name">Test User</span>
              <span className="last-message">Click to chat</span>
            </div>
          </div>
          {/* Add more contacts here or load dynamically */}
        </div>

        <div className="current-user-profile">
          <div className="avatar">
            <img src="/assets/images/ellipse_37.png" alt="Current User Avatar" />
          </div>
          <div className="username">
            {localStorage.getItem('userName') || "User"}
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
            {Array.isArray(messages) && messages.map((msg, index) => (
              <div
                key={msg.tempId || msg._id || index} {/* Use tempId or _id as key */}
                className={`message ${msg.sender === localStorage.getItem("userId") ? "sent" : "received"}`}
              >
                {msg.fileUrl && (
                  <div className="message-file">
                    {msg.fileType?.startsWith("image/") ? (
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
                  {formatTime(msg.date)}
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