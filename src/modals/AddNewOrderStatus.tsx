
import { fs } from "@/firebase/firabaseConfig";
import { Input, message, Modal } from "antd";
import {  addDoc, collection, doc } from "firebase/firestore";
import { setDoc } from "firebase/firestore/lite";
import React, { useState } from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const AddNewOrderStatus = (props: Props) => {
  const { visible, onClose } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [orderStatusId, setOrderStatusId] = useState("");
  const [title, setTitle] = useState("");

  const handleClose = () => {
    setOrderStatusId('');
    setTitle("");
    onClose();
  };

  const handleAddNewOrderStatus = async () => {
    if (!orderStatusId) {
      message.error("Missing orderStatusId");
    } else if (!title) {
      message.error("Missing  title");
    } else {
      setIsLoading(true);

      try {
         await addDoc(collection(fs, "orderStatus"), {
            orderStatusId,
           title,
           createdAt: Date.now(),
           updatedAt: Date.now(),
         });

        handleClose();
        setIsLoading(false);
      } catch (error: any) {
        message.error(error.message);
        setIsLoading(false);
      }
    }
  };
  return (
    <Modal
      open={visible}
      onOk={handleAddNewOrderStatus} // Trigger adding the brand
      onCancel={handleClose} // Handle modal closing
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default AddNewOrderStatus;
