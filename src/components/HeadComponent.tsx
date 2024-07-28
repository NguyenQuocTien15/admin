/** @format */

import { Typography } from 'antd';
import Head from 'next/head';
import React, { ReactNode } from 'react';

const { Title, Text } = Typography;

type Props = {
	title?: string;
	description?: string;
	extra?: ReactNode;
	pageTitle?: string;
};

const HeadComponent = (props: Props) => {
	const { title, description, extra, pageTitle } = props;

	return (
		<div>
			<Head>
				<title>{title ?? ''}</title>
				<meta name='description' content={description ?? ''} />
			</Head>
			{(pageTitle || description || extra) && (
				<div className='mb-3'>
					<div className='row'>
						<div className='col'>
							{pageTitle && <Title level={3}>{pageTitle}</Title>}
							{description && <Text>{description}</Text>}
						</div>
						<div className='col text-right'>{extra && extra}</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default HeadComponent;
