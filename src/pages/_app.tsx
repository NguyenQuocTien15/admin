import "@/styles/globals.css";
import { Layout, Slider } from "antd";
import type { AppProps } from "next/app";

const {Header, Sider, Content} = Layout;
export default function App({ Component, pageProps }: AppProps) {
  return 
  <Layout>
    <Header/>
   <Layout>
   <Slider />
    <Content>
      <div className="container-fuild bg-white"></div>
      <div className="container p-4"></div>
    <Component {...pageProps} />
    </Content>
   </Layout>
  </Layout>
  ;
}
