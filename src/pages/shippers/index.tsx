import { HeadComponent } from "@/components";
import { Button } from "antd";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { ShipperModel } from "@/models/ShipperModel";
import AddNewShipper from "@/modals/AddNewShipper";
const Shippers = () => {
  const router = useRouter();
  const [isVisibleModalNewShipper, setIsVisibleModalNewShipper] = useState(false);
  const [shippers, setShippers] = useState<ShipperModel[]>([]);
  return (
    <div>
      <HeadComponent
        title="Shipper"
        pageTitle="Shipper"
        extra={
          <Button
            type="primary"
            onClick={() => router.push(`/shippers/add-shipper`)}
          >
            Add Shipper
          </Button>
        }
      />
    
    </div>
  );
};

export default Shippers;
