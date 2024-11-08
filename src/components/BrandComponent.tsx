// ;/** @format */

// import { fs } from "@/firebase/firabaseConfig";
// import { BrandModel } from "@/models/BrandModel";
// import { doc, getDoc } from "firebase/firestore";
// import React, { useEffect, useState } from "react";

// type Props = {
//   id?: string;
// };

// const BrandComponent = (props: Props) => {
//   const { id } = props;
//   const [brand, setBrand] = useState<BrandModel>();

//   useEffect(() => {
//     id && getBrandsDetail();
//   }, [id]);

//   const getBrandsDetail = async () => {
//     const api = `${"brands"}/${id}`;
//     try {
//       const snap: any = await getDoc(doc(fs, api));
//       if (snap.exists()) {
//         setBrand({
//           id: snap.id,
//           ...snap.data(),
//         });
//       } else {
//         console.log(`file not found`);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return brand ? brand.title : "Loading...";
// };

// export default BrandComponent;
/** @format */

import { fs } from '@/firebase/firabaseConfig';
import { BrandModel } from '@/models/BrandModel';
import { OfferModel } from '@/models/OfferModel';
import { Avatar, Spin } from 'antd';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

type Props = {
	id?: string;
};

const AvatarComponent = ({ id }: Props) => {
	const [brand, setBrand] = useState<BrandModel>();
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		if (id) {
			getBrand();
		} else {
			setLoading(false); // Nếu không có id, kết thúc loading ngay lập tức
		}
	}, [id]);

	const getBrand = async () => {
		setLoading(true);
		const api = `brands/${id}`;
		try {
			const snap = await getDoc(doc(fs, 'brands', id as string));
			if (snap.exists()) {
				setBrand({
					id: snap.id,
					...snap.data(),
				} as BrandModel);
			} else {
				console.log(`Không tìm thấy brand`);
			}
		} catch (error) {
			console.error("Lỗi khi lấy chi tiết brand:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <Spin />; // Hiển thị loading spinner trong khi chờ dữ liệu
	}

	 	return brand ? brand.title : '';

};

export default AvatarComponent;
