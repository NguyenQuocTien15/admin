import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout"; // Adjust path as needed
import { HeadComponent } from "@/components";
import { Button, Table, Tooltip } from "antd";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { fs } from "@/firebase/firebaseConfig";

const Preparing: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Manage loading state

  // Fetch orders from Firestore
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const orderRef = collection(fs, "orders");
      const q = query(orderRef, where("orderStatusId", "==", "2"));
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
          userId: order.userId,
          ...order,
          orderStatusName,
          paymentMethodName,
          displayName,
          phoneNumber,
        };
      });
      setOrders(await Promise.all(ordersData));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order status name
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

  // Fetch payment method name
  const getPaymentMethodName = async (id: string) => {
    if (!id) return "Unknown";

    try {
      const paymentMethodDoc = await getDoc(doc(fs, "paymentMethod", id));
      return paymentMethodDoc.exists()
        ? paymentMethodDoc.data().paymentMethodName
        : "Unknown";
    } catch (error) {
      console.error("Error fetching payment method:", error);
      return "Unknown";
    }
  };

  // Fetch user details for the order
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
      }
      return { displayName: "Unknown", phoneNumber: "Unknown" };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return { displayName: "Unknown", phoneNumber: "Unknown" };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Add notification to Firestore
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

  // Send FCM notification
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
      const fcmToken = userData?.fcmToken;

      if (!fcmToken) {
        console.error("FCM token not found for user:", userId);
        return;
      }

      console.log(`Notification prepared for user ${userId} with token ${fcmToken}`);
      // Add your FCM notification sending logic here.
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Update order to "preparing" status
  const handlePreparingOrder = async (orderId: string) => {
    try {
      const orderRef = doc(fs, "orders", orderId);
      await updateDoc(orderRef, {
        orderStatusId: "3",
      });
      fetchOrders();
      alert("Đơn hàng đã được chuyển sang trạng thái 'Đã đóng gói'!");
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng!");
    }
  };

  // Handle preparing order and sending notifications
  const handlePreparingOrderWithNotification = async (
    orderId: string,
    userId: string
  ) => {
    if (!orderId || !userId) {
      console.error("Missing orderId or userId");
      alert("Thông tin đơn hàng không đầy đủ!");
      return;
    }

    try {
      await handlePreparingOrder(orderId);
      await addNotification(userId, orderId, "Đã đóng gói và chờ vận chuyển");
      await sendNotification(userId, orderId, "Đã đóng gói và chờ vận chuyển");
    } catch (error) {
      console.error("Error handling order and notification:", error);
    }
  };

  const columns = [
    { title: "Name", key: "displayName", dataIndex: "displayName" },
    { title: "Phone", key: "phoneNumber", dataIndex: "phoneNumber" },
    {
      title: "Product",
      key: "items",
      dataIndex: "items",
      render: (items: any[]) =>
        items.map((item) => (
          <p key={item.productId}>
            {item.productId}
            <br /> {item.color} - {item.size} - {item.quantity}
          </p>
        )),
    },
    { title: "Address", key: "address", dataIndex: "address" },
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
      title: "Action",
      dataIndex: "id",
      render: (_: any, record: any) => (
        <Tooltip title="Đóng gói">
          <Button
            className="btn-primary"
            onClick={() =>
              record.id && record.userId
                ? handlePreparingOrderWithNotification(record.id, record.userId)
                : console.error("Missing order id or user id")
            }
          >
            Đóng gói
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Layout>
      <div className="mt-3">
        <HeadComponent title="Order Management" pageTitle="Đang chuẩn bị" />
      </div>
      <Table columns={columns} dataSource={orders} loading={loading} />
    </Layout>
  );
};

export default Preparing;
