import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp from Firebase SDK
import styles from "../styles/chat.module.css";

interface MessageModel {
  id: string;
  message: string;
  sender_ID: string;
  createdAt: Timestamp | Date | string | null; // createdAt can be Timestamp, Date, string, or null
}

interface ChatComponentProps {
  userId: string;
  adminId: string;
  messages: MessageModel[];
  newMessage: string;
  setNewMessage: Dispatch<SetStateAction<string>>;
  onSendMessage: () => void;
}

// Hàm parse createdAt, nếu không hợp lệ thì trả về null
const parseCreatedAt = (createdAt: any): Date | null => {
  if (createdAt instanceof Timestamp) {
    return createdAt.toDate(); // If it's a Timestamp, convert to Date
  }
  const parsedDate = new Date(createdAt);
  return !isNaN(parsedDate.getTime()) ? parsedDate : null;
};

const ChatComponent: React.FC<ChatComponentProps> = ({
  userId,
  adminId,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer}>
        {messages.length > 0 ? (
          messages.map((msg) => {
            const parsedDate = parseCreatedAt(msg.createdAt); // Safely parse createdAt to Date
            const messageCreatedAt = parsedDate ? format(parsedDate, 'HH:mm') : 'N/A';

            return (
              <div
                key={msg.id}
                className={msg.sender_ID === userId ? styles.userMessage : styles.adminMessage}
              >
                
                <div>{msg.message}</div>
                <div className={styles.messageHeader}>
                  <span className={styles.createdAt}>
                    {messageCreatedAt || 'Chưa có thời gian'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div>No messages</div>
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
