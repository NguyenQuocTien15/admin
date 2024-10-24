import { HeadComponent } from '@/components';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import React from 'react'

const OrderManagements = () => {
    const router = useRouter();
  return (
    <div>
      <div>
        <HeadComponent
          title="Delivery"
          pageTitle="Order Management"
          extra={
            <Button
              type="primary"
              onClick={() => router.back()}
            >
              Back
            </Button>
          }
        />
      </div>
    </div>
  );
}

export default OrderManagements
