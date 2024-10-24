/** @format */

import { HeadComponent } from "@/components";
import AvatarComponent from "@/components/AvatarComponent";
import BrandComponent from "@/components/BrandComponent";
import CategoryComponent from "@/components/CategoryComponent";
import { fs } from "@/firebase/firabaseConfig";
import { ProductModel } from "@/models/ProductModel";
import { Button, Space, Table, Tag, Tooltip } from "antd";
import { ColumnProps } from "antd/es/table";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FcAddImage } from "react-icons/fc";

const Products = () => {
  const [products, setProducts] = useState<ProductModel[]>([]);

  const router = useRouter();

  useEffect(() => {
    onSnapshot(collection(fs, "products"), (snap) => {
      if (snap.empty) {
        console.log("Data not found!");
      } else {
        const items: any[] = [];

        snap.forEach((item: any) => {
          const data = item.data();
          
          items.push({
            id: item.id,
            ...data,
          });
        });

        setProducts(items);
      }
    });
  }, []);

  const columns: ColumnProps<any>[] = [
    {
      key: "image",
      title: "",
      dataIndex: "",
      render: (item: ProductModel) => (
        <AvatarComponent
          imageUrl={item.imageUrl}
          id={item.files && item.files.length > 0 ? item.files[0] : ""}
          path="files"
        />
      ),
    },
    {
      key: "title",
      dataIndex: "title",
      title: "Tilte",
    },
    {
      key: "type",
      dataIndex: "type",
      title: "Type",
    },
    {
      key: "cat",
      title: "Categories",
      dataIndex: "categories",
      render: (ids: string[]) =>
        ids &&
        ids.length > 0 && (
          <Space>
            {ids.map((id) => (
              <Tag>
                <CategoryComponent id={id} key={id} />
              </Tag>
            ))}
          </Space>
        ),
    },

    {
      key: "brand",
      title: "Brands",
      dataIndex: "brands",
      render: (brands) => {
        if (Array.isArray(brands) && brands.length > 0) {
          return (
            <Space>
              {brands.map((id) => (
                <BrandComponent key={id} id={id} />
              ))}
            </Space>
          );
        } else {
          return <span>No brands associated</span>;
        }
      },
    },

    {
      key: "Price",
      title: "Price",
      dataIndex: "price",
    },
    {
      title: "",
      align: "right",
      dataIndex: "",
      render: (item) => (
        <Space>
          <Tooltip title="Edit product">
            <Button
              type="text"
              icon={<FaEdit color="#676767" size={20} />}
              onClick={() =>
                router.push(`/products/add-new-product?id=${item.id}`)
              }
            />
          </Tooltip>
          <Tooltip title="Add sub product">
            <Button
              type="text"
              icon={<FcAddImage size={22} />}
              onClick={() =>
                router.push(`/products/add-sub-product?id=${item.id}`)
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
        title="Products"
        pageTitle="Products"
        extra={
          <Button
            type="primary"
            onClick={() => router.push("/products/add-new-product")}
          >
            Add new
          </Button>
        }
      />
      <Table dataSource={products} columns={columns} />
    </div>
  );
};

export default Products;
