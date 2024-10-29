import { HeadComponent } from "@/components";
import { fs } from "@/firebase/firabaseConfig";
import { CheckOutlined, CheckSquareOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Space, Table, Tooltip } from "antd";
import firebase from "firebase/compat/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";

const NewOrders = ({  }) => {
  const router = useRouter();
  const [order, setOrders] = useState();
  const [loading, setLoading] = useState(true); // To manage loading state

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orderRef = collection(fs, "orders"); // Use the collection function
        const snapshot = await getDocs(orderRef); // Use getDocs to retrieve documents
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const columns = [
    // {
    //   title: "ID",
    //   key: "id",
    //   dataIndex: "id",
    // },
    {
      title: "Name",
      key: "userName",
      dataIndex: "userName",
    },
    {
      title: "Phone",
      key: "phoneNumber",
      dataIndex: "phoneNumber",
    },
    {
      title: "Product",
      key: "items",
      dataIndex: "items",
      render: (items: any[]) => items.map((item) => item.id).join(", "), // Join product titles
    },
    {
      title: "Address",
      key: "address",
      dataIndex: "address",
    },
    {
      title: "Shipper",
      key: "shipperId",
      dataIndex: "shipperId",
      render: (shipperId: any) => shipperId || "Null",
    },
    {
      title: "Payment Method",
      key: "paymentMethodId",
      dataIndex: "paymentMethodId",
    },
    {
      title: "Status",
      key: "orderStatusId",
      dataIndex: "orderStatusId",
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
              icon={<DeleteOutlined size={35} style={{ color: "red" }} />}
              onClick={() => router.push(``)}
            ></Button>
          </Tooltip>
          <Tooltip title="Confirm">
            <Button
              type="text"
              icon={<CheckOutlined size={25} style={{ color: "blue" }} />}
              onClick={() => router.push(``)}
            ></Button>
          </Tooltip>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <HeadComponent
        title="Delivery"
        pageTitle="New Order"
        extra={
          <Button
            type="primary"
            onClick={() => router.push(`/deliveries/order-management`)}
          >
            Order Management
          </Button>
        }
      />
      <Table dataSource={order} columns={columns} />
    </div>
  );
};

export default NewOrders;
