import { useState, useEffect } from 'react';
import { fs } from '../../firebase/firebaseConfig';
import { collection, getDocs, addDoc, doc, query, where, orderBy } from 'firebase/firestore';
import styles from '../../styles/chat.module.css';
import ChatComponent from '../../components/ChatComponent';

const ChatAdmin = () => {
  const adminId = "GHB7CFL8uL5qxSFchhjb"; // ID của admin
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Lấy danh sách người dùng từ Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const userCollection = collection(fs, "users");
      const userSnapshot = await getDocs(userCollection);
      const userList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      //@ts-ignore
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  // Hàm tìm chat ID hoặc tạo mới nếu chưa tồn tại
  const getOrCreateChatWithUser = async (userId: string) => {
    if (!userId) {
      console.error('User ID is undefined or invalid');
      return;
    }
  
    const chatsRef = collection(fs, "chats");
    const q = query(chatsRef, where("user_ID", "==", userId));
  
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const existingChatId = querySnapshot.docs[0].id;
        setChatId(existingChatId);
        return existingChatId;
      } else {
        const newChatDoc = await addDoc(chatsRef, {
          user_ID: userId,
          admin_ID: adminId,
        });
        setChatId(newChatDoc.id);
        return newChatDoc.id;
      }
    } catch (error) {
      console.error('Error fetching or creating chat:', error);
    }
  };
  

  // Hàm xử lý khi nhấn vào người dùng
  const handleUserClick = async (userId) => {
    setSelectedUserId(userId);
    setMessages([]); // Reset messages khi chọn người dùng mới

    const currentChatId = await getOrCreateChatWithUser(userId);
    
    // Lấy các tin nhắn của cuộc trò chuyện này
    const messageQuery = query(
      collection(fs, `chats/${currentChatId}/messages`), // Subcollection messages của chatId
     orderBy("createdAt")
    );
    const messageSnapshot = await getDocs(messageQuery);
    // Kiểm tra nếu có tin nhắn trả về từ Firestore
  if (!messageSnapshot.empty) {
    const messageList = messageSnapshot.docs.map(doc => doc.data());
    setMessages(messageList); // Cập nhật state messages với các tin nhắn đã lấy
  } else {
    setMessages([]); // Nếu không có tin nhắn, set lại messages là rỗng
  }
  };

  // Hàm gửi tin nhắn
  const handleSendMessage = async () => {
    if (newMessage.trim() && chatId) {
      await addDoc(collection(fs, `chats/${chatId}/messages`), { // Thêm vào subcollection messages
        sender_ID: adminId,
        message: newMessage,
        createdAt: new Date(),
      });

      setNewMessage(''); // Reset ô nhập tin nhắn sau khi gửi
      handleUserClick(selectedUserId); // Lấy lại tin nhắn sau khi gửi
    }
  };

  return (
    <div className={styles.container}>
      {/* Cột danh sách người dùng */}
      <div className={styles.userList}>
        <h3>Danh sách người dùng</h3>
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => handleUserClick(user.id)}
            className={selectedUserId === user.id ? styles.selectedUser : styles.user}
          >
            {user.displayName}
          </div>
        ))}
      </div>

      {/* Cột chat */}
      {selectedUserId ? (
        <ChatComponent
          userId={selectedUserId}
          adminId={adminId}
          messages={messages} // Truyền messages vào chat component
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <p>Chọn người dùng để bắt đầu chat</p>
      )}
    </div>
  );
};

export default ChatAdmin;
