import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  sendTypingStatus: (isTyping: boolean) => void;
  someoneTyping: { anyoneTyping: boolean; usersTyping: string[] };
  connectedUser: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
  roomId,
  onLeaveRoom,
  sendTypingStatus,
  someoneTyping,
  connectedUser
}) => {
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim()) {
      console.log("newMessage", newMessage);
      onSendMessage(newMessage);
      setNewMessage('');
      setIsUserTyping(false);
      sendTypingStatus(false);
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    }
  }, [newMessage, onSendMessage, sendTypingStatus]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNewMessage(text);

    // Typing presence logic
    if (text.trim() && !isUserTyping) {
      setIsUserTyping(true);
      sendTypingStatus(true);
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      typingTimeout.current = setTimeout(() => {
        setIsUserTyping(false);
        sendTypingStatus(false);
      }, 1000); 
    } else if (!text.trim() && isUserTyping) {
      setIsUserTyping(false);
      sendTypingStatus(false);
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    } else if (text.trim() && isUserTyping) {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      typingTimeout.current = setTimeout(() => {
        setIsUserTyping(false);
        sendTypingStatus(false);
      }, 1000);
    }
  }, [isUserTyping, sendTypingStatus]);

  const isTypingShown = useMemo(() => {
      return Boolean(someoneTyping.usersTyping.find(id => id.includes(connectedUser)));
    
  }, [connectedUser, someoneTyping])


  return (
    <div className="chat-area-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{localeConfig.CHAT_ROOM}: {roomId}</h2>
        <button onClick={onLeaveRoom}>{localeConfig.LEAVE_ROOM}</button>
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

      {someoneTyping.anyoneTyping && !isTypingShown && (
        <div className="typing-indicator">{localeConfig.SOMEONE_IS_TYPING}</div>
      )}

      <div className="message-input-area">
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
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