/** @format */

import { HeadComponent, ImagePicker } from '@/components';
import { fs } from '@/firebase/firabaseConfig';
import { AddNewCategory } from '@/modals';
import { HandleFile } from '@/utils/handleFile';
import { Button, Card, Form, Image, Input, Select, message } from 'antd';
import {
	addDoc,
	collection,
	doc,
	getDoc,
	onSnapshot,
	updateDoc,
} from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BiAddToQueue } from 'react-icons/bi';

const AddNewProduct = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [files, setFiles] = useState<any[]>([]);
	const [imgUrl, setImgUrl] = useState('');
	const [categories, setCategories] = useState<any[]>([]);
	const [isVisibleModalAddCategory, setIsVisibleModalAddCategory] =
		useState(false);

	const [form] = Form.useForm();
	const searchParams = useSearchParams();
	const id = searchParams.get('id');

	useEffect(() => {
		id && getProductDetail(id);
	}, [id]);

	useEffect(() => {
		getCategories();
	}, []);

	const getProductDetail = async (id: string) => {
		try {
			const snap = await getDoc(doc(fs, `products/${id}`));
			if (snap.exists()) {
				const data = snap.data();

				form.setFieldsValue(data);

				if (data.imageUrl) {
					setImgUrl(data.imageUrl);
				}
			} else {
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleAddNewProduct = async (values: any) => {
		setIsLoading(true);

		const data: any = {};

		for (const i in values) {
			data[`${i}`] = values[i] ?? '';
		}

		try {
			data.updatedAt = Date.now();

			const snap = id
				? await updateDoc(doc(fs, `products/${id}`), data)
				: await addDoc(collection(fs, 'products'), {
						...data,
						createdAt: Date.now(),
						rate: 0,
				  });

			if (files && (snap || id)) {
				HandleFile.HandleFiles(
					files,
					id ? id : snap ? snap.id : '',
					'products'
				);
			}
			setIsLoading(false);
			window.history.back();
			form.resetFields();
		} catch (error: any) {
			message.error(error.message);
			setIsLoading(false);
		}
	};

	const getCategories = () => {
		onSnapshot(collection(fs, 'categories'), (snap) => {
			if (snap.empty) {
				console.log('Data not found!');
				setCategories([]);
			} else {
				const items: any[] = [];

				snap.forEach((item: any) => {
					items.push({
						value: item.id,
						label: item.data().title,
					});
				});

				setCategories(items);
			}
		});
	};

	return (
		<div>
			<HeadComponent
				title='Add new product'
				pageTitle='Add new product'
				extra={
					<Button
						type='primary'
						onClick={() => setIsVisibleModalAddCategory(true)}
						icon={<BiAddToQueue size={22} />}>
						Add new category
					</Button>
				}
			/>
			<div className='col-md-8 offset-md-2'>
				<Card title='Form add new'>
					<Form
						disabled={isLoading}
						size='large'
						form={form}
						layout='vertical'
						onFinish={handleAddNewProduct}>
						<Form.Item
							name={'title'}
							label='Title'
							rules={[
								{
									required: true,
									message: 'What is products title',
								},
							]}>
							<Input placeholder='Title' maxLength={150} allowClear />
						</Form.Item>
						<Form.Item name={'type'} label='Type'>
							<Input />
						</Form.Item>
						<Form.Item name={'categories'} label='Categories'>
							<Select mode='multiple' options={categories} />
						</Form.Item>
						<Form.Item name={'description'} label='Description'>
							<Input.TextArea rows={3} />
						</Form.Item>
						<Form.Item name={'price'} label='Price'>
							<Input type='number' />
						</Form.Item>
					</Form>

					{files.length > 0 && (
						<div>
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

					{files.length === 0 && imgUrl ? (
						<Image src={imgUrl} style={{ width: 200 }} />
					) : (
						<></>
					)}
					<ImagePicker
						loading={isLoading}
						onSelected={(vals) => setFiles(vals)}
					/>

					<div className='mt-3 text-right'>
						<Button
							loading={isLoading}
							onClick={() => form.submit()}
							type='primary'>
							Publish
						</Button>
					</div>
				</Card>
			</div>

			<AddNewCategory
				visible={isVisibleModalAddCategory}
				onClose={() => setIsVisibleModalAddCategory(false)}
			/>
		</div>
	);
};

export default AddNewProduct;
