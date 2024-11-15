import { fs } from "@/firebase/firabaseConfig";
import { Form, Input, message, Modal } from "antd";
import {
  collection,
  doc,
  getDoc,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import React, { useState } from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const AddNewColor = (props: Props) => {
  const { visible, onClose } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("");

  const handleClose = () => {
    setColorName("");
    setColorCode("");
    onClose();
  };

  const handleAddNewColor = async () => {
    if (!colorName) {
      message.error("Missing color name");
      return;
    }

    setIsLoading(true);

    try {
      // Start a Firestore transaction to handle atomic increment of the color_id
      const colorRef = doc(fs, "counters", "color_id_counter");
      await runTransaction(fs, async (transaction) => {
        const colorDoc = await transaction.get(colorRef);

        if (!colorDoc.exists()) {
          // If the counter doesn't exist, initialize it with a value of 1
          transaction.set(colorRef, { lastId: 1 });
          // Use 1 as the color_id
          await setDoc(doc(fs, "colors", "1"), {
            colorName,
            colorCode,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        } else {
          // Increment the lastId counter and use the new value
          const newColorId = colorDoc.data()?.lastId + 1;
          transaction.update(colorRef, { lastId: newColorId });

          await setDoc(doc(fs, "colors", newColorId.toString()), {
            colorName,
            colorCode,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
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
      onOk={handleAddNewColor}
      onCancel={handleClose}
      title="Add new color"
      okButtonProps={{ loading: isLoading }}
    >
      <div className="mb-3 mt-3">
        <Input
          color="large"
          placeholder="Color name"
          maxLength={150}
          showCount
          allowClear
          value={colorName}
          onChange={(e) => setColorName(e.target.value)}
        />
      </div>

      <Form.Item name={"color"} label="Color code">
        <Input
          type="color"
          style={{
            width: "20%",
            padding: 0,
            border: "none",
            borderRadius: 12,
          }}
          value={colorCode}
          onChange={(e) => setColorCode(e.target.value)}
        />
      </Form.Item>
    </Modal>
  );
};

export default AddNewColor;
