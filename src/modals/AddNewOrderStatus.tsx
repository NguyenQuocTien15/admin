import { fs } from "@/firebase/firebaseConfig";
import { Input, message, Modal } from "antd";
import { collection, doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const AddNewOrderStatus = (props: Props) => {
  const { visible, onClose } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [orderStatusId, setOrderStatusId] = useState("");
  const [orderStatusName, setOrderStatusName] = useState("");

  const handleClose = () => {
    setOrderStatusId("");
    setOrderStatusName("");
    onClose();
  };

  const handleAddNewOrderStatus = async () => {
    if (!orderStatusId) {
      message.error("Missing orderStatusId");
      return; // Thêm return để không tiếp tục nếu thiếu ID
    }
    if (!orderStatusName) {
      message.error("Missing title");
      return; // Thêm return để không tiếp tục nếu thiếu tên
    }

    setIsLoading(true);

    try {
      // Sử dụng setDoc để tạo tài liệu mới với ID được chỉ định
      await setDoc(doc(fs, "orderStatus", orderStatusId), {
        orderStatusName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      handleClose();
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onOk={handleAddNewOrderStatus}
      onCancel={handleClose}
      title="Add new order status"
      okButtonProps={{ loading: isLoading }}
    >
      <div className="mb-3 mt-3">
        <Input
          size="large"
          placeholder="Order status id"
          maxLength={150}
          showCount
          allowClear
          value={orderStatusId}
          onChange={(e) => setOrderStatusId(e.target.value)}
        />
      </div>
      <div className="mb-3 mt-3">
        <Input
          size="large"
          placeholder="Order status title"
          maxLength={150}
          showCount
          allowClear
          value={orderStatusName}
          onChange={(e) => setOrderStatusName(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default AddNewOrderStatus;
