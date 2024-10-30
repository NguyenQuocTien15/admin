import React from "react";
import Layout from "../../components/Layout"; // Adjust path as needed
import { HeadComponent } from "@/components";

const WaitingForShipping: React.FC = () => {
  return (
    <Layout>
      <div className="mt-3">
        <HeadComponent
          title="Order Management"
          pageTitle="Chờ vận chuyển"
        ></HeadComponent>
      </div>
    </Layout>
  );
};

export default WaitingForShipping;
