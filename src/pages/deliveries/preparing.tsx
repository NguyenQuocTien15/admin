import React from "react";
import Layout from "../../components/Layout"; // Adjust path as needed
import { HeadComponent } from "@/components";

const Preparing: React.FC = () => {
  return (
    <Layout>
      <div className="mt-3">
        <HeadComponent
          title="Order Management"
          pageTitle="Đang chuẩn bị"
        ></HeadComponent>
      </div>
    </Layout>
  );
};

export default Preparing;
