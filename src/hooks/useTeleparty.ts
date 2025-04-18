import { useState, useEffect, useRef, useCallback } from 'react';
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

interface TelepartyHookResult {
  client: TelepartyClient | null;
  messages: ChatMessage[];
  isConnected: boolean;
  someoneTyping: { anyoneTyping: boolean; usersTyping: string[] };
  sendMessage: (type: SocketMessageTypes, data: { body: string }) => void;
  createChatRoom: (nickname: string) => Promise<string | null>;
  joinChatRoom: (nickname: string, roomId: string) => Promise<void>;
  sendTypingStatus: (isTyping: boolean) => void;
  connectedUser: string;
  connect: () => void
}

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000;


function useTeleparty(): TelepartyHookResult {
  const [client, setClient] = useState<TelepartyClient | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatMessagesRef = useRef<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [someoneTyping, setSomeoneTyping] = useState<{ anyoneTyping: boolean; usersTyping: string[] }>({anyoneTyping: false, usersTyping: []}); // New state
  const [connectedUser, setConnectedUser] = useState<string>("");
  const reconnectAttempts = useRef(0);
  const reconnectDelay = useRef(INITIAL_RECONNECT_DELAY);

  const connect = useCallback(() => {
    const eventHandler: SocketEventHandler = {
      onConnectionReady: () => {
        console.log('Teleparty Connection Ready');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        reconnectDelay.current = INITIAL_RECONNECT_DELAY;
      
      },
      onClose: () => {
        setIsConnected(false);
        setSomeoneTyping({anyoneTyping: false, usersTyping: []});
        console.log(`Teleparty Socket Closed`);
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          setTimeout(() => {
              reconnectAttempts.current++;
              connect();
              reconnectDelay.current *= 2;
          }, reconnectDelay.current);
      } else {
          console.log('Max reconnection attempts reached. Please refresh the page.');
      }
        
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
        } else if (message.type === "userId") {
          const messageData = message.data;
          setConnectedUser(messageData.userId);
        }
        else if (message.type === SocketMessageTypes.SET_TYPING_PRESENCE) {
          const typingData: { anyoneTyping: boolean; usersTyping: string[] } = message.data;
          setSomeoneTyping(typingData);
        }
      },
    };

    setClient(new TelepartyClient(eventHandler));
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (client) {
        client.teardown();
      }
    };
  }, [connect]);

  const sendMessage = useCallback(
    (type: SocketMessageTypes, data: { body: string }) => {
      if (client && isConnected) {
        client.sendMessage(type, data);
      } else {
        console.error('Teleparty client not initialized or not connected.');
      }
    },
    [client, isConnected]
  );

  const createChatRoom = useCallback(
    async (nickname: string): Promise<string | null> => {
      if (client && isConnected) {
        try {
          const roomIdResult = await client.createChatRoom(nickname);
          return roomIdResult;
        } catch (error) {
          console.error('Error creating room:', error);
          return null;
        }
      } else {
        console.error('Teleparty client not initialized or not connected.');
        return null;
      }
    },
    [client, isConnected]
  );

  const joinChatRoom = useCallback(
    (nickname: string, roomId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (client && isConnected) {
          client.joinChatRoom(nickname, roomId)
            .then((response) => {
              if (Array.isArray(response.messages)) {
                const formattedMessages: ChatMessage[] = response.messages.map((msg: any) => ({
                  isSystemMessage: msg.isSystemMessage,
                  userIcon: msg.userIcon,
                  userNickname: msg.userNickname,
                  body: msg.body,
                  permId: msg.permId,
                  timestamp: msg.timestamp,
                }));  
                
                chatMessagesRef.current = formattedMessages;
                setMessages(formattedMessages);
              }
              resolve();
            })
            .catch((e) => reject(e));
        } else {
          const errorMessage = 'Teleparty client not initialized or not connected.';
          console.error(errorMessage);
          reject(new Error(errorMessage));
        }
      });
    },
    [client, isConnected]
  );

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (client && isConnected) {
        client.sendMessage(SocketMessageTypes.SET_TYPING_PRESENCE, {
          typing: isTyping,
        });
      } else {
        console.error('Could not send typing status: client not ready.');
      }
    },
    [client, isConnected]
  );


  return { client, messages, isConnected, sendMessage, createChatRoom, joinChatRoom, sendTypingStatus, someoneTyping, connectedUser, connect };
}

export default useTeleparty;