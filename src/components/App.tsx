// App.tsx
import React, { useState } from 'react';
import JoinOrCreateRoom from './JoinOrCreateRoom';
import ChatArea from './ChatArea';
import { SocketMessageTypes } from 'teleparty-websocket-lib';
import useTeleparty from '../hooks/useTeleparty';
enum View {
  JOIN = 'join',
  CHAT = 'chat',
}
function App() {
  const [currentView, setCurrentView] = useState<View>(View.JOIN);
  const [currentNickname, setCurrentNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const { messages, sendMessage, createChatRoom, joinChatRoom } = useTeleparty();

  const handleCreateRoom = async (nickname: string) => {
    setCurrentNickname(nickname);
    const newRoomId = await createChatRoom(nickname);
    if (newRoomId) {
      setRoomId(newRoomId);
      setCurrentView(View.CHAT);
    } else {
      alert('Failed to create room.');
    }
  };

  const handleJoinRoom = (roomIdToJoin: string, nickname: string) => {
    setCurrentNickname(nickname);
    setRoomId(roomIdToJoin);
    joinChatRoom(nickname, roomIdToJoin);
    setCurrentView(View.CHAT);
  };

  const handleSendMessage = (message: string) => {
    const sendMessageData = {
      body: message,
    };
    sendMessage(SocketMessageTypes.SEND_MESSAGE, sendMessageData);
  };

  const handleLeaveRoom = () => {
    setCurrentView(View.JOIN);
    setRoomId('');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1>Teleparty Chat</h1>
      {currentView === View.JOIN && (
        <JoinOrCreateRoom onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
      )}
      {currentView === View.CHAT && currentNickname && roomId && (
        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          roomId={roomId}
          onLeaveRoom={handleLeaveRoom} // Pass a handler to go back
        />
      )}
    </div>
  );
}

export default App;