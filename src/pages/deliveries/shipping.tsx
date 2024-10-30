import React from "react";
import Layout from "../../components/Layout"; // Adjust path as needed
import { HeadComponent } from "@/components";

const Shipping: React.FC = () => {
  return (
    <Layout>
      <div className="mt-3">
        <HeadComponent
          title="Order Management"
          pageTitle="Đang vận chuyển"
        ></HeadComponent>
      </div>
    </Layout>
  );
};

export default Shipping;
