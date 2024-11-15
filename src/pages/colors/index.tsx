/** @format */

import { HeadComponent } from "@/components";
import { fs } from "@/firebase/firabaseConfig";
import AddNewColor from "@/modals/AddNewColor";
import { ColorModel } from "@/models/ColorModel";
import { Button, Table } from "antd";
import { ColumnProps } from "antd/es/table";
import { collection, onSnapshot } from "firebase/firestore";

import { useEffect, useState } from "react";

const Color = () => {
  const [isVisibleModalAddColor, setIsVisibleModalAddColor] = useState(false);
  const [color, setColor] = useState<ColorModel[]>([]);
  useEffect(() => {
    onSnapshot(collection(fs, "colors"), (snap) => {
      if (snap.empty) {
        console.log("Data not found!");
        setColor([]);
      } else {
        const items: ColorModel[] = [];

        snap.forEach((item: any) => {
          items.push({
            id: item.id,
            ...item.data(),
          });
        });
        setColor(items);
      }
    });
  }, []);
  const columns: ColumnProps<ColorModel>[] = [
    {
      title: "ID",
      key: "id",
      dataIndex: "id",
    },
    {
      title: "Color name",
      key: "colorName",
      dataIndex: "colorName",
    },
    {
      title: "Color code",
      key: "colorCode",
      dataIndex: "colorCode",
    },
  ];
  return (
    <div>
      <HeadComponent
        title="Color"
        pageTitle="Color"
        extra={
          <Button type="primary" onClick={() => setIsVisibleModalAddColor(true)}>
            Add new
          </Button>
        }
      ></HeadComponent>
      <Table dataSource={color} columns={columns} />
      <AddNewColor
        visible={isVisibleModalAddColor}
        onClose={() => setIsVisibleModalAddColor(false)}
      />
    </div>
  );
};

export default Color;
