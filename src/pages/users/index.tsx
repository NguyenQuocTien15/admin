/** @format */

import { collectionNames } from '@/constants/collectionNames';
import { fs } from '@/firebase/firabaseConfig';
import { UserModel } from '@/models/UserModel';
import { ColumnProps } from 'antd/es/table';
import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Button, Space, Table } from 'antd';
import { BiTrash } from 'react-icons/bi';

const Users = () => {
	const [users, setUsers] = useState<UserModel[]>([]);

	useEffect(() => {
		onSnapshot(collection(fs, collectionNames.users), (snap) => {
			if (snap.empty) {
				console.log('Data not found');
			} else {
				const items: UserModel[] = [];

				snap.forEach((item: any) =>
					items.push({
						id: item.id,
						...item.data(),
					})
				);

				setUsers(items);
			}
		});
	}, []);

	const columns: ColumnProps<UserModel>[] = [
		{
			key: 'Name',
			dataIndex: 'displayName',
			title: 'User name',
		},
		{
			key: 'email',
			dataIndex: 'email',
			title: 'Email',
		},
		{
			key: 'createdAt',
			dataIndex: 'creationTime',
			title: 'Sign up',
			render: (val: Date) => new Date(val).toISOString(),
			align: 'center',
		},
		{
			key: 'btn',
			title: '',
			dataIndex: '',
			render: (item: UserModel) => (
				<Space>
					<Button icon={<BiTrash size={20} />} danger type='text' />
				</Space>
			),
			align: 'right',
		},
	];

	return <Table dataSource={users} columns={columns} />;
};

export default Users;
