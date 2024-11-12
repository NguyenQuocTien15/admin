// pages/OrdersManagement.tsx

import React from "react";
import Layout from "./Layout";
import styles from "./NavBar.module.css"; // Adjust path as needed
import Link from "next/link";
import { useRouter } from "next/router";

const linkItems = [
  { href: "/deliveries/", label: "Đơn hàng mới" },
  { href: "/deliveries/preparing", label: "Đang chuẩn bị" },
  { href: "/deliveries/packaged", label: "Đã đóng gói" },
  { href: "/deliveries/waitingforshipping", label: "Chờ vận chuyển" },
  { href: "/deliveries/shipping", label: "Đang vận chuyển" },
  { href: "/deliveries/delivered", label: "Đã giao hàng" },
  { href: "/deliveries/fails", label: "Giao thất bại" },
  { href: "/deliveries/returnorder", label: "Trả kho" },
  { href: "/deliveries/receivedBack", label: "Đã nhận lại hàng" },
];

const OrdersManagement: React.FC = () => {
  const router = useRouter(); // Get router object

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        {linkItems.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.link} ${
              router.pathname === `/${link.href}` ? styles.active : ""
            }`}
            aria-label={link.label} // Adding aria-label for accessibility
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default OrdersManagement;
