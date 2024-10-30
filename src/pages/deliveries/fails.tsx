import React from "react";
import Layout from "../../components/Layout"; // Adjust path as needed
import { HeadComponent } from "@/components";

const Fails: React.FC = () => {
  return (
    <Layout>
      <div className="mt-3">
        <HeadComponent
          title="Order Management"
          pageTitle="Giao thất bại"
        ></HeadComponent>
      </div>
    </Layout>
  );
};

export default Fails;
