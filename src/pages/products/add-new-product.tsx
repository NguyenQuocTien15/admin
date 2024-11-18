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
  const [colors, setColors] = useState<any[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [colorData, setColorData] = useState<any>({}); // Track sizes and images for each color
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    id && getProductDetail(id);
    getCategories();
    getSizes();
    getBrands();
    getColors();
  }, [id]);

  const getProductDetail = async (id: string) => {
    try {
      const snap = await getDoc(doc(fs, `products/${id}`));
      if (snap.exists()) {
        const data = snap.data();
        form.setFieldsValue(data);
        setImgUrl(data.imageUrl || "");
        setSelectedColors(data.color || []);
        setColorData(data.colorData || {}); // Make sure the colorData includes sizes and quantities
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
  const getColors = () => {
    onSnapshot(collection(fs, "colors"), (snap) => {
      setColors(
        snap.docs.map((doc) => ({
          value: doc.id,
          label: doc.data().colorName,
          colorCode: doc.data().colorCode, // Assuming there's a colorCode field
        }))
      );
    });
  };

  const handleAddNewProduct = async (values: any) => {
    setIsLoading(true);

    // Transform the color data to match the desired structure
    const variations = await Promise.all(
      selectedColors.map(async (color) => {
        // Upload the image for each color and wait for the URL
        const colorCode =
          colors.find((c) => c.value === color)?.colorCode || "defaultColor";
        const imageUrl = colorData[color]?.image
          ? await HandleFile.uploadSingleFile(
              colorData[color].image,
              `products/${color}`
            )
          : "";

        const colorSizes = Object.keys(colorData[color]?.sizes || {}).map(
          (sizeId) => {
            return {
              sizeId: parseInt(sizeId, 10), // Convert sizeId to an integer

              quantity: colorData[color]?.sizes[sizeId] || 0,
            };
          }
        );

        return {
          color,
          image: imageUrl, // Ensure image URL is resolved before saving to Firestore
          sizes: colorSizes,
          colorCode,
        };
      })
    );

    const productData = {
      ...values,
      variations, // Include the variations array in the product data
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      // Upload product data to Firestore
      const productRef = await addDoc(collection(fs, "products"), productData);

      // Upload additional files if any
      if (files.length > 0) {
        await HandleFile.HandleFiles(files, productRef.id, "products");
      }

      setIsLoading(false);
      window.history.back()
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

  const handleSizeChangeForColor = (
    colors: string,
    selectedSizes: string[]
  ) => {
    setColorData(
      (prev: { [x: string]: { sizes: { [x: string]: number } } }) => ({
        ...prev,
        [colors]: {
          ...prev[colors],
          sizes: selectedSizes.reduce((acc: any, sizeId: string) => {
            acc[sizeId] = prev[colors]?.sizes[sizeId] || 0;
            return acc;
          }, {}),
        },
      })
    );
  };

  const handleQuantityChange = (
    colors: string,
    sizeId: string,
    quantity: number
  ) => {
    setColorData((prev: { [x: string]: { sizes: any } }) => ({
      ...prev,
      [colors]: {
        ...prev[colors],
        sizes: {
          ...prev[colors].sizes,
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
        <Form.Item name={"type"} label="Type">
          <Input />
        </Form.Item>
        <Form.Item name="categories" label="Categories">
          <Select mode="multiple" options={categories} />
        </Form.Item>

        <Form.Item name="brand" label="Brand">
          <Select options={brand} />
        </Form.Item>
        <Form.Item name={"description"} label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="importPrice" label="Import Price">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="price" label="Selling Price">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="colors" label="Colors">
          <Select
            mode="multiple"
            options={colors.map((colors) => ({
              value: colors.value,
              label: (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      backgroundColor: colors.colorCode || "#000",
                      marginRight: 8,
                    }}
                  />
                  {colors.label}
                </div>
              ),
            }))}
            onChange={handleColorChange}
          />
        </Form.Item>

        {selectedColors.map((color) => (
          <div key={color}>
            <h4>{`Settings for color: ${color}`}</h4>
            <Form.Item label="Select Sizes">
              <Select
                mode="multiple"
                value={Object.keys(colorData[color]?.sizes || {})}
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

        <Form.Item label="Product Image">
          <ImagePicker
            onSelected={(files) => {
              if (files.length > 0) {
                const file = files[0];
                setImgUrl(URL.createObjectURL(file)); // Preview the image
                setFiles([file]); // Save the file for uploading
              }
            }}
          />
          {imgUrl && <Image src={imgUrl} width={100} />}
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={isLoading}>
          Publish
        </Button>
      </Form>
    </Card>
  );
};

export default AddNewProduct;
