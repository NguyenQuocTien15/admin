/** @format */

import { Button, Modal, Space, Table } from 'antd';
import { ColumnProps } from 'antd/es/table';

import { HeadComponent } from '@/components';
import AvatarComponent from '@/components/AvatarComponent';
import { collectionNames } from '@/constants/collectionNames';
import { fs } from '@/firebase/firabaseConfig';
import { OfferModel } from '@/models/OfferModel';
import { DateTime } from '@/utils/dateTime';
import { HandleFile } from '@/utils/handleFile';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BiTrash } from 'react-icons/bi';

const { confirm } = Modal;

const Offers = () => {
	const [offers, setOffer] = useState<OfferModel[]>([]);
	const router = useRouter();

	useEffect(() => {
		onSnapshot(collection(fs, collectionNames.offers), (snap) => {
			if (snap.empty) {
				console.log('Data not found');
			} else {
				const items: any[] = [];

				snap.forEach((item: any) =>
					items.push({
						id: item.id,
						...item.data(),
					})
				);

				setOffer(items);
			}
		});
	}, []);

	const columns: ColumnProps<any>[] = [
		{
			key: 'avatar',
			dataIndex: '',
			title: '',
			render: (item: OfferModel) => (
				<AvatarComponent
					imageUrl={item.imageUrl}
					id={item.files && item.files.length > 0 ? item.files[0] : ''}
					path='files'
				/>
			),
		},
		{
			key: 'title',
			dataIndex: 'title',
			title: 'Title',
		},
		{
			key: 'percent',
			dataIndex: 'percent',
			title: 'Percent (%)',
		},
		{
			key: 'start',
			dataIndex: 'startAt',
			title: 'Start at',
			render: (time: number) => DateTime.getDate(time),
		},
		{
			key: 'end',
			dataIndex: 'endAt',
			title: 'End at',
			render: (time: number) => DateTime.getDate(time),
		},
		{
			key: 'code',
			dataIndex: 'code',
			title: 'Code',
		},

		{
			key: 'btn',
			title: '',
			dataIndex: '',
			render: (item: OfferModel) => (
				<Space>
					<Button
						onClick={() =>
							confirm({
								title: 'Confirm',
								content: 'Delete offer?',
								onOk: () => handleDeletOffer(item),
							})
						}
						icon={<BiTrash size={20} />}
						danger
						type='text'
					/>
				</Space>
			),
			align: 'right',
		},
	];

	const handleDeletOffer = async (item: OfferModel) => {
		if (item.files && item.files.length > 0) {
			item.files.forEach(async (fileId) => await HandleFile.removeFile(fileId));
		}

		await deleteDoc(doc(fs, `offers/${item.id}`));
	};

	// const handleUpdate = async () => {
	// 	if (offers.length > 0) {
	// 		offers.forEach(async (cat) => {
	// 			if (cat.files && cat.files.length > 0) {
	// 				const fileId = cat.files[0];

	// 				const snap = await getDoc(doc(fs, `files/${fileId}`));
	// 				if (snap.exists()) {
	// 					const data = snap.data();
	// 					await updateDoc(doc(fs, `offers/${cat.id}`), {
	// 						imageUrl: data.downloadUrl,
	// 					});

	// 					console.log('Done');
	// 				}
	// 			}
	// 		});
	// 	}
	// };

	return (
		<>
			<HeadComponent
				title='Offers'
				pageTitle='Offers'
				extra={
					<Button
						type='primary'
						onClick={() => router.push('/offers/add-new-offer')}>
						Add new
					</Button>
				}
			/>
			<Table dataSource={offers} columns={columns} />
		</>
	);
};

export default Offers;
