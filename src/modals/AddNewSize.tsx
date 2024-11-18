import { fs } from "@/firebase/firabaseConfig";
import { Input, message, Modal } from "antd";
import { collection, doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const AddNewSize = (props: Props) => {
  const { visible, onClose } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [sizeId, setSizeId] = useState("");
  const [sizeName, setSizeName] = useState("");

  const handleClose = () => {
    setSizeId("");
    setSizeName("");
    onClose();
  };

  const handleAddNewSize = async () => {
    if (!sizeId) {
      message.error("Missing sizeId");
      return; // Thêm return để không tiếp tục nếu thiếu ID
    }
    if (!sizeName) {
      message.error("Missing title");
      return; // Thêm return để không tiếp tục nếu thiếu tên
    }

    setIsLoading(true);

    try {
      // Sử dụng setDoc để tạo tài liệu mới với ID được chỉ định và thêm trường 'id' kiểu int
      await setDoc(doc(fs, "sizes", sizeId), {
        sizeName,
        id: parseInt(sizeId, 10), // Thêm trường id kiểu int
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
      onOk={handleAddNewSize}
      onCancel={handleClose}
      title="Add new size"
      okButtonProps={{ loading: isLoading }}
    >
      <div className="mb-3 mt-3">
        <Input
          size="large"
          placeholder="Size id"
          maxLength={150}
          showCount
          allowClear
          value={sizeId}
          onChange={(e) => setSizeId(e.target.value)}
        />
      </div>
      <div className="mb-3 mt-3">
        <Input
          size="large"
          placeholder="Size title"
          maxLength={150}
          showCount
          allowClear
          value={sizeName}
          onChange={(e) => setSizeName(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default AddNewSize;
