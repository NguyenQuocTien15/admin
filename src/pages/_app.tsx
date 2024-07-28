/** @format */

import { HeaderComponent, SiderComponent } from '@/components';
import { Layout } from 'antd';
import type { AppProps } from 'next/app';

const { Header, Content } = Layout;

export default function App({ Component, pageProps }: AppProps) {
	return (
		<Layout>
			<HeaderComponent />
			<Layout>
				<SiderComponent />
				<Content>
					<div className='container-fuild '>
						<div className='container p-4'>
							<Component {...pageProps} />
						</div>
					</div>
				</Content>
			</Layout>
		</Layout>
	);
}
