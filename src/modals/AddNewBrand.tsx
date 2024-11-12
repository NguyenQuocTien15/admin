import { ImagePicker } from "@/components";
import { fs } from "@/firebase/firebaseConfig";
import { HandleFile } from "@/utils/handleFile";
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
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<any[]>([]);

  const handleClose = () => {
    setTitle("");
    onClose();
  };

  const handleAddNewBrand = async () => {
    if (!title) {
      message.error("Missing brand title");
    } else {
      setIsLoading(true);

     try {
       const snap = await addDoc(collection(fs, "brands"), {
         title,
         createdAt: Date.now(),
         updatedAt: Date.now(),
       });

       if (files && files.length > 0) {
         await HandleFile.HandleFiles(files, snap.id, "brands");
       }
       handleClose();
       setIsLoading(false);
     } catch (error: any) {
       message.error(error.message);
       setIsLoading(false);
     } finally {
       setIsLoading(false); // Reset loading state
     }
    }
  };

  return (
    <Modal
      open={visible}
      onOk={handleAddNewBrand} // Trigger adding the brand
      onCancel={handleClose} // Handle modal closing
      title="Add new brand"
      okButtonProps={{ loading: isLoading }} // Apply loading to the submit button
    >
      <div className="mb-3 mt-3">
        <Input
          size="large"
          placeholder="Brand title"
          maxLength={150}
          showCount
          allowClear
          value={title}
          onChange={(e) => setTitle(e.target.value)} // Handle input change
        />
        {files.length > 0 && (
          <div className="mt-4">
            <img
              src={URL.createObjectURL(files[0])}
              style={{
                width: 200,
                height: "auto",
              }}
              alt=""
            />
          </div>
        )}
        <ImagePicker
          loading={isLoading}
          onSelected={(vals) => setFiles(vals)}
        />
      </div>
    </Modal>
  );
};

export default AddNewBrand;
