/** @format */

import { HeadComponent } from "@/components";
import AvatarComponent from "@/components/AvatarComponent";

import { fs } from "@/firebase/firabaseConfig";
import { AddNewBrand } from "@/modals";
import { BrandModel } from "@/models/BrandModel";
import { Button, Space, Table, Tooltip } from "antd";
import { ColumnProps } from "antd/es/table";
import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useRouter } from "next/router";
import { FcAddImage, FcDeleteColumn } from "react-icons/fc";
import { DeleteOutlined } from "@ant-design/icons";

const Brands = () => {
  const router = useRouter();
  const [isVisibleModalAddBrands, setIsVisibleModalAddBrands] = useState(false);
  const [brands, setBrands] = useState<BrandModel[]>([]);

  useEffect(() => {
    onSnapshot(collection(fs, "brands"), (snap) => {
      if (snap.empty) {
        console.log("Data not found!");
        setBrands([]);
      } else {
        const items: BrandModel[] = [];

        snap.forEach((item: any) => {
          items.push({
            id: item.id,
            ...item.data(),
          });
        });

        setBrands(items);
      }
    });
  }, []);

  const columns: ColumnProps<BrandModel>[] = [
    {
      title: "Brands Image",
      key: "img",
      dataIndex: "",
      render: (item: BrandModel) => (
        <AvatarComponent
          imageUrl={item.imageUrl}
          id={item.files && item.files.length > 0 ? item.files[0] : undefined}
          path="files"
        />
      ),
    },
    {
      title: "Brands name",
      key: "title",
      dataIndex: "title",
    },
    {
      title: "Action",
      align: "right",
      dataIndex: "",
      render: (item) => (
        <Space>
          <Tooltip title="Edit brand">
            <Button
              type="text"
              icon={<FaEdit color="green" size={20} />}
              onClick={() =>
                router.push(``)
              }
            />
          </Tooltip>
          <Tooltip title="Delete brand">
            <Button
              type="text"
              icon={<DeleteOutlined size={20} style={{color:'red'}} />}
              onClick={() =>
                router.push(``)
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <HeadComponent
        title="Brands"
        pageTitle="Brands"
        extra={
          <Button
            type="primary"
            onClick={() => setIsVisibleModalAddBrands(true)}
          >
            Add new
          </Button>
        }
      />
      <Table dataSource={brands} columns={columns} />
      <AddNewBrand
        visible={isVisibleModalAddBrands}
        onClose={() => setIsVisibleModalAddBrands(false)}
      />
    </div>
  );
};

export default Brands;
