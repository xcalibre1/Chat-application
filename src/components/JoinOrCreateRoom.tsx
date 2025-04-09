import React, { useState } from 'react';
import './JoinOrCreateRoom.css';
import { localeConfig } from '../constant';
import InputField from './InputField';

interface JoinOrCreateRoomProps {
  onCreateRoom: (nickname: string) => void;
  onJoinRoom: (roomId: string, nickname: string) => void;
  joinError?: string;
}

const JoinOrCreateRoom: React.FC<JoinOrCreateRoomProps> = ({
  onCreateRoom,
  onJoinRoom,
  joinError
}) => {
  const [createNickname, setCreateNickname] = useState('');
  const [joinNickname, setJoinNickname] = useState('');
  const [roomId, setRoomId] = useState('');

  const [errors, setErrors] = useState({
    createNickname: null as string | null,
    joinNickname: null as string | null,
    roomId: null as string | null
  });

  const validateAndCreate = () => {
    if (!createNickname.trim()) {
      setErrors((prev) => ({ ...prev, createNickname: localeConfig.PLEASE_ENTER_A_NICKNAME }));
      return;
    }
    setErrors((prev) => ({ ...prev, createNickname: null }));
    onCreateRoom(createNickname);
  };

  const validateAndJoin = () => {
    const newErrors = {
      joinNickname: joinNickname.trim() ? null : localeConfig.PLEASE_ENTER_A_NICKNAME,
      roomId: roomId.trim() ? null : localeConfig.PLEASE_ENTER_A_ROOM_ID,
    };

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (!newErrors.joinNickname && !newErrors.roomId) {
      onJoinRoom(roomId, joinNickname);
    }
  };

  return (
    <div className="join-container">
      <h2>{localeConfig.JOIN_OR_CREATE_A_CHAT_ROOM}</h2>
      {joinError && <h3 className="error-message">{joinError}</h3>}
      <div>
        <h3>{localeConfig.CREATE_NEW_ROOM}</h3>
        <InputField
          id="create-nickname-input"
          label={localeConfig.NICKNAME}
          value={createNickname}
          onChange={(e) => setCreateNickname(e.target.value)}
          placeholder={localeConfig.YOUR_NICKNAME}
          error={errors.createNickname}
        />
        <div className="button-group">
          <button onClick={validateAndCreate} className="create-button">
            {localeConfig.CREATE_NEW_ROOM}
          </button>
        </div>
      </div>

      <div className="separator">
        <span>{localeConfig.OR}</span>
      </div>
      <div>
        <h3>{localeConfig.JOIN_EXISTING_ROOM}</h3>
        <InputField
          id="join-nickname-input"
          label={localeConfig.NICKNAME}
          value={joinNickname}
          onChange={(e) => setJoinNickname(e.target.value)}
          placeholder={localeConfig.YOUR_NICKNAME}
          error={errors.joinNickname}
        />
        <InputField
          id="room-id-input"
          label={localeConfig.ROOM_ID}
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder={localeConfig.ENTER_ROOM_ID}
          error={errors.roomId}
        />
        <div className="button-group">
          <button onClick={validateAndJoin} className="join-button">
            {localeConfig.JOIN_ROOM}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinOrCreateRoom;
