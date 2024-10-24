import { HeadComponent } from '@/components';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import React from 'react'

const NewOrders = () => {
  const router = useRouter();
  return (
    <div>
      <HeadComponent
        title="Delivery"
        pageTitle="New Order"
        extra={
          <Button
            type="primary"
            onClick={()=>router.push(`/deliveries/order-management`)}
          >
            Order Management
          </Button>
        }
      />
    </div>
  );
}

export default NewOrders
