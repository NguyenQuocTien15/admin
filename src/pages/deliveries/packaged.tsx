import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout"; // Adjust path as needed
import { HeadComponent } from "@/components";
import { Button, Table, Tooltip } from "antd";
import { collection, doc, getDoc, getDocs, query, updateDoc, where, addDoc ,serverTimestamp} from "firebase/firestore";
import { fs } from "@/firebase/firebaseConfig";

const Package: React.FC = () => {
  const [orders, setOrders] = useState();
  const [loading, setLoading] = useState(true); // To manage loading state

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const orderRef = collection(fs, "orders");
      const q = query(orderRef, where("orderStatusId", "==", "3"));
      const snapshot = await getDocs(q);

      const ordersData = snapshot.docs.map(async (doc) => {
        const order = doc.data();
        const orderStatusName = await getOrderStatusName(order.orderStatusId);
        const paymentMethodName = await getPaymentMethodName(
          order.paymentMethodId
        );
        const { displayName, phoneNumber } = await getUserOrder(order.userId);

        return {
          id: doc.id,
          ...order,
          orderStatusName,
          paymentMethodName,
          displayName,
          phoneNumber,
        };
      });
//@ts-ignore
      setOrders(await Promise.all(ordersData));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusName = async (orderStatusId: string) => {
    if (!orderStatusId) return "Unknown";

    try {
      const orderStatusDoc = await getDoc(
        doc(fs, "orderStatus", orderStatusId)
      );
      return orderStatusDoc.exists()
        ? orderStatusDoc.data().orderStatusName
        : "Unknown";
    } catch (error) {
      console.error("Error fetching order status:", error);
      return "Unknown";
    }
  };
  const getPaymentMethodName = async (id: string) => {
    if (!id) return "Unknown";

    try {
      const paymentMethodDoc = await getDoc(doc(fs, "paymentMethod", id));
      return paymentMethodDoc.exists()
        ? paymentMethodDoc.data().paymentMethodName
        : "Unknown";
    } catch (error) {
      console.error("Error fetching order status:", error);
      return "Unknown";
    }
  };
  const getUserOrder = async (id: string) => {
    if (!id) return { displayName: "Unknown", phoneNumber: "Unknown" };

    try {
      const userDoc = await getDoc(doc(fs, "users", id));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          displayName: userData.displayName || "Unknown",
          phoneNumber: userData.phoneNumber || "Unknown",
        };
      } else {
        return { displayName: "Unknown", phoneNumber: "Unknown" };
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return { displayName: "Unknown", phoneNumber: "Unknown" };
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);
//them thong bao don hang dang chuan bi vao bang notifications
const addNotification = async (
  userId: string,
  orderId: string,
  status: string
) => {
  try {
    await addDoc(collection(fs, "notifications"), {
      userId,
      orderId,
      title: "Trạng thái đơn hàng",
      body: `Đơn hàng của bạn (#${orderId}) đã chuyển sang trạng thái: ${status}`,
      status,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding notification:", error);
  }
};
//thong bao don hang dang chuan bi

//gui thong bao vao app khach hang  // Hàm gửi thông báo FCM
const sendNotification = async (
  userId: string,
  orderId: string,
  status: string
) => {
  try {
    const userDoc = await getDoc(doc(fs, "users", userId));
    if (!userDoc.exists()) {
      console.error("User not found");
      return;
    }

    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken; // Đảm bảo token được lưu khi user đăng nhập

    if (!fcmToken) {
      console.error("FCM token not found for user:", userId);
      return;
    }

    // Tạo payload thông báo
    const message = {
      token: fcmToken,
      notification: {
        title: "Trạng thái đơn hàng",
        body: `Đơn hàng của bạn (#${orderId}) đã chuyển sang trạng thái: ${status}`,
      },
      data: {
        orderId,
        status,
      },
    };

    // Gửi thông báo qua FCM
    //const response = await admin.messaging().send(message);
  //  console.log("Notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
//ham xu li dong goi va gui thong bao cho khach hang
//gui thong bao vao app khach hang

  const columns = [
    { title: "Name", key: "displayName", dataIndex: "displayName" },
    { title: "Phone", key: "phoneNumber", dataIndex: "phoneNumber" },
    {
      title: "Product",
      key: "items",
      dataIndex: "items",

      render: (items: any[]) =>
        items.map((item) => (
          <p>
            {item.productId}
            <br></br> {item.color} - {item.size} - {item.quantity}
            <br></br>
          </p>
        )),
    },
    { title: "Address", key: "address", dataIndex: "address" },
    {
      title: "Shipper",
      key: "shipperId",
      dataIndex: "shipperId",
      render: (shipperId: any) => shipperId || "Null",
    },
    {
      title: "Payment Method",
      key: "paymentMethodName",
      dataIndex: "paymentMethodName",
    },
    {
      title: "Status",
      key: "orderStatusName",
      dataIndex: "orderStatusName",
      render: (text: string) => (
        <div style={{ backgroundColor: "#e6f7ff", padding: "8px" }}>{text}</div>
      ),
    },
    {
      title: "Date",
      key: "timestamp",
      dataIndex: "timestamp",
    },
  ];
  return (
    <Layout>
      <div className="mt-3">
        <HeadComponent
          title="Order Management"
          pageTitle="Đóng gói"
        ></HeadComponent>
      </div>
      <Table columns={columns} dataSource={orders}> </Table>
    </Layout>
  );
};

export default Package;
