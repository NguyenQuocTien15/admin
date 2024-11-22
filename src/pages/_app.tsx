import { HeaderComponent, SiderComponent } from "@/components";
import { Layout, Button } from "antd"; // Import Button từ antd
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, messaging, getToken, onMessage } from "../firebase/firebaseConfig";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, doc, query, where, getDocs, setDoc } from "firebase/firestore";

const db = getFirestore();
const { Content } = Layout;

// Hàm đăng nhập và lấy FCM token
const loginAdmin = async (email: string, password: string, router: any) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const adminDocRef = doc(db, "admin", "GHB7CFL8uL5qxSFchhjb"); // Sử dụng ID tài liệu cố định
    const token = await getToken(messaging, { vapidKey: "BBoe6XAY4SRcbIw1mkrzAoJTUBKivE6_moxMs6Ra3GdRXyJPcYZDsRz4-aIoF9QWqU-Nb6BBGdqs5Ygi8-yLvmc" });

    // Cập nhật UID và FCM token
    await setDoc(adminDocRef, {
      uid: user.uid,
      fcmToken: token || ""
    }, { merge: true });

    console.log("Đã lưu FCM Token và UID vào Firestore!");
    router.push("/home");
  } catch (error) {
    console.error("Đăng nhập thất bại:", error);
    router.push("/login");
  }
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const auth = getAuth();

  // Đăng nhập admin mặc định
  const defaultAdminLogin = async () => {
  try {
    const email = "admin@gmail.com"; // Email mặc định
    const password = "123123"; // Mật khẩu mặc định
    await loginAdmin(email, password, router);
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
  }
};

  // Thực thi đăng nhập mặc định khi load ứng dụng
  useEffect(() => {
    defaultAdminLogin();
  }, []);

  // Kiểm tra trạng thái xác thực
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Đăng xuất
  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  // Đăng ký Service Worker để nhận thông báo
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker đăng ký thành công:", registration);
        })
        .catch((error) => {
          console.error("Service Worker đăng ký thất bại:", error);
        });
    }
  }, []);

  // Lắng nghe thông báo foreground
  useEffect(() => {
    if (typeof window !== "undefined") {
      onMessage(messaging, (payload) => {
        console.log("Thông báo foreground nhận được:", payload);
        alert(`Tin nhắn mới: ${payload.notification.title} - ${payload.notification.body}`);
      });
    }
  }, []);

  const isLoginPage = router.pathname === "/login";

  return (
    <Layout>
      {!isLoginPage && <HeaderComponent />}
      <Layout>
        {!isLoginPage && <SiderComponent />}
        <Content>
          <div className="container-fluid">
            <div className="container p-4">
              <Component {...pageProps} />
            </div>
          </div>
        </Content>
      </Layout>

      {/* Nút Logout */}
      {!isLoginPage && (
        <div className="logout-container" style={{ position: "absolute", top: "20px", right: "20px" }}>
          <Button onClick={handleLogout} type="primary">
            Logout
          </Button>
        </div>
      )}
    </Layout>
  );
}
