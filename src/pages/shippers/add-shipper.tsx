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
  const[filesAvatar, setFilesAvatar] = useState([]);
  const [previewUrlAvatar, setPreviewUrlAvatar] = useState(null);

  const [filesFront, setFilesFront] = useState([]);
  const [previewUrlFront, setPreviewUrlFront] = useState(null);

  const [filesBack, setFilesBack] = useState([]);
  const [previewUrlBack, setPreviewUrlBack] = useState(null);

  const handleBeforeUploadAvatar = (file: Blob | MediaSource) => {
    setFilesAvatar([file]);
    setPreviewUrlAvatar(URL.createObjectURL(file));
    return false;
  };

  const handleBeforeUploadFront = (file: Blob | MediaSource) => {
    setFilesFront([file]);
    setPreviewUrlFront(URL.createObjectURL(file));
    return false;
  };

  const handleBeforeUploadBack = (file: Blob | MediaSource) => {
    setFilesBack([file]);
    setPreviewUrlBack(URL.createObjectURL(file));
    return false;
  };
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
      if (CIN.length !== 12) {
        alert("Vui lòng nhập đủ 12 số căn cước công dân");
        return;
      }
      if (phoneNumber.length !== 10) {
        alert("Vui lòng nhập đủ 12 số căn cước công dân");
        return;
      }
      if (!avatarUrl || !frontUrl || !backUrl) {
        alert(
          "Please select all required images (Avatar, CCCD Card Front, CCCD Card Back)."
        );
        return; // Stop execution if any image is missing
      }
      // Lưu thông tin người dùng vào Firestore
      await setDoc(doc(fs, "shippers", shipper.uid), {
        shipperId: shipper.uid,
        fullName,
        email,
        phoneNumber,
        CIN,
        dateOfIssuance,
        avatar: avatarUrl,
        image_CCCD_card_front: frontUrl,
        image_CCCD_card_back: backUrl,
        filesAvatar: filesFront.map((file) => file.name),
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
      <HeadComponent
        title="Shipper"
        pageTitle="Register New User"
        extra={
          <Button type="primary" onClick={() => router.back()}>
            Back
          </Button>
        }
      />
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
          maxLength={10}
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
          maxLength={12}
          value={CIN}
          onChange={(e) => setCIN(e.target.value)}
        />
      </div>
      {/* Date of Issuance input */}
      <div className="input-group mb-3">
        <label>Date of Issuance</label>
        <Input
          type="date"
          placeholder="Select date of issuance"
          value={dateOfIssuance}
          onChange={(e) => setDateOfIssuance(e.target.value)}
        />
      </div>
      <div className="row">
        {/* Avatar Upload */}

        <div className="col-4">
          <label>Upload Avatar</label>

          <div className="input-group">
            <Upload beforeUpload={handleBeforeUploadAvatar}>
              <Button icon={<UploadOutlined />}>Select Avatar</Button>
            </Upload>
            {filesAvatar.length > 0 && (
              <>
                {/* <p>Selected File: {filesAvatar[0].name}</p> */}
                {previewUrlAvatar && (
                  <img
                    src={previewUrlAvatar}
                    alt="Avatar Preview"
                    style={{ width: "100px", marginTop: "10px" }}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Front of CIN Upload */}
        <div className="col-4">
          <label>Upload Front of CIN</label>
          <div className="input-group">
            <Upload beforeUpload={handleBeforeUploadFront}>
              <Button icon={<UploadOutlined />}>Select Front of CIN</Button>
            </Upload>
            {filesFront.length > 0 && (
              <>
                {/* <p>Selected File: {filesFront[0].name}</p> */}

                {previewUrlFront && (
                  <>
                    <br />
                    <img
                      src={previewUrlFront}
                      alt="Front of CIN Preview"
                      style={{ width: "100px", marginTop: "10px" }}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Back of CIN Upload */}
        <div className="col-4">
          <label>Upload Back of CIN</label>
          <div className="input-group">
            <div>
              <Upload beforeUpload={handleBeforeUploadBack}>
                <Button icon={<UploadOutlined />}>Select Back of CIN</Button>
              </Upload>
            </div>
            {filesBack.length > 0 && (
              <>
                {/* <p>Selected File: {filesBack[0].name}</p> */}
                {previewUrlBack && (
                  <img
                    src={previewUrlBack}
                    alt="Back of CIN Preview"
                    style={{ width: "100px", marginTop: "10px" }}
                  />
                )}
              </>
            )}
          </div>
        </div>
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
