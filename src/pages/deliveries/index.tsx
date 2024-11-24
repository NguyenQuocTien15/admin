import { HeadComponent } from "@/components";
import Layout from "@/components/Layout";
import { fs } from "@/firebase/firebaseConfig";

import { Button, message, Modal, Space, Table, Tooltip } from "antd";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { FaCheck } from "react-icons/fa6";

const NewOrders = ({}) => {
  const router = useRouter();
  const [orders, setOrders] = useState();
  const [loading, setLoading] = useState(true); // To manage loading state

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const orderRef = collection(fs, "orders");
      const q = query(orderRef, where("orderStatusId", "==", "1"));
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

  //ham xu li xac nhan don hang
 const handleConfirmNewOrder = async (orderId: string) => {
   try {
     const orderRef = doc(fs, "orders", orderId); 
     await updateDoc(orderRef, {
       orderStatusId: "2", 
     });
     alert("Confirm order successfully");

     
     fetchOrders(); 
   } catch (error) {
     console.error("Error updating order status:", error);
   }
 }; 
 //ham xu li xac nhan don hang

//ham xu li xac huy don hang
 const handleDeleteOrder = async( orderId: string)=>{
   Modal.confirm({
     title: "Are you sure you want to cancel this order?",
     content: "This action cannot be undone.",
     okText: "Yes, cancel",
     cancelText: "No",
     onOk: async () => {
       try {
        const orderRef = doc(fs, "orders", orderId);
        await deleteDoc(orderRef);
        fetchOrders();
         message.success("Product deleted successfully");
       } catch (error: any) {
         console.error("Error delete order status:", error);
       }
     },
   });
  // try {
  //   const orderRef = doc(fs, 'orders', orderId)
  //   await deleteDoc(orderRef)
  //   fetchOrders();
  // } catch (error) {
  //   console.error("Error delete order status:", error);
  // }
 }
//ham xu li huy don hang

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
//gui thong bao vao app khach hang



//ham xu li xac nhan va gui thong bao cho khach hang
const handleConfirmOrderWithNotification = async (
  orderId: string,
  userId: string
) => {
  try {
    //@ts-ignore
    await handleConfirmNewOrder(orderId);
    await addNotification(userId, orderId, "Đã xác nhận và đang chuẩn bị");
    await sendNotification(userId, orderId, "Đã xác nhận và đang chuẩn bị");
   
  } catch (error) {
    console.error("Error handling order and notification:", error);
  }
};
//ham xu li xac nhan va gui thong bao cho khach hang
//ham xu li huy don va gui thong bao cho khach hang
const handleDeleteOrderWithNotification = async (
  orderId: string,
  userId: string
) => {
  try {
    //@ts-ignore
    await handleDeleteOrder(orderId);
    await addNotification(userId, orderId, "Đã hủy đơn");
    await sendNotification(userId, orderId, "Đã hủy đơn");
   
  } catch (error) {
    console.error("Error handling order and notification:", error);
  }
};
//ham xu li huy don va gui thong bao cho khach hang

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
    {
      title: "Action",
      dataIndex: "id",

      render: (_: any,record:string) => (
        <Space>
          <Tooltip title="Cancel">
            <Button
              key={record.id}
              icon={<BiTrash size={25} style={{ color: "red" }} />}
              onClick={() => handleDeleteOrderWithNotification(record.id, record.userId)}
            ></Button>
          </Tooltip>
          <Tooltip title="Confirm">
            <Button
              key={record.id}
              icon={<FaCheck size={25} style={{ color: "green" }} />}
              onClick={() => handleConfirmOrderWithNotification(record.id, record.userId)}
            ></Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <div className="mt-3"><HeadComponent
        title="Order Management"
        pageTitle="New Order"></HeadComponent></div>
      
      <Table dataSource={orders} columns={columns} />
    </Layout>
  );
};

export default NewOrders;
