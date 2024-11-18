/** @format */

import React from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';

const Home = () => {
  const router = useRouter();
  const auth = getAuth();

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await auth.signOut(); // Đăng xuất người dùng
      router.push('/login'); // Chuyển hướng về trang login
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  return (
    <div>
      <h1>Home</h1>
      {/* Nút logout */}
     
    </div>
  );
};

export default Home;
