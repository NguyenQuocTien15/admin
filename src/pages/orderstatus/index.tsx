/** @format */

import { HeadComponent } from "@/components";
import AvatarComponent from "@/components/AvatarComponent";
import { fs } from "@/firebase/firabaseConfig";
import AddNewOrderStatus from "@/modals/AddNewOrderStatus";
import { OrderStatusModel } from "@/models/OrderStatusModel";
import { Button, Table } from "antd";
import { ColumnProps } from "antd/es/table";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

const OrderStatus = () => {
  const [isVisibleModalAddOrderStatus, setIsVisibleModalAddOrderStatus] =
    useState(false);
    const [orderStatus, setOrderStatus] = useState<OrderStatusModel[]>([]);
    useEffect(() => {
      onSnapshot(collection(fs, "orderStatus"), (snap) => {
        if (snap.empty) {
          console.log("Data not found!");
          setOrderStatus([]);
        } else {
          const items: OrderStatusModel[] = [];

          snap.forEach((item: any) => {
            items.push({
              id: item.id,
              ...item.data(),
            });
          });
          items.sort((a, b) => {
            return a.orderStatusId.localeCompare(b.orderStatusId);
          });


          setOrderStatus(items);
        }
      });
    }, []);
const columns: ColumnProps<OrderStatusModel>[] = [
  {
    title:'ID',
    key: "orderStatusId",
    dataIndex: "orderStatusId",
  },
  {
    title:'Status',
    key: "title",
    dataIndex: "title",
  },
];
  return (
    <div>
      <HeadComponent
        title="OrderStatus"
        pageTitle="OrderStatus"
        extra={
          <Button
            type="primary"
            onClick={() => setIsVisibleModalAddOrderStatus(true)}
          >
            Add new
          </Button>
        }
      ></HeadComponent>
      <Table dataSource={orderStatus} columns={columns} />
      <AddNewOrderStatus
        visible={isVisibleModalAddOrderStatus}
        onClose={() => setIsVisibleModalAddOrderStatus(false)}
      />
    </div>
  );
};

export default OrderStatus;
