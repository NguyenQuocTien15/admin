import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, onSnapshot } from "firebase/firestore";
import {fs} from "../firebase/firebaseConfig"

// Khởi tạo Firestore


// Hàm tìm cuộc trò chuyện giữa admin và user
export async function getChatWithUser(userId: string): Promise<string | null> {
  const chatsRef = collection(fs, "chats");
  const q = query(chatsRef, where("user_ID", "==", userId));

  const querySnapshot = await getDocs(q);
  const chatData = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  if (chatData.length > 0) {
    // Lấy chatId đầu tiên nếu tồn tại
    const chatId = chatData[0].id;
    console.log("Chat ID:", chatId);
    return chatId; // Trả về chatId để có thể lấy tin nhắn
  } else {
    console.log("No chat found with this user.");
    return null;
  }
}

// Hàm lấy tất cả tin nhắn của một cuộc trò chuyện
export async function getMessagesForChat(chatId: string) {
  const messagesRef = collection(fs, `chats/${chatId}/messages`);
  const q = query(messagesRef, orderBy("timestamp"));

  const querySnapshot = await getDocs(q);
  const messages = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  return messages;
}

// Hàm gửi tin nhắn từ admin hoặc user
export async function sendMessage(chatId: string, text: string, senderId: string) {
  const messagesRef = collection(fs, `chats/${chatId}/messages`);

  await addDoc(messagesRef, {
    text,
    sender_ID: senderId,
    timestamp: serverTimestamp()
  });
}

// Hàm lắng nghe tin nhắn theo thời gian thực
export function listenToMessages(chatId: string, callback: (messages: any[]) => void) {
  const messagesRef = collection(fs, `chats/${chatId}/messages`);
  const q = query(messagesRef, orderBy("timestamp"));

  onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
}
