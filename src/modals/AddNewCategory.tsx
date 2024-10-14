/** @format */

import { ImagePicker } from '@/components';
import { fs } from '@/firebase/firabaseConfig';
import { HandleFile } from '@/utils/handleFile';
import { Form, Input, Modal, message } from 'antd';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';

type Props = {
	visible: boolean;
	onClose: () => void;
};

const AddNewCategory = (props: Props) => {
	const { visible, onClose } = props;

	const [isLoading, setIsLoading] = useState(false);
	const [title, settitle] = useState('');
	const [files, setFiles] = useState<any[]>([]);

	const handleClose = () => {
		settitle('');
		setFiles([]);
		onClose();
	};

	const handleAddNewCategory = async (values: any) => {
		if (!title) {
			message.error('Missing category title');
		} else if (files.length === 0) {
			message.error('Missing image');
		} else {
			setIsLoading(true);

			try {
				const snap = await addDoc(collection(fs, 'categories'), {
					title,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				if (files && files.length > 0) {
					await HandleFile.HandleFiles(files, snap.id, 'categories');
				}
				handleClose();
				setIsLoading(false);
			} catch (error: any) {
				message.error(error.message);
				setIsLoading(false);
			}
		}
	};

	return (
		<Modal
			open={visible}
			onOk={handleAddNewCategory}
			loading={isLoading}
			onCancel={handleClose}
			title='Add new category'>
			<div className='mb-3 mt-3'>
				<Input
					size='large'
					placeholder='title'
					maxLength={150}
					showCount
					allowClear
					value={title}
					onChange={(val) => settitle(val.target.value)}
				/>
				{files.length > 0 && (
					<div className='mt-4'>
						<img
							src={URL.createObjectURL(files[0])}
							style={{
								width: 200,
								height: 'auto',
							}}
							alt=''
						/>
					</div>
				)}
				<ImagePicker
					loading={isLoading}
					onSelected={(vals) => setFiles(vals)}
				/>
			</div>
		</Modal>
	);
};

export default AddNewCategory;
