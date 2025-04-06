// hooks/useTeleparty.ts
import { useState, useEffect, useRef } from 'react';
import {
  TelepartyClient,
  SocketEventHandler,
  SocketMessageTypes,
  SessionChatMessage,
} from 'teleparty-websocket-lib';

interface ChatMessage {
  isSystemMessage: boolean;
  userIcon?: string;
  userNickname?: string;
  body: string;
  permId: string;
  timestamp: number;
}

function useTeleparty() {
  const [client, setClient] = useState<TelepartyClient | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatMessagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    const eventHandler: SocketEventHandler = {
      onConnectionReady: () => {
        console.log('Teleparty Connection Ready');
      },
      onClose: () => {
        console.log('Teleparty Socket Closed');
        alert('Connection to the chat server has been lost. Please reload the page.');
      },
      onMessage: (message: any) => {
        if (message.type === SocketMessageTypes.SEND_MESSAGE) {
          const chatMessage: SessionChatMessage = message.data;
          const newMessage: ChatMessage = {
            isSystemMessage: chatMessage.isSystemMessage,
            userIcon: chatMessage.userIcon,
            userNickname: chatMessage.userNickname,
            body: chatMessage.body,
            permId: chatMessage.permId,
            timestamp: chatMessage.timestamp,
          };
          chatMessagesRef.current = [...chatMessagesRef.current, newMessage];
          setMessages(chatMessagesRef.current);
        }
        // Handle other message types if needed
      },
    };

    const newClient = new TelepartyClient(eventHandler);
    setClient(newClient);
  }, []);

  const sendMessage = (type: SocketMessageTypes, data: any) => {
    if (client) {
      client.sendMessage(type, data);
    } else {
      console.error('Teleparty client not initialized.');
    }
  };

  const createChatRoom = async (nickname: string): Promise<string | null> => {
    if (client) {
      try {
        const roomIdResult = await client.createChatRoom(nickname);
        return roomIdResult;
      } catch (error) {
        console.error('Error creating room:', error);
        return null;
      }
    } else {
      console.error('Teleparty client not initialized.');
      return null;
    }
  };

  const joinChatRoom = (nickname: string, roomId: string): void => {
    if (client) {
      client.joinChatRoom(nickname, roomId);
    } else {
      console.error('Teleparty client not initialized.');
    }
  };

  return { client, messages, sendMessage, createChatRoom, joinChatRoom };
}

export default useTeleparty;