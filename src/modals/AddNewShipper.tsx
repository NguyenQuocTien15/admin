import { ImagePicker } from "@/components";
import { DateTime } from "@/utils/dateTime";
import { Input, Modal } from "antd";
import React, { useState } from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
};
const AddNewShipper = (props: Props) => {
  const { visible, onClose } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [CIN, setCIN] = useState("");
  const [dateOfIssuance, setDateOfIssuance] = useState("");
  const [filesAvatar, setFilesAvatar] = useState<any[]>([]);
  const [filesFront, setFilesFront] = useState<any[]>([]);
  const [filesBack, setFilesBack] = useState<any[]>([]);

  const handleClose = () => {
    setFullName("");
    setFilesFront([]);
    onClose();
  };
  const handleAddNewShipper = () => {};
  return (
    <Modal
      open={visible}
      onOk={handleAddNewShipper}
      loading={isLoading}
      onCancel={handleClose}
      title="Add new shipper"
    >
      <div className="mb-3 mt-3">
        <div className="mt-3">
          {" "}
          <div className="mt-1 mb-1">Full name</div>
          <Input
            size="large"
            placeholder="Enter full name"
            maxLength={150}
            showCount
            allowClear
            value={fullName}
            onChange={(val) => setFullName(val.target.value)}
          />
        </div>
        <div className="mt-3">
          <div className="mt-1 mb-1">Email</div>
          <Input
            size="large"
            placeholder="Enter email"
            maxLength={150}
            showCount
            allowClear
            value={email}
            onChange={(val) => setEmail(val.target.value)}
          />
        </div>
        <div className="mt-3">
          <div className="mt-1 mb-1">Phone number</div>
          <Input
            size="large"
            placeholder="Enter phone number"
            maxLength={10}
            showCount
            allowClear
            value={phoneNumber}
            onChange={(val) => setPhoneNumber(val.target.value)}
          />
        </div>
        <div className="mt-3">
          <div className="mt-1 mb-1">Password</div>
          <Input
            size="large"
            placeholder="Enter password"
            maxLength={150}
            showCount
            allowClear
            value={password}
            onChange={(val) => setPassword(val.target.value)}
          />
        </div>
        <div className="mt-3">
          <div className="mt-1 mb-1">Avatar</div>
          {filesAvatar.length > 0 && (
            <div className="mt-1">
              <img
                src={URL.createObjectURL(filesAvatar[0])}
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
            onSelected={(vals) => setFilesAvatar(vals)}
          />
        </div>
        <div className="mt-3">
          <div className="mt-1 mb-1">Citizen identification number</div>
          <Input
            size="large"
            placeholder="Enter citizen identification number"
            maxLength={12}
            showCount
            allowClear
            value={CIN}
            onChange={(val) => setCIN(val.target.value)}
          />
        </div>
        <div className="mt-3">
          <div className="mt-1 mb-1">Date of issuance</div>
          <Input
            size="large"
            placeholder="Enter date of issuance"
            maxLength={12}
            showCount
            allowClear
            value={dateOfIssuance}
            onChange={(val) => setDateOfIssuance(val.target.value)}
          />
        </div>
        <div className="mt-3">
          <div className="mt-1 mb-1">
            The front of the citizen identification card
          </div>
          {filesFront.length > 0 && (
            <div className="mt-1">
              <img
                src={URL.createObjectURL(filesFront[0])}
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
            onSelected={(vals) => setFilesFront(vals)}
          />
        </div>
        <div className="mt-3">
          <div className="mt-1 mb-1">
            The back of the citizen identification card
          </div>
          {filesBack.length > 0 && (
            <div className="mt-1">
              <img
                src={URL.createObjectURL(filesBack[0])}
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
            onSelected={(vals) => setFilesBack(vals)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddNewShipper;
