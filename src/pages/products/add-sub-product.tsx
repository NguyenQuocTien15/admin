/** @format */

import { HeadComponent, ImagePicker } from '@/components';
import { fs } from '@/firebase/firabaseConfig';
import { HandleFile } from '@/utils/handleFile';
import { Button, Card, Divider, Form, Input, Select, Space } from 'antd';
import { addDoc, collection } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const { Option } = Select;

const AddSubProduct = () => {
	const [sizes, setSizes] = useState([
		'S',
		'XS',
		'M',
		'L',
		'XL',
		'XXL',
		'XXXL',
		'26',
		'27',
		'28',
		'29',
		'30',
		'31',
		'32',
		'33',
		'34',
		'35',
	]);
	const [sizeValue, setSizeValue] = useState('');
	const [files, setFiles] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const searchParams = useSearchParams();

	const id = searchParams.get('id');
	const [form] = Form.useForm();

	const handleAddSubProduct = async (values: any) => {
		const data: any = {};
		setIsLoading(true);

		for (const i in values) {
			data[`${i}`] = values[i] ?? '';
		}

		try {
			if (id) {
				const snap = await addDoc(collection(fs, 'subProducts'), {
					...data,
					productId: id,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				if (files) {
					HandleFile.HandleFiles(files, snap.id, 'subProducts');
				}
				setIsLoading(false);
				window.history.back();
				form.resetFields();
			}
		} catch (error) {
			console.log(error);
			setIsLoading(false);
		}
	};

	return (
		<div>
			<HeadComponent title='Add sub products' pageTitle='Add sub products' />

			<div className='col-md-8 offset-md-2'>
				<Card>
					<Form layout='vertical' onFinish={handleAddSubProduct} form={form}>
						<Form.Item name={'color'} label='Color'>
							<Input
								type='color'
								style={{
									width: '20%',
									padding: 0,
									border: 'none',
									borderRadius: 12,
								}}
							/>
						</Form.Item>
						<Form.Item name={'size'} label='Size'>
							<Select
								mode='multiple'
								dropdownRender={(menu) => (
									<>
										{menu}
										<Divider style={{ padding: 0 }} />
										<Space.Compact>
											<Input
												placeholder=''
												value={sizeValue}
												onChange={(val) => setSizeValue(val.target.value)}
												onPressEnter={() => {
													if (!sizes.includes(sizeValue)) {
														setSizes([...sizes, sizeValue]);
														setSizeValue('');
													}
												}}
											/>
										</Space.Compact>
									</>
								)}>
								{sizes.map((size) => (
									<Option value={size}>{size}</Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item name={'price'} label='Price'>
							<Input type='number' />
						</Form.Item>
						<Form.Item name={'quantity'} label='Quantity'>
							<Input type='number' />
						</Form.Item>
					</Form>
					<Space wrap>
						{files.length > 0 &&
							Object.keys(files).map(
								(key: any) =>
									key !== 'length' && (
										<img
											src={URL.createObjectURL(files[key as number])}
											style={{
												width: 200,
												height: 'auto',
											}}
											alt=''
										/>
									)
							)}
					</Space>
					<ImagePicker
						multible
						loading={isLoading}
						onSelected={(vals) => setFiles(vals)}
					/>
					<div className='mt-3 text-right'>
						<Button onClick={() => form.submit()}>Publish</Button>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default AddSubProduct;
