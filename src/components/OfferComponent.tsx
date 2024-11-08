/** @format */

import { fs } from '@/firebase/firabaseConfig';
import { OfferModel } from '@/models/OfferModel';
import { Avatar, Spin } from 'antd';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

type Props = {
	id?: string;
};

const AvatarComponent = ({ id }: Props) => {
	const [offer, setOffer] = useState<OfferModel>();
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		if (id) {
			getOfferDetail();
		} else {
			setLoading(false); // Nếu không có id, kết thúc loading ngay lập tức
		}
	}, [id]);

	const getOfferDetail = async () => {
		setLoading(true);
		const api = `offers/${id}`;
		try {
			const snap = await getDoc(doc(fs, 'offers', id as string));
			if (snap.exists()) {
				setOffer({
					id: snap.id,
					...snap.data(),
				} as OfferModel);
			} else {
				console.log(`Không tìm thấy promotion`);
			}
		} catch (error) {
			console.error("Lỗi khi lấy chi tiết promotion:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <Spin />; // Hiển thị loading spinner trong khi chờ dữ liệu
	}

	 	return offer ? offer.title : '';

};

export default AvatarComponent;
