;/** @format */

import { fs } from "@/firebase/firabaseConfig";
import { BrandModel } from "@/models/BrandModel";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

type Props = {
  id?: string;
};

const BrandComponent = (props: Props) => {
  const { id } = props;
  const [brand, setBrand] = useState<BrandModel>();

  useEffect(() => {
    id && getBrandsDetail();
  }, [id]);

  const getBrandsDetail = async () => {
    const api = `${"brands"}/${id}`;
    try {
      const snap: any = await getDoc(doc(fs, api));
      if (snap.exists()) {
        setBrand({
          id: snap.id,
          ...snap.data(),
        });
      } else {
        console.log(`file not found`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return brand ? brand.title : "Loading...";
};

export default BrandComponent;
