import { HeadComponent } from "@/components";
import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ShipperModel } from "@/models/ShipperModel";
import AddNewShipper from "@/modals/AddNewShipper";
import Table, { ColumnProps } from "antd/es/table";
import { collection, onSnapshot } from "firebase/firestore";
import { fs } from "@/firebase/firabaseConfig";
const Shippers = () => {
  const router = useRouter();
  const [shippers, setShippers] = useState<ShipperModel[]>([]);
  // useEffect(() => {
  //   onSnapshot(collection(fs, "shippers"), (snap) => {
  //     if (snap.empty) {
  //       alert("Shipper not found");
  //     } else {
  //       const items: any[] = [];
  //       snap.forEach((item: any) => {
  //         const data = item.data();
  //         items.push({
  //           id: item.id,
  //           ...data,
  //         });
  //       });
  //       setShippers(items);
  //     }
  //   });
  // });
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(fs, "shippers"), (snap) => {
      if (snap.empty) {
        alert("Shipper not found");
      } else {
        const items: ShipperModel[] = snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        setShippers(items);
      }
    });

    return () => unsubscribe(); // Unsubscribe on component unmount
  }, []);
  const columns: ColumnProps<ShipperModel>[] = [
    {
      title: "Shipper Name",
      key: "fullName",
      dataIndex: "fullName",
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
    },
    {
      title: "Phone number",
      key: "phoneNumber",
      dataIndex: "phoneNumber",
    },
    {
      title: "CIN",
      key: "CIN",
      dataIndex: "CIN",
    },
    {
      title: "DateOfIssuance",
      key: "dateOfIssuance",
      dataIndex: "dateOfIssuance",
    },
    {
      title: "Avatar",
      key: "avatar",
      dataIndex: "avatar",
      render: (avatarUrl: string) => (
        <img src={avatarUrl} alt="Avatar" style={{ width: 50, height: 50 }} />
      ),
    },
    {
      title: "CCCD Card Front",
      key: "image_CCCD_card_front",
      dataIndex: "image_CCCD_card_front",
      render: (frontUrl: string) => (
        <img
          src={frontUrl}
          alt="CCCD Front"
          style={{ width: 80, height: 40 }}
        />
      ),
    },
    {
      title: "CCCD Card Back",
      key: "image_CCCD_card_back",
      dataIndex: "image_CCCD_card_back",
      render: (backUrl: string) => (
        <img src={backUrl} alt="CCCD Back" style={{ width: 80, height: 40 }} />
      ),
    },
  ];
  return (
    <div>
      <HeadComponent
        title="Shipper"
        pageTitle="Shipper"
        extra={
          <Button
            type="primary"
            onClick={() => router.push(`/shippers/add-shipper`)}
          >
            Add Shipper
          </Button>
        }
      />
      <Table dataSource={shippers} columns={columns}></Table>
    </div>
  );
};

export default Shippers;
