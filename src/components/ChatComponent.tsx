import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { Timestamp as FirebaseTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import styles from "../styles/chat.module.css"
interface Message {
  userId: string;
  adminId: string;
  message: string;
  timestamp: FirebaseTimestamp;
}

interface ChatComponentProps {
  userId: string;
  adminId: string;
  messages: Message[];
  newMessage: string;
  setNewMessage: Dispatch<SetStateAction<string>>;
  onSendMessage: () => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  userId,
  adminId,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
// Tạo Firebase Timestamp (ví dụ)
const firebaseTimestamp = FirebaseTimestamp.fromDate(new Date());
  useEffect(() => {
    // Auto-scroll to the bottom when a new message arrives
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer}>
        {messages && Array.isArray(messages) && messages.length>0 ? ( messages.map((msg, index) => (
          <div
            key={index}
            className={msg.userId  === userId  ? styles.userMessage  : styles.adminMessage}
          >
            <div className={styles.messageHeader}>
              <span className={styles.timestamp}>
              
              </span>
            </div>
            <div>{msg.message}</div>
          </div>
        ))
      ) : (
          <div> No </div>
          )}
        {/* Add a ref at the end to scroll to the latest message */}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className={styles.messageInput}
        />
        <button onClick={onSendMessage} className={styles.sendButton}>Gửi</button>
      </div>
    </div>
  );
};

export default ChatComponent;
