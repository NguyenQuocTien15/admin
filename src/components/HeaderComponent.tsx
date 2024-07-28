/** @format */

import { auth } from '@/firebase/firabaseConfig';
import { Layout } from 'antd';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
const { Header } = Layout;

const HeaderComponent = () => {
	// const router = useRouter();

	// useEffect(() => {
	// 	onAuthStateChanged(auth, (user) => {
	// 		if (!user) {
	// 			router.push('/');
	// 		}
	// 	});
	// }, []);

	return <Header />;
};

export default HeaderComponent;
