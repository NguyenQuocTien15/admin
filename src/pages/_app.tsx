/** @format */

import { HeaderComponent, SiderComponent } from "@/components";
import { Layout } from "antd";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { messaging, getToken, onMessage } from "../firebase/firebaseConfig";

const { Header, Content } = Layout;

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Đăng ký Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker đăng ký thành công:", registration);
        })
        .catch((error) => {
          console.error("Service Worker đăng ký thất bại:", error);
        });
    }

    // Yêu cầu quyền nhận thông báo và lấy FCM token
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, { vapidKey: "BBoe6XAY4SRcbIw1mkrzAoJTUBKivE6_moxMs6Ra3GdRXyJPcYZDsRz4-aIoF9QWqU-Nb6BBGdqs5Ygi8-yLvmc" });
          console.log("FCM Token:", token);
          // Bạn có thể lưu token này vào Firestore hoặc server nếu cần
        }
      } catch (error) {
        console.error("Không thể lấy token FCM:", error);
      }
    };

    requestPermission();

    // Xử lý thông báo khi ứng dụng đang mở
    onMessage(messaging, (payload) => {
      console.log("Thông báo foreground nhận được:", payload);
      //@ts-ignore
      alert(`Tin nhắn mới: ${payload.notification.title} - ${payload.notification.body}`);
      // Tùy chỉnh để hiển thị thông báo trên UI
    });
  }, []);

  return (
    <Layout>
      <HeaderComponent />
      <Layout>
        <SiderComponent />
        <Content>
          <div className="container-fluid">
            <div className="container p-4">
              <Component {...pageProps} />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
