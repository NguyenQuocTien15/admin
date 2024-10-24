import { fs } from "@/firebase/firabaseConfig";
import { Input, message, Modal } from "antd";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
type Props = {
  visible: boolean;
  onClose: () => void;
};
const AddNewBrand = (props: Props) => {
  const { visible, onClose } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [brandName, setBrandName] = useState("");
  const handleClose = () => {
    setBrandName("");
    onClose();
  };

  const handleAddNewBrand = async (values: any) => {
    if (!brandName) {
      message.error("Missing brand title");
    
    } else {
      setIsLoading(true);

      try {
        const snap = await addDoc(collection(fs, "brands"), {
          brandName,
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
      onOk={handleAddNewBrand}
      loading={isLoading}
      onCancel={handleClose}
      title="Add new brand"
    >
      <div className="mb-3 mt-3">
        <Input
          size="large"
          placeholder="title"
          maxLength={150}
          showCount
          allowClear
          value={brandName}
          onChange={(val) => setBrandName(val.target.value)}
        />
      </div>
    </Modal>
  );
};

export default AddNewBrand;
