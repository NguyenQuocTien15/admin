import { useState, useEffect } from "react";
import { Form, Input, Select, Button, Card, Image, message } from "antd";
import { useSearchParams } from "next/navigation";
import { fs } from "@/firebase/firabaseConfig";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import ImagePicker from "@/components/ImagePicker"; // Assuming this is a custom component
import { HandleFile } from "@/utils/handleFile";


const AddNewProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [imgUrl, setImgUrl] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [brand, setBrand] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [colorData, setColorData] = useState<any>({}); // Track sizes and images for each color
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) getProductDetail(id);
    getCategories();
    getSizes();
    getBrands();
  }, [id]);

  const getProductDetail = async (id: string) => {
    try {
      const snap = await getDoc(doc(fs, `products/${id}`));
      if (snap.exists()) {
        const data = snap.data();
        form.setFieldsValue(data);
        setImgUrl(data.imageUrl || "");
        setSelectedColors(data.color || []);
        setColorData(data.colorData || {});
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getCategories = () => {
    onSnapshot(collection(fs, "categories"), (snap) => {
      setCategories(
        snap.docs.map((doc) => ({ value: doc.id, label: doc.data().title }))
      );
    });
  };

  const getBrands = () => {
    onSnapshot(collection(fs, "brands"), (snap) => {
      setBrand(
        snap.docs.map((doc) => ({ value: doc.id, label: doc.data().title }))
      );
    });
  };

  const getSizes = () => {
    onSnapshot(collection(fs, "sizes"), (snap) => {
      setSizes(
        snap.docs.map((doc) => ({ value: doc.id, label: doc.data().sizeName }))
      );
    });
  };
  


  // const handleAddNewProduct = async (values: any) => {
  //   setIsLoading(true);
  //   try {
  //     const data = {
  //       ...values,
  //       colorData,
  //       createdAt: Date.now(),
  //       updatedAt: Date.now(),
  //     };
  //     const snap = await addDoc(collection(fs, "products"), data);

  //     if (files.length > 0) {
  //       HandleFile.HandleFiles(files, snap.id, "products"); // Assuming this uploads images
  //     }

  //     setIsLoading(false);
  //     message.success("Product added successfully!");
  //     form.resetFields();
  //     setColorData({});
  //   } catch (error: any) {
  //     message.error(error.message);
  //     setIsLoading(false);
  //   }
  // };

  const handleAddNewProduct = async (values: any) => {
    setIsLoading(true);

    const sizeQuantities = Object.keys(colorData).reduce((acc: any, color) => {
      acc[color] = colorData[color].sizes;
      return acc;
    }, {});

    const productData: any = {
      ...values,
      color: selectedColors,
      sizeQuantities, // Include sizeQuantities in productData
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      const uploadedColorImages = await Promise.all(
        selectedColors.map(async (color) => {
          if (colorData[color].image) {
            const imageUrl = await HandleFile.uploadSingleFile(
              colorData[color].image,
              `products/${color}`
            );
            return { color, imageUrl };
          }
          return null;
        })
      );

      productData.colorImages = uploadedColorImages.reduce((acc, item) => {
        if (item) acc[item.color] = item.imageUrl;
        return acc;
      }, {});

      const productRef = await addDoc(collection(fs, "products"), productData);

      if (files.length > 0) {
        await HandleFile.HandleFiles(files, productRef.id, "products");
      }

      setIsLoading(false);
      form.resetFields();
      message.success("Product added successfully!");
    } catch (error: any) {
      message.error(`Failed to add product: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleColorChange = (selectedValues: string[]) => {
    setSelectedColors(selectedValues);
    setColorData((prev: any) => {
      const updatedData = { ...prev };
      selectedValues.forEach((color) => {
        if (!updatedData[color]) {
          updatedData[color] = { sizes: {}, image: null };
        }
      });
      Object.keys(updatedData).forEach((color) => {
        if (!selectedValues.includes(color)) {
          delete updatedData[color];
        }
      });
      return updatedData;
    });
  };

  const handleSizeChangeForColor = (color: string, selectedSizes: string[]) => {
    setColorData((prev: { [x: string]: { sizes: { [x: string]: number; }; }; }) => ({
      ...prev,
      [color]: {
        ...prev[color],
        sizes: selectedSizes.reduce((acc: any, sizeId: string) => {
          acc[sizeId] = prev[color]?.sizes[sizeId] || 0;
          return acc;
        }, {}),
      },
    }));
  };

  const handleQuantityChange = (
    color: string,
    sizeId: string,
    quantity: number
  ) => {
    setColorData((prev: { [x: string]: { sizes: any; }; }) => ({
      ...prev,
      [color]: {
        ...prev[color],
        sizes: {
          ...prev[color].sizes,
          [sizeId]: quantity,
        },
      },
    }));
  };

 const handleImageUploadForColor = (color: string, file: any) => {
   if (file instanceof Blob) {
     // Check if file is a Blob (File is a subclass of Blob)
     setColorData((prev: { [x: string]: any }) => ({
       ...prev,
       [color]: { ...prev[color], image: file },
     }));
   } else {
     console.error("Invalid file type");
   }
 };


  return (
    <Card title="Add New Product">
      <Form form={form} layout="vertical" onFinish={handleAddNewProduct}>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input placeholder="Product title" />
        </Form.Item>

        <Form.Item name="categories" label="Categories">
          <Select mode="multiple" options={categories} />
        </Form.Item>

        <Form.Item name="brand" label="Brand">
          <Select options={brand} />
        </Form.Item>

        <Form.Item name="price" label="Price">
          <Input type="number" />
        </Form.Item>

        {/* Color Selection */}
        <Form.Item name="colors" label="Colors">
          <Select
            mode="multiple"
            value={selectedColors}
            onChange={handleColorChange}
          />
        </Form.Item>

        {/* Render Sizes and Quantities for Each Selected Color */}
        {selectedColors.map((color) => (
          <div key={color}>
            <h4>{`Settings for color: ${color}`}</h4>
            <Form.Item label="Select Sizes">
              <Select
                mode="multiple"
                onChange={(sizes) => handleSizeChangeForColor(color, sizes)}
                options={sizes}
              />
            </Form.Item>

            {Object.keys(colorData[color]?.sizes || {}).map((sizeId) => (
              <Form.Item
                key={sizeId}
                label={`Quantity for size ${
                  sizes.find((size) => size.value === sizeId)?.label
                }`}
              >
                <Input
                  type="number"
                  value={colorData[color].sizes[sizeId]}
                  onChange={(e) =>
                    handleQuantityChange(
                      color,
                      sizeId,
                      parseInt(e.target.value)
                    )
                  }
                />
              </Form.Item>
            ))}

            <Form.Item label={`Image for color ${color}`}>
              <ImagePicker
                onSelected={(files) =>
                  handleImageUploadForColor(color, files[0])
                }
              />
              {colorData[color]?.image && (
                <Image
                  src={URL.createObjectURL(colorData[color].image)}
                  width={100}
                />
              )}
            </Form.Item>
          </div>
        ))}

        <Button type="primary" htmlType="submit" loading={isLoading}>
          Publish
        </Button>
      </Form>
    </Card>
  );
};

export default AddNewProduct;
