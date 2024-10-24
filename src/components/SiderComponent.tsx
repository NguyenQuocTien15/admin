/** @format */

import { Layout, Menu, MenuProps } from 'antd';
import Link from 'next/link';
import React from 'react';
import { AiOutlineProduct } from 'react-icons/ai';
import { FaShoppingCart } from 'react-icons/fa';
import { BiHome, BiUser } from 'react-icons/bi';
import { FaRegEnvelope } from 'react-icons/fa'
import { FaPercentage } from 'react-icons/fa';
import { IoMdPricetag } from 'react-icons/io';
import { AiOutlineBarChart } from 'react-icons/ai';
import { SkinOutlined, UserAddOutlined } from '@ant-design/icons';


type MenuItem = Required<MenuProps>['items'][number];
const { Sider } = Layout;

const SiderComponent = () => {
	const items: MenuItem[] = [
    {
      key: "home",
      label: <Link href={"/"}>Home</Link>,
      icon: <BiHome />,
    },
    {
      key: "delivery",
      label: <Link href={"/deliveries"}>Delivery</Link>,
      icon: <FaShoppingCart />,
    },
    {
      key: "users",
      label: <Link href={"/users"}>Users</Link>,
      icon: <BiUser />,
    },
    {
      key: "shippers",
      label: <Link href={"/shippers"}>Shippers</Link>,
      icon: <UserAddOutlined />,
    },
    {
      key: "messengeruser",
      label: <Link href={"/messengeruser"}>MessengerUsers</Link>,
      icon: <FaRegEnvelope />,
    },
    {
      key: "offers",
      label: <Link href={"/offers"}>Offers</Link>,
      icon: <FaPercentage />,
    },
    {
      key: "categories",
      label: <Link href={"/categories"}>Categories</Link>,
      icon: <IoMdPricetag />,
    },
    {
      key: "brands",
      label: <Link href={"/brands"}>Brands</Link>,
      icon: <SkinOutlined />,
    },
    {
      key: "products",
      label: <Link href={"/products"}>Products</Link>,
      icon: <AiOutlineProduct />,
    },
    {
      key: "statistics",
      label: <Link href={"/"}>Statistics</Link>,
      icon: <AiOutlineBarChart />,
    },
  ];

	return (
		<Sider style={{ height: '100vh' }}>
			<Menu items={items} theme='dark' />
		</Sider>
	);
};

export default SiderComponent;
