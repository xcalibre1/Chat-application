import React, { useState } from 'react';
import './JoinOrCreateRoom.css';
import { localeConfig } from '../constant';

interface JoinOrCreateRoomProps {
  onCreateRoom: (nickname: string) => void;
  onJoinRoom: (roomId: string, nickname: string) => void;
}

const JoinOrCreateRoom: React.FC<JoinOrCreateRoomProps> = ({ onCreateRoom, onJoinRoom }) => {
  const [createNickname, setCreateNickname] = useState('');
  const [joinNickname, setJoinNickname] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleCreateClick = () => {
    if (createNickname.trim()) {
      onCreateRoom(createNickname);
    } else {
      alert(localeConfig.PLEASE_ENTER_A_NICKNAME_TO_CREATE_A_ROOM);
    }
  };

  const handleJoinClick = () => {
    if (roomId.trim() && joinNickname.trim()) {
      onJoinRoom(roomId, joinNickname);
    } else {
      alert(localeConfig.PLEASE_ENTER_A_ROOM_ID_AND_A_NICKNAME_TO_JOIN);
    }
  };

  return (
    <div className="join-container">
      <h2>{localeConfig.JOIN_OR_CREATE_A_CHAT_ROOM}</h2>
      <div>
        <h3>{localeConfig.CREATE_NEW_ROOM}</h3>
        <div className="input-group">
          <label htmlFor="create-nickname-input">{localeConfig.NICKNAME}:</label>
          <input
            type="text"
            id="create-nickname-input"
            value={createNickname}
            onChange={(e) => setCreateNickname(e.target.value)}
            placeholder={localeConfig.YOUR_NICKNAME}
          />
        </div>
        <div className="button-group">
          <button onClick={handleCreateClick} className="create-button">
            {localeConfig.CREATE_NEW_ROOM}
          </button>
        </div>
      </div>
      <div className="separator">
        <span>{localeConfig.OR}</span>
      </div>
      <div>
        <h3>{localeConfig.JOIN_EXISTING_ROOM}</h3>
        <div className="input-group">
          <label htmlFor="join-nickname-input">{localeConfig.NICKNAME}:</label>
          <input
            type="text"
            id="join-nickname-input"
            value={joinNickname}
            onChange={(e) => setJoinNickname(e.target.value)}
            placeholder={localeConfig.YOUR_NICKNAME}
          />
        </div>
        <div className="input-group">
          <label htmlFor="room-id-input">{localeConfig.ROOM_ID}:</label>
          <input
            type="text"
            id="room-id-input"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder={localeConfig.ENTER_ROOM_ID}
          />
        </div>
        <div className="button-group">
          <button onClick={handleJoinClick} className="join-button">
            {localeConfig.JOIN_ROOM}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinOrCreateRoom;