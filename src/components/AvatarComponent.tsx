/** @format */

import { fs } from '@/firebase/firebaseConfig';
import { Avatar } from 'antd';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

type Props = {
	path: string;
	id?: string;
	imageUrl?: string;
};

const AvatarComponent = (props: Props) => {
	const { id, path, imageUrl } = props;
	const [fileInfo, setFileInfo] = useState<{
		downloadUrl: string;
		path: string;
	}>();

	useEffect(() => {
		!imageUrl && id && getFileInfo();
	}, [path, id, imageUrl]);

	const getFileInfo = async () => {
		const api = `${path}/${id}`;
		try {
			const snap: any = await getDoc(doc(fs, api));
			if (snap.exists()) {
				setFileInfo({
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

	return (
		<Avatar src={imageUrl ? imageUrl : fileInfo ? fileInfo.downloadUrl : ''} />
	);
};

export default AvatarComponent;
