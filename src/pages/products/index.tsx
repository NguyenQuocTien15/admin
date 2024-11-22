/** @format */

import { HeadComponent } from "@/components";
import AvatarComponent from "@/components/AvatarComponent";
import BrandComponent from "@/components/BrandComponent";
import CategoryComponent from "@/components/CategoryComponent";
import OfferComponent from "@/components/OfferComponent";
import { fs } from "@/firebase/firebaseConfig";
import { ProductModel } from "@/models/ProductModel";
import {
  Button,
  message,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Image,
} from "antd";
import { ColumnProps } from "antd/es/table";
import {
  collection,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Router from "next/router";
import { FaEdit } from "react-icons/fa";
import { DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import Offers from "../offers";

const DisplayProduct = () => {
  const [products, setProducts] = useState<[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: string }>({});
  const [colors, setColors] = useState<{ [key: string]: string }>({});
  const [sizes, setSizes] = useState<{ [key: string]: string }>({});
  const [brands, setBrands] = useState<{ [key: string]: string }>({});
  const [offers, setOffers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  // Fetch categories, colors, and sizes
  useEffect(() => {
    const unsubscribeCategories = onSnapshot(
      collection(fs, "categories"),
      (snapshot) => {
        const categoryMap: { [key: string]: string } = {};
        snapshot.docs.forEach((doc) => {
          categoryMap[doc.id] = doc.data().title;
        });
        setCategories(categoryMap);
      }
    );

    const unsubscribeColors = onSnapshot(
      collection(fs, "colors"),
      (snapshot) => {
        const colorMap: { [key: string]: string } = {};
        snapshot.docs.forEach((doc) => {
          colorMap[doc.id] = doc.data().colorName;
        });
        setColors(colorMap);
      }
    );

    const unsubscribeSizes = onSnapshot(collection(fs, "sizes"), (snapshot) => {
      const sizeMap: { [key: string]: string } = {};
      snapshot.docs.forEach((doc) => {
        sizeMap[doc.id] = doc.data().sizeName;
      });
      setSizes(sizeMap);
    });

    return () => {
      unsubscribeCategories();
      unsubscribeColors();
      unsubscribeSizes();
    };
  }, []);

  // Fetch brand names
  const fetchBrands = async () => {
    const brandSnapshot = await getDocs(collection(fs, "brands"));
    const brandMapping: { [key: string]: string } = {};
    brandSnapshot.forEach((doc) => {
      const data = doc.data();
      brandMapping[doc.id] = data.title; // Assuming the brand name is in the `title` field
    });
    setBrands(brandMapping);
  };
   const fetchOffers= async () => {
     const offerSnapshot = await getDocs(collection(fs, "offers"));
     const offerMapping: { [key: string]: string } = {};
     offerSnapshot.forEach((doc) => {
       const data = doc.data();
       offerMapping[doc.id] = data.title; // Assuming the offer name is in the `title` field
     });
     setOffers(offerMapping);
   };


  useEffect(() => {
    fetchBrands();
    fetchOffers()
  }, []);
  useEffect(() => {
    const unsubscribeSizes = onSnapshot(collection(fs, "sizes"), (snapshot) => {
      const sizeMap: { [key: string]: string } = {};
      snapshot.docs.forEach((doc) => {
        sizeMap[doc.id] = doc.data().sizeName;
      });
      setSizes(sizeMap);
    });

    return () => unsubscribeSizes();
  }, []);

  // Fetch products and enhance data
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(fs, "products"),
      (snapshot) => {
        const productList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            categories: data.categories?.map(
              (id: string) => categories[id] || id
            ),
            brand: data.brand,
            offer: data.offer,
            colors: data.colors?.map((id: string) => colors[id] || id),
            variations:
              data.variations?.map((variation: any) => ({
                color: colors[variation.color] || variation.color,
                sizes: variation.sizes.map((size: any) => ({
                  size: sizes[size.sizeId] || size.sizeId,
                  quantity: size.quantity,
                })),
              })) || [], // Handle variations properly
            importPrice: data.importPrice,
            price: data.price,
            imageUrl: data.imageUrl,
            createdAt: data.createdAt,
          };
        });
        setProducts(productList);
        setLoading(false);
      },
      (error) => {
        message.error(`Failed to fetch products: ${error.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [categories, colors, sizes, offers]);

  // Handle delete product
  const handleDelete = (productId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this product?",
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteDoc(doc(fs, "products", productId));
          message.success("Product deleted successfully");
        } catch (error: any) {
          message.error(`Failed to delete product: ${error.message}`);
        }
      },
    });
  };

  // Define table columns
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 200,
    },
    {
      title: "Category",
      dataIndex: "categories",
      key: "categories",
      render: (categories: string[]) =>
        categories?.length > 0 ? (
          <div>
            {categories.map((category, index) => (
              <div key={index}>{category}</div>
            ))}
          </div>
        ) : (
          "No categories"
        ),
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      render: (brandId: string) => brands[brandId] || "Unknown",
    },
    {
      title: "Colors",
      dataIndex: "colors",
      key: "colors",
      render: (colors: string[]) =>
        colors?.length > 0 ? (
          <div>
            {colors.map((color, index) => (
              <div key={index}>{color}</div>
            ))}
          </div>
        ) : (
          "No colors"
        ),
      width: 70,
    },

    {
      title: "Sizes",
      dataIndex: "variations",
      key: "variations",
      render: (variations: any[]) => {
        return variations?.length > 0 ? (
          <div>
            {variations.map((variation, index) => (
              <div key={index}>
                <strong>{variation.color}:</strong>
                {variation.sizes?.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {variation.sizes.map((size: any, idx: number) => (
                      <li key={idx}>
                        {sizes[size.size] || size.size} - {size.quantity}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "No sizes"
                )}
              </div>
            ))}
          </div>
        ) : (
          "No variations"
        );
      },
    },

    {
      title: "I-Price",
      dataIndex: "importPrice",
      key: "importPrice",
      render: (price: number) => (price ? `$${price}` : "N/A"),
      width: 75,
    },

    {
      key: "offer",
      title: "Offer",
      dataIndex: "offer",
      render: (offerId: string) => offers[offerId] || "Unknown",
    },
    {
      title: "S-Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => (price ? `$${price}` : "N/A"),
      width: 80,
    },

    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl: string) =>
        imageUrl ? <Image src={imageUrl} width={50} /> : "No image",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (timestamp: number) =>
        new Date(timestamp).toLocaleString() || "N/A",
      width: 110,
    },
    {
      title: "Action",
      align: "right",
      dataIndex: "",
      render: (item: { id: string }) => (
        <Space>
          <Tooltip title="Edit product">
            <Button
              type="text"
              icon={<FaEdit color="green" size={20} />}
              onClick={() =>
                Router.push(`/products/update-product?id=${item.id}`)
              }
            />
          </Tooltip>
          <Tooltip title="Delete product">
            <Button
              type="text"
              icon={<DeleteOutlined size={20} style={{ color: "red" }} />}
              onClick={() => handleDelete(item.id)}
            />
          </Tooltip>
        </Space>
      ),
      width: 40,
    },
  ];

  return (
    <div>
      <HeadComponent
        title="Products"
        pageTitle="Products"
        extra={
          <Button
            type="primary"
            onClick={() => Router.push("/products/add-new-product")}
          >
            Add product
          </Button>
        }
      />
      <Table
        loading={loading}
        dataSource={products}
        columns={columns}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </div>
  );
};

export default DisplayProduct;
