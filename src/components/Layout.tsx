// components/Layout.tsx

import React from "react";
import OrdersManagement from "./OrdersManagement"; // Adjust the path as needed

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <OrdersManagement />
      <main>{children}</main> {/* Render the page content here */}
    </>
  );
};

export default Layout;
