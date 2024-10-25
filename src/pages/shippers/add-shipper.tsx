import { HeadComponent, ImagePicker } from "@/components";
import { Button, Input, Image, Alert, Upload } from "antd";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, fs, storage } from "@/firebase/firabaseConfig";
import { UploadOutlined } from "@ant-design/icons";


const AddShippers = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [CIN, setCIN] = useState("");
  const [dateOfIssuance, setDateOfIssuance] = useState("");
  const [filesAvatar, setFilesAvatar] = useState<File[]>([]);
  const [filesFront, setFilesFront] = useState<File[]>([]);
  const [filesBack, setFilesBack] = useState<File[]>([]);
  const handleSaveShipper = async () => {
    setIsLoading(true);
    try {
      // Tạo tài khoản với email và password
      const shipperCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const shipper = shipperCredential.user;

      const avatarRef = ref(storage, `avatars/${shipper.uid}`);
      await uploadBytes(avatarRef, filesAvatar[0]);
      const avatarUrl = await getDownloadURL(avatarRef); // Fixed

      const frontRef = ref(storage, `cccd/front/${shipper.uid}`);
      await uploadBytes(frontRef, filesFront[0]);
      const frontUrl = await getDownloadURL(frontRef); // Fixed

      const backRef = ref(storage, `cccd/back/${shipper.uid}`);
      await uploadBytes(backRef, filesBack[0]);
      const backUrl = await getDownloadURL(backRef); // Fixed

      // Lưu thông tin người dùng vào Firestore
      await setDoc(doc(fs, "shippers", shipper.uid), {
        fullName,
        email,
        phoneNumber,
        CIN,
        DateOfIssuance: new Date(dateOfIssuance),
        avatar: avatarUrl,
        image_CCCD_card_front: frontUrl,
        image_CCCD_card_back: backUrl,
        files_card_front: filesFront.map((file) => file.name),
        files_card_back: filesBack.map((file) => file.name),
      });

      alert("Shipper created successfully!");
      router.push("/shippers");
    } catch (error) {
      console.error("Error adding shipper: ", error);
      alert(`Failed to save shipper: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="form-fluid">
      <h2>Register New User</h2>

      {/* Full name input */}
      <div className="input-group">
        <label>Full Name</label>
        <Input
          placeholder="Enter full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      {/* Email input */}
      <div className="input-group">
        <label>Email</label>
        <Input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Phone number input */}
      <div className="input-group">
        <label>Phone Number</label>
        <Input
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>

      {/* Password input */}
      <div className="input-group">
        <label>Password</label>
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* CIN input */}
      <div className="input-group">
        <label>Citizen Identification Number (CIN)</label>
        <Input
          placeholder="Enter CIN"
          value={CIN}
          onChange={(e) => setCIN(e.target.value)}
        />
      </div>

      {/* Date of Issuance input */}
      <div className="input-group">
        <label>Date of Issuance</label>
        <Input
          type="date"
          placeholder="Select date of issuance"
          value={dateOfIssuance}
          onChange={(e) => setDateOfIssuance(e.target.value)}
        />
      </div>

      {/* Upload Avatar */}
      <div className="input-group">
        <label>Upload Avatar</label>
        <Upload
          beforeUpload={(file) => {
            setFilesAvatar([file]);
            return false; // Prevent automatic upload
          }}
        >
          <Button icon={<UploadOutlined />}>Select Avatar</Button>
        </Upload>
        {filesAvatar.length > 0 && (
          <p>Selected Avatar: {filesAvatar[0].name}</p>
        )}
      </div>

      {/* Upload Front of CIN */}
      <div className="input-group">
        <label>Upload Front of CIN</label>
        <Upload
          beforeUpload={(file) => {
            setFilesFront([file]);
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Select Front of CIN</Button>
        </Upload>
        {filesFront.length > 0 && <p>Selected File: {filesFront[0].name}</p>}
      </div>

      {/* Upload Back of CIN */}
      <div className="input-group">
        <label>Upload Back of CIN</label>
        <Upload
          beforeUpload={(file) => {
            setFilesBack([file]);
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Select Back of CIN</Button>
        </Upload>
        {filesBack.length > 0 && <p>Selected File: {filesBack[0].name}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="primary"
        loading={isLoading}
        onClick={handleSaveShipper}
        style={{ marginTop: "20px" }}
      >
        Save
      </Button>
    </div>
  );
};


export default AddShippers;
