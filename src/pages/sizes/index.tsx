/** @format */

import { HeadComponent } from "@/components";
import { fs } from "@/firebase/firabaseConfig";

import AddNewSize from "@/modals/AddNewSize";
import { SizeModels } from "@/models/SizeModel";

import { Button, Table } from "antd";
import { ColumnProps } from "antd/es/table";
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

const Size = () => {
  const router = useRouter();
  const [isVisibleModalAddSize, setIsVisibleModalAddSize] =
    useState(false);
  const [size, setSize] = useState<SizeModels[]>([]);
  useEffect(() => {
    onSnapshot(collection(fs, "sizes"), (snap) => {
      if (snap.empty) {
        console.log("Data not found!");
        setSize([]);
      } else {
        const items: SizeModels[] = [];

        snap.forEach((item: any) => {
          items.push({
            id: item.id,
            ...item.data(),
          });
        });
        setSize(items);
      }
    });
  }, []);
  const columns: ColumnProps<SizeModels>[] = [
    {
      title: "ID",
      key: "id",
      dataIndex: "id",
    },
    {
      title: "Size name",
      key: "sizeName",
      dataIndex: "sizeName",
    },
  ];
  return (
    <div>
      <HeadComponent
        title="Size"
        pageTitle="Size"
        extra={
          <Button type="primary" onClick={() => setIsVisibleModalAddSize(true)}>
            Add new
          </Button>
        }
      ></HeadComponent>
      <Table dataSource={size} columns={columns} />
      <AddNewSize
        visible={isVisibleModalAddSize}
        onClose={() => setIsVisibleModalAddSize(false)}
      />
      <Button
        type="primary"
        onClick={() => router.push("/sizes/add-product")}
      >Product</Button>
    </div>
  );
};

export default Size;
