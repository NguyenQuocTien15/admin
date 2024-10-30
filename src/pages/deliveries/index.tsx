import { HeadComponent } from "@/components";
import Layout from "@/components/Layout";
import { fs } from "@/firebase/firabaseConfig";

import { Button, Space, Table, Tooltip } from "antd";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
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
        return { id: doc.id, ...order, orderStatusName, paymentMethodName };
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns = [
    { title: "Name", key: "userName", dataIndex: "userName" },
    { title: "Phone", key: "phoneNumber", dataIndex: "phoneNumber" },
    {
      title: "Product",
      key: "items",
      dataIndex: "items",
      render: (items: any[]) => items.map((item) => item.id).join(", "),
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
      dataIndex: "",

      render: () => (
        <Space>
          <Tooltip title="Cancel">
            <Button
              type="text"
              icon={<BiTrash size={25} style={{ color: "red" }} />}
              onClick={() => router.push(``)}
            ></Button>
          </Tooltip>
          <Tooltip title="Confirm">
            <Button
              type="text"
              icon={<FaCheck size={25} style={{ color: "green" }} />}
              onClick={() => router.push(``)}
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
