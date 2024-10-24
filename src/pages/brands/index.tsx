/** @format */

import { HeadComponent } from "@/components";
import { Button, Table } from "antd";



const Brands = () => {
 
  return (
    <div>
      <HeadComponent
        title="Brands"
        pageTitle="Brands"
        extra={
          <Button
            type="primary"
            onClick={() => console.log('123')}
          >
            Add new
          </Button>
        }
      />
    </div>
  );
};

export default Brands;
