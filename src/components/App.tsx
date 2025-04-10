// App.tsx
import React, { useState, useEffect, useRef } from 'react';
import JoinOrCreateRoom from './JoinOrCreateRoom';
import ChatArea from './ChatArea';
import { SocketMessageTypes } from 'teleparty-websocket-lib';
import useTeleparty from '../hooks/useTeleparty';
import useSessionStorage from '../hooks/useSessionStorage';

enum View {
  JOIN = 'join',
  CHAT = 'chat',
}

const SESSION_NICKNAME_KEY = 'chatAppNickname';
const SESSION_ROOM_ID_KEY = 'chatAppRoomId';

function App() {
  const [currentView, setCurrentView] = useState<View>(View.JOIN);
  const [currentNickname, setCurrentNickname, clearNickname] = useSessionStorage<string | null>(
    SESSION_NICKNAME_KEY,
    null
  );
  const [roomId, setRoomId, clearRoomId] = useSessionStorage<string | null>(
    SESSION_ROOM_ID_KEY,
    null
  );

  const { messages, sendMessage, createChatRoom, joinChatRoom, isConnected, someoneTyping, sendTypingStatus, connectedUser } = useTeleparty();
  const hasAttemptedRejoin = useRef(false);
  const [joinError, setJoinError] = useState<string>();

  useEffect(() => {
    if (currentNickname && roomId) {
      setCurrentView(View.CHAT);

      if (isConnected && !hasAttemptedRejoin.current) {
        hasAttemptedRejoin.current = true;
        setTimeout(() => {
          joinChatRoom(currentNickname, roomId).catch(() => {
            // Rejoin failed
            clearNickname();
            clearRoomId();
            setCurrentView(View.JOIN);
          });
        }, 2000);
      }
    } else if (!isConnected) {
      hasAttemptedRejoin.current = false;
    } else {
      setCurrentView(View.JOIN);
    }
  }, [isConnected, joinChatRoom]);

  const handleCreateRoom = async (nickname: string) => {
    setCurrentNickname(nickname);
    const newRoomId = await createChatRoom(nickname);
    if (newRoomId) {
      setRoomId(newRoomId);
      setCurrentView(View.CHAT);
    } else {
      setJoinError('Failed to create room.');
    }
  };

  const handleJoinRoom = async (roomIdToJoin: string, nickname: string) => {
    try {
      await joinChatRoom(nickname, roomIdToJoin);
      setCurrentView(View.CHAT);
      setCurrentNickname(nickname);
      setRoomId(roomIdToJoin);
    } catch (error: any) {
      setJoinError(`Failed to join: ${error.message}`);
    }
  };

  const handleSendMessage = (message: string) => {
    sendMessage(SocketMessageTypes.SEND_MESSAGE, { body: message });
  };

  const handleLeaveRoom = () => {
    clearNickname();
    clearRoomId();
    setCurrentView(View.JOIN);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1>Teleparty Chat</h1>
      {currentView === View.JOIN && (
        <JoinOrCreateRoom
          joinError={joinError}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}
      {currentView === View.CHAT && currentNickname && roomId && (
        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          roomId={roomId}
          onLeaveRoom={handleLeaveRoom}
          sendTypingStatus={sendTypingStatus}
          someoneTyping={someoneTyping}
          connectedUser={connectedUser}
        />
      )}
    </div>
  );
}

export default App;
