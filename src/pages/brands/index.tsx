/** @format */

import { HeadComponent } from "@/components";
import { fs } from "@/firebase/firabaseConfig";
import { AddNewBrand } from "@/modals";
import { BrandModel } from "@/models/BrandModel";
import { Button, Table } from "antd";
import { ColumnProps } from "antd/es/table";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

const Brands = () => {
  const [isVisibleModalAddBrand, setIsVisibleModalAddBrand] =
    useState(false);
  const [categories, setCategories] = useState<BrandModel[]>([]);

  useEffect(() => {
    onSnapshot(collection(fs, "brands"), (snap) => {
      if (snap.empty) {
        console.log("Data not found!");
        setCategories([]);
      } else {
        const items: BrandModel[] = [];

        snap.forEach((item: any) => {
          items.push({
            id: item.id,
            ...item.data(),
          });
        });

        setCategories(items);
      }
    });
  }, []);

  const columns: ColumnProps<BrandModel>[] = [
    {
      key: "title",
      dataIndex: "title",
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
            onClick={() => setIsVisibleModalAddBrand(true)}
          >
            Add new
          </Button>
        }
      />
      <AddNewBrand
        visible={isVisibleModalAddBrand}
        onClose={() => setIsVisibleModalAddBrand(false)}
      />
    </div>
  );
};

export default Brands;
