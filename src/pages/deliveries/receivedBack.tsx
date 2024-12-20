import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout"; // Adjust path as needed
import { HeadComponent } from "@/components";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { fs } from "@/firebase/firebaseConfig";
import { Button, Space, Table, Tooltip } from "antd";
import { title } from "process";

const ReceivedBack: React.FC = () => {
  const [orders, setOrders] = useState();
  const [loading, setLoading] = useState(true); // To manage loading state

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const orderRef = collection(fs, "orders");
      const q = query(orderRef, where("orderStatusId", "==", "10"));
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
        <div
          style={{
            backgroundColor: "yellow",
            padding: "8px",
            borderRadius: 10,
            textAlign: "center",
          }}
        >
          {text}
        </div>
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
          pageTitle="Trả kho"
        ></HeadComponent>
      </div>
      <Table dataSource={orders} columns={columns}></Table>
    </Layout>
  );
};

export default ReceivedBack;
