import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Khi có tin nhắn mới được thêm vào subcollection "messages" của từng chat
export const sendChatNotification = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const messageData = snapshot.data();
    if (!messageData) return;

    const { sender_ID, message } = messageData;
    const chatId = context.params.chatId;

    // Lấy ID của người nhận (user_ID hoặc admin_ID)
    const chatRef = admin.firestore().collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();
    const chatData = chatDoc.data();

    if (!chatData) return;

    const recipientId = sender_ID === chatData.user_ID ? chatData.admin_ID : chatData.user_ID;

    // Lấy token của người nhận từ collection users (giả sử bạn lưu token trong `fcmToken`)
    const userRef = admin.firestore().collection('users').doc(recipientId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userData?.fcmToken) return;

    // Tạo payload thông báo
    const payload = {
      notification: {
        title: 'Tin nhắn mới',
        body: message,
        clickAction: 'FLUTTER_NOTIFICATION_CLICK', // hoặc tùy vào nền tảng client
      },
    };

    // Gửi thông báo
    await admin.messaging().sendToDevice(userData.fcmToken, payload);
  });
