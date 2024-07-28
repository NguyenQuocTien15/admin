/** @format */

import { fs } from '@/firebase/firabaseConfig';
import { CategoryModel } from '@/models/CategoryModel';
import { Avatar } from 'antd';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

type Props = {
	id?: string;
};

const AvatarComponent = (props: Props) => {
	const { id } = props;
	const [category, setCategory] = useState<CategoryModel>();

	useEffect(() => {
		id && getCategoryDetail();
	}, [id]);

	const getCategoryDetail = async () => {
		const api = `${'categories'}/${id}`;
		try {
			const snap: any = await getDoc(doc(fs, api));
			if (snap.exists()) {
				setCategory({
					id: snap.id,
					...snap.data(),
				});
			} else {
				console.log(`file not found`);
			}
		} catch (error) {
			console.log(error);
		}
	};

	return category ? category.title : '';
};

export default AvatarComponent;
