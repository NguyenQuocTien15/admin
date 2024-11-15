//@ts-ignore

import * as functions from "firebase-functions/v2";
//@ts-ignore
import * as admin from "firebase-admin";

admin.initializeApp();

export const sendChatNotification = functions.firestore
//@ts-ignore
  .onDocumentCreated("chats/{chatId}/messages/{messageId}", async (event) => {
    const messageData = event.data?.data();
    if (!messageData) return;

    const {senderId, message} = messageData;
    const chatId = event.params.chatId;

    const chatRef = admin
      .firestore()
      .collection("chats")
      .doc(chatId);
    const chatDoc = await chatRef.get();
    const chatData = chatDoc.data();

    if (!chatData) return;

    const recipientId =
      senderId === chatData.userId ?
        chatData.adminId :
        chatData.userId;


    const userRef = admin
      .firestore()
      .collection("users")
      .doc(recipientId);

    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userData?.fcmToken) return;


    const payload = {
      notification: {
        title: "Tin nhắn mới",
        body: message,
        clickAction:
          "FLUTTER_NOTIFICATION_CLICK",
      },
    };


    await admin
      .messaging()
      .sendToDevice(userData.fcmToken, payload);
  });
