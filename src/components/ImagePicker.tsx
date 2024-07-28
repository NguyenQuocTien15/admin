/** @format */

import { Button } from 'antd';
import React, { useRef } from 'react';
import { BiUpload } from 'react-icons/bi';

interface Props {
	onSelected: (files: any) => void;
	multible?: boolean;
	accept?: '';
	loading?: boolean;
}

const ImagePicker = (props: Props) => {
	const { onSelected, multible, accept, loading } = props;

	const fileRef = useRef<any>(null);

	return (
		<div>
			<Button
				loading={loading}
				className='mt-2'
				onClick={() => {
					if (fileRef.current) {
						fileRef.current?.click();
					}
				}}
				icon={<BiUpload size={18} />}>
				Upload
			</Button>
			<div className='d-none'>
				<input
					type='file'
					ref={fileRef}
					multiple={multible}
					onChange={(val) => onSelected(val.target.files)}
					accept={accept ?? 'image/*'}
					name=''
					id=''
				/>
			</div>
		</div>
	);
};

export default ImagePicker;
