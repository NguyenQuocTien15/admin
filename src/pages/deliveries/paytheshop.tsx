import { HeadComponent } from "@/components";
import Layout from "@/components/Layout";
import { fs } from "@/firebase/firebaseConfig";
import { Button, Space, Table, Tooltip } from "antd";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";

const PayTheShop = () => {
  const [orders, setOrders] = useState();
  const [loading, setLoading] = useState(true); // To manage loading state

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const orderRef = collection(fs, "orders");
      const q = query(orderRef, where("orderStatusId", "==", "9"));
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

  const handlePayTheShop = async (orderId: string) => {
    try {
      const orderRef = doc(fs, "orders", orderId);
      await updateDoc(orderRef, {
        orderStatusId: "11",
      });
      alert("Confirm pay the order successfully");

      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };
  const columns = [
    { title: "Name", key: "displayName", dataIndex: "displayName" },
    { title: "Phone", key: "phoneNumber", dataIndex: "phoneNumber" },
    {
      title: "Product",
      key: "items",
      dataIndex: "items",
      render: (items: any[]) => items.map((item) => item.title).join(",\n "),
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
            backgroundColor: "#ff7891",
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
    {
      title: "Action",
      dataIndex: "id",

      render: (id: string) => (
        <Space>
          <Tooltip title="Cancel">
            <Button
              className="btn-primary"
              key={id}
              onClick={() => handlePayTheShop(id)}
            >
              Nhận tiền
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];
  return (
    <Layout>
      <div className="mt-3">
        <HeadComponent
          title="Order Management"
          pageTitle="Trả tiền"
        ></HeadComponent>
      </div>
      <Table columns={columns} dataSource={orders}></Table>
    </Layout>
  );
};

export default PayTheShop;
