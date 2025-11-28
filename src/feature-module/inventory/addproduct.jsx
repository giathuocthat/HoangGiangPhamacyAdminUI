import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../routes/all_routes";
import { Editor } from "primereact/editor";
import { productApi, categoryApi, brandApi, fileUploadApi } from "../../services/api.service";
import CommonSelect from "../../components/select/common-select";

const AddProduct = () => {
  const route = all_routes;
  const navigate = useNavigate();

  // State for dropdowns
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Form State
  const [productName, setProductName] = useState("");
  const [slug, setSlug] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  // Replaced thumbnailUrl with productImages array
  const [productImages, setProductImages] = useState([]);

  // Medical Details
  const [ingredients, setIngredients] = useState("");
  const [usageInstructions, setUsageInstructions] = useState("");
  const [contraindications, setContraindications] = useState("");

  // Variants
  const [productType, setProductType] = useState("single");
  const [variants, setVariants] = useState([
    {
      sku: "",
      price: 0,
      originalPrice: 0,
      stockQuantity: 0,
      weight: 0,
      dimensions: "",
      imageUrl: "",
    }
  ]);

  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [categoriesData, brandsData] = await Promise.all([
        categoryApi.getAllCategories(),
        brandApi.getBrands(1, 100)
      ]);

      console.log("Categories data:", categoriesData);
      console.log("Brands data:", brandsData);

      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData.map(c => ({ label: c.name, value: c.id })));
      } else if (categoriesData?.data) {
        setCategories(categoriesData.data.map(c => ({ label: c.name, value: c.id })));
      }

      if (brandsData?.data && Array.isArray(brandsData.data)) {
        setBrands(brandsData.data.map(b => ({ label: b.name, value: b.id })));
      } else if (Array.isArray(brandsData)) {
        setBrands(brandsData.map(b => ({ label: b.name, value: b.id })));
      }

    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleGenerateSlug = () => {
    const generatedSlug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generatedSlug);
  };

  const handleImageUpload = async (file, isProductImage = true, variantIndex = null) => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    console.log("Uploading file:", {
      name: file.name,
      size: file.size,
      type: file.type,
      isProductImage,
      variantIndex
    });

    setIsUploading(true);
    try {
      const response = await fileUploadApi.uploadFile(file, 1);
      console.log("Upload response:", response);

      // API returns { data: { fileUrl: "..." } }
      const uploadedUrl = response.data?.fileUrl || response.fileUrl;

      if (!uploadedUrl) {
        throw new Error("No file URL in response");
      }

      if (isProductImage) {
        // Append new image to the list
        setProductImages(prev => [...prev, uploadedUrl]);
      } else if (variantIndex !== null) {
        const newVariants = [...variants];
        newVariants[variantIndex].imageUrl = uploadedUrl;
        setVariants(newVariants);
      }
      console.log("Image uploaded successfully, URL:", uploadedUrl);
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      alert("Failed to upload image: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        sku: "",
        price: 0,
        originalPrice: 0,
        stockQuantity: 0,
        weight: 0,
        dimensions: "",
        imageUrl: "",
      }
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (productImages.length === 0) {
      alert("Please upload at least one product image.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: productName,
        slug: slug,
        registrationNumber: registrationNumber,
        categoryId: selectedCategory, // Value is now the ID directly
        brandId: selectedBrand,       // Value is now the ID directly
        shortDescription: shortDescription,
        fullDescription: fullDescription,
        // Use the first image as thumbnail, or empty string if no images
        thumbnailUrl: productImages.length > 0 ? productImages[0] : "",
        // If backend supports multiple images, we should add a field for it here, e.g.:
        // images: productImages, 
        ingredients: ingredients,
        usageInstructions: usageInstructions,
        contraindications: contraindications,
        productVariants: variants.map(v => ({
          sku: v.sku,
          price: parseFloat(v.price),
          originalPrice: parseFloat(v.originalPrice),
          stockQuantity: parseInt(v.stockQuantity),
          weight: parseFloat(v.weight),
          dimensions: v.dimensions,
          imageUrl: v.imageUrl
        }))
      };

      await productApi.createProduct(payload);
      console.log("Product created successfully");
      navigate(route.productlist);
    } catch (error) {
      console.error("Create product error:", error);
      alert(error.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Create Product</h4>
              <h6>Create new product</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <div className="page-btn">
                <Link to={route.productlist} className="btn btn-secondary">
                  <i className="feather icon-arrow-left me-2" />
                  Back to Product
                </Link>
              </div>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="add-product-form">
          {/* General Information */}
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">General Information</h4>
              <div className="row">
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="mb-3">
                    <label className="form-label">Product Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      onBlur={handleGenerateSlug}
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="mb-3">
                    <label className="form-label">Slug <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <CommonSelect
                      className="w-100"
                      options={categories}
                      value={selectedCategory}
                      onChange={(e) => {
                        console.log("Category selected:", e.value);
                        setSelectedCategory(e.value);
                      }}
                      placeholder="Choose Category"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="mb-3">
                    <label className="form-label">Brand</label>
                    <CommonSelect
                      className="w-100"
                      options={brands}
                      value={selectedBrand}
                      onChange={(e) => {
                        console.log("Brand selected:", e.value);
                        setSelectedBrand(e.value);
                      }}
                      placeholder="Choose Brand"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="mb-3">
                    <label className="form-label">Registration Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="mb-3">
                    <label className="form-label">Short Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="mb-3">
                    <label className="form-label">Full Description</label>
                    <Editor
                      value={fullDescription}
                      onTextChange={(e) => setFullDescription(e.htmlValue)}
                      style={{ height: "200px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Details */}
          <div className="card mt-4">
            <div className="card-body">
              <h4 className="card-title">Medical Details</h4>
              <div className="row">
                <div className="col-lg-12">
                  <div className="mb-3">
                    <label className="form-label">Ingredients</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="mb-3">
                    <label className="form-label">Usage Instructions</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={usageInstructions}
                      onChange={(e) => setUsageInstructions(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="mb-3">
                    <label className="form-label">Contraindications</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={contraindications}
                      onChange={(e) => setContraindications(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Image */}
          <div className="accordion-item border mb-4">
            <h2 className="accordion-header" id="headingSpacingThree">
              <div
                className="accordion-button collapsed bg-white"
                data-bs-toggle="collapse"
                data-bs-target="#SpacingThree"
                aria-expanded="true"
                aria-controls="SpacingThree">

                <div className="d-flex align-items-center justify-content-between flex-fill">
                  <h5 className="d-flex align-items-center">
                    <i className="feather icon-image text-primary me-2" />
                    <span>Images</span>
                  </h5>
                </div>
              </div>
            </h2>
            <div
              id="SpacingThree"
              className="accordion-collapse collapse show"
              aria-labelledby="headingSpacingThree">

              <div className="accordion-body border-top">
                <div className="text-editor add-list add">
                  <div className="col-lg-12">
                    <div className="add-choosen">
                      <div className="mb-3">
                        <div className="image-upload">
                          <input
                            type="file"
                            onChange={(e) => handleImageUpload(e.target.files[0], true)}
                            accept="image/*" />
                          <div className="image-uploads">
                            <i className="feather icon-plus-circle plus-down-add me-0" />
                            <h4>Add Images</h4>
                          </div>
                        </div>
                      </div>

                      {/* Render uploaded images */}
                      {productImages.map((imgUrl, index) => (
                        <div className="phone-img" key={index}>
                          <img src={imgUrl} alt={`product-${index}`} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                          <Link to="#" onClick={(e) => { e.preventDefault(); handleRemoveImage(index); }}>
                            <i className="feather icon-x x-square-add remove-product" />
                          </Link>
                        </div>
                      ))}

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Variants */}
          <div className="card mt-4">
            <div className="card-body">
              <h4 className="card-title">Pricing & Variants</h4>

              <div className="mb-3">
                <label className="form-label d-block">Product Type</label>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="productType"
                    id="single"
                    value="single"
                    checked={productType === "single"}
                    onChange={() => setProductType("single")}
                  />
                  <label className="form-check-label" htmlFor="single">Single Product</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="productType"
                    id="variable"
                    value="variable"
                    checked={productType === "variable"}
                    onChange={() => setProductType("variable")}
                  />
                  <label className="form-check-label" htmlFor="variable">Variable Product</label>
                </div>
              </div>

              {variants.map((variant, index) => (
                <div key={index} className="border p-3 mb-3 rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Variant {index + 1}</h5>
                    {variants.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeVariant(index)}>
                        <i className="feather icon-trash-2" />
                      </button>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="mb-3">
                        <label className="form-label">SKU <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="mb-3">
                        <label className="form-label">Price <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          className="form-control"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="mb-3">
                        <label className="form-label">Original Price</label>
                        <input
                          type="number"
                          className="form-control"
                          value={variant.originalPrice}
                          onChange={(e) => handleVariantChange(index, 'originalPrice', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="mb-3">
                        <label className="form-label">Stock Quantity <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          className="form-control"
                          value={variant.stockQuantity}
                          onChange={(e) => handleVariantChange(index, 'stockQuantity', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="mb-3">
                        <label className="form-label">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={variant.weight}
                          onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="mb-3">
                        <label className="form-label">Dimensions</label>
                        <input
                          type="text"
                          className="form-control"
                          value={variant.dimensions}
                          onChange={(e) => handleVariantChange(index, 'dimensions', e.target.value)}
                          placeholder="LxWxH"
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="mb-3">
                        <label className="form-label">Variant Image</label>
                        <div className="image-upload">
                          <input
                            type="file"
                            onChange={(e) => handleImageUpload(e.target.files[0], false, index)}
                            accept="image/*"
                          />
                          <div className="image-uploads">
                            <i className="feather icon-plus-circle plus-down-add me-0" />
                            <h4>Add Variant Image</h4>
                          </div>
                        </div>
                        {variant.imageUrl && (
                          <div className="phone-img mt-3">
                            <img src={variant.imageUrl} alt="Variant" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {productType === "variable" && (
                <button type="button" className="btn btn-primary btn-sm" onClick={addVariant}>
                  <i className="feather icon-plus me-2" /> Add Variant
                </button>
              )}
            </div>
          </div>

          <div className="col-lg-12 mt-4">
            <div className="d-flex align-items-center justify-content-end mb-4">
              <button type="button" className="btn btn-secondary me-2" onClick={() => navigate(route.productlist)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading || isUploading}>
                {isLoading ? "Saving..." : "Add Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;