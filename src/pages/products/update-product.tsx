import { Form, Input, Select, Button, Card, Image, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { fs } from "@/firebase/firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import ImagePicker from "@/components/ImagePicker"; // Assuming this is a custom component
import { HandleFile } from "@/utils/handleFile";
import { useEffect, useState } from "react";

const UpdateProduct = () => {
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
  const router = useRouter();

  useEffect(() => {
    if (id) {
      getProductDetail(id); // Load the product data for editing
    }
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
        setSelectedColors(data.variations.map((v: any) => v.color) || []);
        const formattedColorData = data.variations.reduce(
          (acc: any, variation: any) => {
            acc[variation.color] = {
              image: variation.image || null,
              sizes: variation.sizes.reduce((sizeAcc: any, size: any) => {
                sizeAcc[size.sizeId] = size.quantity;
                return sizeAcc;
              }, {}),
            };
            return acc;
          },
          {}
        );
        setColorData(formattedColorData);
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

const handleUpdateProduct = async (values: any) => {
  setIsLoading(true);

  try {
    // Transform the color data to match the desired structure
    const variations = await Promise.all(
      selectedColors.map(async (color) => {
        const colorCode =
          colors.find((c) => c.value === color)?.colorCode || "defaultColor";

        // Handle color image upload or retain the existing image
        const imageUrl = colorData[color]?.image
          ? typeof colorData[color].image === "string"
            ? colorData[color].image // Keep existing image
            : await HandleFile.uploadSingleFile(
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
          image: imageUrl,
          sizes: colorSizes,
          colorCode,
        };
      })
    );

    // Prepare the product data
    const productData = {
      ...values,
      variations, // Include the updated variations array
      updatedAt: Date.now(),
    };

    // Upload main product image if updated
    if (files.length > 0) {
      const uploadedImage = await HandleFile.upload(files[0], "products");
      productData.imageUrl = uploadedImage;
    } else {
      productData.imageUrl = imgUrl; // Retain existing image
    }

    // Update product in Firestore
    const productDoc = doc(fs, `products/${id}`);
    await setDoc(productDoc, productData, { merge: true });

    message.success("Product updated successfully!");
    window.history.back();
    form.resetFields()
  } catch (error: any) {
    console.error("Error updating product:", error);
    message.error(`Failed to update product: ${error.message}`);
  } finally {
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

  const handleSizeChangeForColor = (color: string, sizes: string[]) => {
    setColorData((prev) => ({
      ...prev,
      [color]: {
        ...prev[color],
        sizes: sizes.reduce(
          (acc, size) => ({
            ...acc,
            [size]: prev[color]?.sizes?.[size] || 0, // Preserve existing quantity or default to 0
          }),
          {}
        ),
      },
    }));
  };


  const handleQuantityChange = (
    color: string,
    sizeId: string,
    quantity: number
  ) => {
    setColorData((prev) => ({
      ...prev,
      [color]: {
        ...prev[color],
        sizes: {
          ...prev[color]?.sizes,
          [sizeId]: quantity,
        },
      },
    }));
  };


  const handleImageUploadForColor = (color: string, file: File) => {
    setColorData((prev) => ({
      ...prev,
      [color]: {
        ...prev[color],
        image: file, // Store the file
      },
    }));
  };


  return (
    <Card title="Update Product">
      <Form form={form} layout="vertical" onFinish={handleUpdateProduct}>
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
            options={colors.map((color) => ({
              value: color.value,
              label: (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      backgroundColor: color.colorCode || "#000",
                      marginRight: 8,
                    }}
                  ></span>
                  {color.label}
                </div>
              ),
            }))}
            value={selectedColors}
            onChange={handleColorChange}
          />
        </Form.Item>

        {selectedColors.map((color) => (
          <div key={color}>
            <h3>Color: {color}</h3>

            {/* Image Upload and Display */}
            <Form.Item label="Color Image">
              <input
                type="file"
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUploadForColor(color, e.target.files[0]);
                  }
                }}
              />
              {colorData[color]?.image && (
                <img
                  src={
                    typeof colorData[color]?.image === "string"
                      ? colorData[color].image // Existing image URL
                      : URL.createObjectURL(colorData[color]?.image) // New file preview
                  }
                  alt={`Image for ${color}`}
                  width={100}
                />
              )}
            </Form.Item>

            {/* Sizes and Quantities */}
            <Form.Item label="Select Sizes">
              <Select
                mode="multiple"
                value={Object.keys(colorData[color]?.sizes || {})}
                onChange={(sizes) => handleSizeChangeForColor(color, sizes)}
                options={sizes.map((size) => ({
                  value: size.value,
                  label: size.label,
                }))}
              />
            </Form.Item>

            {Object.keys(colorData[color]?.sizes || {}).map((sizeId) => (
              <div key={sizeId} style={{ marginBottom: 16 }}>
                <Form.Item
                  label={`Size: ${
                    sizes.find((size) => size.value === sizeId)?.label ||
                    "Unknown"
                  }`}
                >
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={colorData[color]?.sizes[sizeId] || 0}
                    onChange={(e) =>
                      handleQuantityChange(
                        color,
                        sizeId,
                        parseInt(e.target.value, 10)
                      )
                    }
                  />
                </Form.Item>
              </div>
            ))}

            {Object.keys(colorData[color]?.sizes || {}).map((sizeId) => (
              <div key={sizeId} style={{ marginBottom: 16 }}>
                <Form.Item
                  label={`Size: ${
                    sizes.find((size) => size.value === sizeId)?.label ||
                    "Unknown"
                  }`}
                >
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={colorData[color]?.sizes[sizeId] || 0}
                    onChange={(e) =>
                      handleQuantityChange(
                        color,
                        sizeId,
                        parseInt(e.target.value, 10)
                      )
                    }
                  />
                </Form.Item>
              </div>
            ))}
          </div>
        ))}

        <Form.Item label="Main Image">
          <input
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setImgUrl(URL.createObjectURL(file)); // Create a preview URL for the selected image
                // Optionally, handle the file upload here
              }
            }}
          />
          {imgUrl && <img src={imgUrl} alt="Main Image" width={100} />}
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          style={{ marginTop: "16px" }}
        >
          Update Product
        </Button>
      </Form>
    </Card>
  );
};

export default UpdateProduct;
