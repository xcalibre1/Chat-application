import React, { useState, useRef, useEffect } from 'react';
import './ChatArea.css';
import { localeConfig } from '../constant';

interface ChatMessage {
  isSystemMessage: boolean;
  userIcon?: string;
  userNickname?: string;
  body: string;
  permId: string;
  timestamp: number;
}

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  roomId: string;
  onLeaveRoom: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage, roomId, onLeaveRoom }) => {
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-area-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{localeConfig.CHAT_ROOM}: {roomId}</h2>
        <button onClick={onLeaveRoom}>{localeConfig.LEAVE_ROOM}</button> {/* Button to trigger navigation back */}
      </div>
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isSystemMessage ? 'system-message' : 'user-message'}`}>
            {msg.isSystemMessage ? (
              <p className="system-text">{`${msg.userNickname}${localeConfig.IS_}${msg.body}`}</p>
            ) : (
              <>
                <strong className="nickname">{msg.userNickname}:</strong>
                <span className="message-body">{msg.body}</span>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="message-input-area">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={localeConfig.TYPE_YOUR_MESSAGE}
          className="message-input"
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage} className="send-button">
          {localeConfig.SEND}
        </button>
      </div>
    </div>
  );
};

export default ChatArea;