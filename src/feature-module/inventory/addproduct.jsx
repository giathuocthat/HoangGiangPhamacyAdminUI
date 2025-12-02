import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../routes/all_routes";
import { Editor } from "primereact/editor";
import { Chip } from "primereact/chip";
import { productApi, categoryApi, brandApi, fileUploadApi, productOptionApi } from "../../services/api.service";
import CommonSelect from "../../components/select/common-select";

const AddProduct = () => {
  const route = all_routes;
  const navigate = useNavigate();

  // State for dropdowns
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  // Form State
  const [productName, setProductName] = useState("");
  const [slug, setSlug] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
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
      variantOptionValueIds: [],
    }
  ]);

  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Editor ref
  const editorRef = useRef(null);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [categoriesData, brandsData, optionsData] = await Promise.all([
        categoryApi.getAllCategories(),
        brandApi.getBrands(1, 100),
        productOptionApi.getAllOptions()
      ]);

      console.log("Categories data:", categoriesData);
      console.log("Brands data:", brandsData);
      console.log("Product options data:", optionsData);

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

      // Process product options
      if (Array.isArray(optionsData)) {
        setProductOptions(optionsData);
      } else if (optionsData?.data) {
        setProductOptions(optionsData.data);
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
      .replace(/đ/g, 'd')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/-+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generatedSlug);
  };

  const handleImageUpload = async (file, isProductImage = true, variantIndex = null) => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    setIsUploading(true);
    try {
      const response = await fileUploadApi.uploadFile(file, 1);
      const uploadedUrl = response.data?.fileUrl || response.fileUrl;

      if (!uploadedUrl) {
        throw new Error("No file URL in response");
      }

      if (isProductImage) {
        setProductImages(prev => [...prev, uploadedUrl]);
      } else if (variantIndex !== null) {
        const newVariants = [...variants];
        newVariants[variantIndex].imageUrl = uploadedUrl;
        setVariants(newVariants);
      }
    } catch (error) {
      console.error("Upload error:", error);
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

  // Get option ID from option value ID
  const getOptionIdFromValueId = (optionValueId) => {
    for (const option of productOptions) {
      if (option.productOptionValues?.some(v => v.id === optionValueId)) {
        return option.id;
      }
    }
    return null;
  };

  // Add or replace variant option (only one value per attribute)
  const setVariantOption = (variantIndex, optionValueId) => {
    const newVariants = [...variants];
    const variant = newVariants[variantIndex];

    // Find which option this value belongs to
    const optionId = getOptionIdFromValueId(optionValueId);
    if (!optionId) return;

    // Find the option object
    const option = productOptions.find(o => o.id === optionId);
    if (!option) return;

    // Get all value IDs for this option
    const optionValueIds = option.productOptionValues?.map(v => v.id) || [];

    // Remove any existing value from this option
    variant.variantOptionValueIds = variant.variantOptionValueIds.filter(
      id => !optionValueIds.includes(id)
    );

    // Add the new value
    variant.variantOptionValueIds.push(optionValueId);
    setVariants(newVariants);
  };

  const removeVariantOption = (variantIndex, optionValueId) => {
    const newVariants = [...variants];
    const variant = newVariants[variantIndex];
    variant.variantOptionValueIds = variant.variantOptionValueIds.filter(
      id => id !== optionValueId
    );
    setVariants(newVariants);
  };

  const getOptionValueInfo = (optionValueId) => {
    for (const option of productOptions) {
      const value = option.productOptionValues?.find(v => v.id === optionValueId);
      if (value) {
        return {
          optionName: option.name,
          valueName: value.value,
          label: `${option.name}: ${value.value}`
        };
      }
    }
    return null;
  };

  // Get options grouped by attribute for dropdown
  const getAvailableOptionsByAttribute = (variantIndex) => {
    const variant = variants[variantIndex];
    const groupedOptions = [];

    productOptions.forEach(option => {
      // Check if this option already has a value selected
      const hasSelectedValue = option.productOptionValues?.some(v =>
        variant.variantOptionValueIds.includes(v.id)
      );

      // If no value selected for this option, show all values
      if (!hasSelectedValue && option.productOptionValues) {
        option.productOptionValues.forEach(value => {
          groupedOptions.push({
            label: `${option.name}: ${value.value}`,
            value: value.id
          });
        });
      }
    });

    return groupedOptions;
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
        variantOptionValueIds: [],
      }
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
    }
  };

  // Convert base64 image to file
  const base64ToFile = (base64String, filename) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Upload base64 image and replace with URL
  const uploadBase64Image = async (base64String) => {
    try {
      const file = base64ToFile(base64String, `image-${Date.now()}.png`);
      const response = await fileUploadApi.uploadFile(file, 1);
      const url = response.data?.fileUrl || response.fileUrl;
      return url;
    } catch (error) {
      console.error('Upload base64 error:', error);
      return null;
    }
  };

  // Setup custom image handler when editor is ready
  const setupImageHandler = () => {
    console.log('Setting up editor handlers...');

    if (editorRef.current) {
      const quill = editorRef.current.getQuill();
      console.log('Quill instance:', quill);

      if (quill) {
        // Override toolbar image button handler
        const toolbar = quill.getModule('toolbar');
        console.log('Toolbar module:', toolbar);

        if (toolbar) {
          console.log('Adding custom image handler...');
          toolbar.addHandler('image', function () {
            console.log('Image handler triggered!');
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
              const file = input.files[0];
              console.log('File selected:', file);
              if (file) {
                setIsUploading(true);
                try {
                  console.log('Uploading file...');
                  const response = await fileUploadApi.uploadFile(file, 1);
                  console.log('Upload response:', response);
                  const url = response.data?.fileUrl || response.fileUrl;

                  if (!url) {
                    throw new Error("No file URL in response");
                  }

                  console.log('Inserting image URL:', url);
                  const range = quill.getSelection(true);
                  quill.insertEmbed(range.index, 'image', url);
                  quill.setSelection(range.index + 1);
                } catch (error) {
                  console.error('Upload error:', error);
                  alert('Failed to upload image: ' + error.message);
                } finally {
                  setIsUploading(false);
                }
              }
            };
          });
          console.log('Image handler added successfully');
        } else {
          console.error('Toolbar module not found!');
        }
      } else {
        console.error('Quill instance not found!');
      }
    } else {
      console.error('editorRef.current is null!');
    }
  };

  useEffect(() => {
    // Delay to ensure Editor is fully mounted
    const timer = setTimeout(() => {
      setupImageHandler();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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
        categoryId: selectedCategory,
        brandId: selectedBrand,
        shortDescription: shortDescription,
        fullDescription: fullDescription,
        thumbnailUrl: productImages.length > 0 ? productImages[0] : "",
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
          imageUrl: v.imageUrl,
          variantOptionValueIds: v.variantOptionValueIds || []
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
                      onChange={(e) => setSelectedCategory(e.value)}
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
                      onChange={(e) => setSelectedBrand(e.value)}
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
                      ref={editorRef}
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
                    onChange={() => {
                      setProductType("single");
                      setVariants([variants[0]]);
                    }}
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

                    {/* Variant Options - Chip Based UI */}
                    {productOptions.length > 0 && (
                      <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Variant Options</label>

                          {/* Selected Options as PrimeReact Chips */}
                          <div className="mb-2">
                            {variant.variantOptionValueIds.length > 0 ? (
                              variant.variantOptionValueIds.map(optionValueId => {
                                const info = getOptionValueInfo(optionValueId);
                                return info ? (
                                  <Chip
                                    key={optionValueId}
                                    label={info.label}
                                    removable
                                    onRemove={() => removeVariantOption(index, optionValueId)}
                                    className="me-2 mb-2"
                                  />
                                ) : null;
                              })
                            ) : (
                              <span className="text-muted">No options selected</span>
                            )}
                          </div>

                          {/* Dropdown to Add/Change Option - Only show options not yet selected */}
                          {getAvailableOptionsByAttribute(index).length > 0 && (
                            <div className="d-flex align-items-center">
                              <CommonSelect
                                className="flex-grow-1"
                                options={getAvailableOptionsByAttribute(index)}
                                value={null}
                                onChange={(e) => {
                                  if (e.value) {
                                    setVariantOption(index, e.value);
                                  }
                                }}
                                placeholder="Add option..."
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

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

// import { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { all_routes } from "../../routes/all_routes";
// import { toast } from "react-toastify";
// import { Editor } from "primereact/editor";
// import CommonSelect from "../../components/select/common-select";
// import {
//   productApi,
//   brandApi,
//   categoryApi,
//   fileUploadApi,
// } from "../../services/api.service"; 

// // --- URL PLACEHOLDER AN TOÀN ---
// const PLACEHOLDER_IMAGE_URL = "https://via.placeholder.com/150/E5E5E5/000000?text=No+Image";

// // --- HÀM HELPER: TẠO SLUG ---
// const toSlug = (str) => {
//     if (!str) return "";
//     return String(str)
//       .toLowerCase()
//       .replace(/đ/g, 'd')
//       .normalize("NFD")
//       .replace(/[\u0300-\u036f]/g, "")
//       .replace(/[^a-z0-9\s-]/g, "")
//       .replace(/-+/g, "-")
//       .replace(/\s+/g, "-")
//       .trim();
// };

// // --- HÀM HELPER: LÀM PHẲNG DANH MỤC ---
// const flattenCategories = (nodes, prefix = '') => {
//     let result = [];
//     nodes.forEach(node => {
//         const name = prefix ? `${prefix} > ${node.name || node.categoryName}` : (node.name || node.categoryName);
//         result.push({ value: node.id, label: name });
//         if (node.children?.length > 0) {
//             result = result.concat(flattenCategories(node.children, name));
//         }
//     });
//     return result;
// };


// const AddProduct = () => {
//   const navigate = useNavigate();
//   const route = all_routes;
//   const fileInputRef = useRef(null);

//   // --- STATE QUẢN LÝ DỮ LIỆU ---
//   const [formData, setFormData] = useState({
//     name: "",
//     slug: "",
//     shortDescription: "",
//     fullDescription: "",
//     categoryId: null,
//     brandId: null,
//     thumbnailUrl: "", 
//     ingredients: "",
//     usageInstructions: "",
//     contraindications: "",
//     storageInstructions: "",
//     registrationNumber: "",
//     isPrescriptionDrug: false,
//     isActive: true,
//     isFeatured: false,
//     sku: "",
//     price: "",
//     stockQuantity: "",
//   });

//   const [brandsList, setBrandsList] = useState([]);
//   const [categoriesList, setCategoriesList] = useState([]);
  
//   const [loading, setLoading] = useState(false);
//   const [uploadingImage, setUploadingImage] = useState(false);

//   // FIX HIỂN THỊ DROPDOWN
//   const getSelectedOption = (list, val) => {
//     if (val === null || val === undefined) return null;
//     return list.find(i => String(i.value) === String(val)) || null;
//   };


//   // --- 1. LOAD DỮ LIỆU DROPDOWN (Tải song song) ---
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const [brandRes, categoryRes] = await Promise.all([
//             brandApi.getBrands(1, 100).catch(() => ({ data: [] })), 
//             categoryApi.getCategories().catch(() => ({ data: [] }))
//         ]);

//         // Xử lý Brands
//         let brandsData = Array.isArray(brandRes) ? brandRes : (brandRes.data || []);
//         setBrandsList(brandsData.map(b => ({ value: b.id, label: b.name })));

//         // Xử lý Categories
//         let rawCategories = Array.isArray(categoryRes) ? categoryRes : (categoryRes.data || []);
//         const hasChildren = rawCategories.some(c => c.children?.length > 0);
//         const formattedCategories = hasChildren 
//             ? flattenCategories(rawCategories) 
//             : rawCategories.map(c => ({ value: c.id, label: c.name || c.categoryName }));
        
//         setCategoriesList(formattedCategories);

//       } catch (error) {
//         console.error("Error loading data:", error);
//         toast.error("Lỗi khi tải danh sách Brand/Category.");
//       } finally {
//         setLoading(false); 
//       }
//     };
//     fetchData();
//   }, []);


//   // --- 2. XỬ LÝ FORM INPUT ---
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
    
//     setFormData(prev => {
//         const newData = { ...prev, [name]: value };
        
//         if (name === "name") {
//             newData.slug = toSlug(value);
//         }
        
//         return newData;
//     });
//   };

//   const handleCheckboxChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  
//   const handleSelectChange = (fieldName, option) => {
//     setFormData(prev => ({ ...prev, [fieldName]: option ? option.value : null }));
//   };

//   const handleDescriptionChange = (html) => setFormData(prev => ({ ...prev, fullDescription: html }));

//   // --- 3. XỬ LÝ UPLOAD ẢNH (Dùng URL thật nếu có) ---
//   const handleImageUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setUploadingImage(true);
//     const formDataUpload = new FormData();
//     formDataUpload.append("File", file); 

//     try {
//       const response = await fileUploadApi.uploadSingle(formDataUpload);
//       const imageUrl = response.filePath || response.url || response; 

//       if (imageUrl && typeof imageUrl === 'string') {
//         setFormData(prev => ({ ...prev, thumbnailUrl: imageUrl }));
//         toast.success("Upload ảnh thành công!");
//       } else {
//         toast.error("Upload thất bại: Không nhận được URL ảnh.");
//       }
//     } catch (error) {
//       console.error("Upload failed:", error);
//       const errorMessage = error.message || "Lỗi không xác định";
//       toast.error("Upload thất bại: " + errorMessage);
//     } finally {
//       setUploadingImage(false);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   const handleRemoveImage = () => setFormData(prev => ({ ...prev, thumbnailUrl: "" }));


//   // --- HÀM CHUNG GỌI API CREATE PRODUCT ---
//   const callCreateProductApi = async (payload) => {
//       setLoading(true);
      
//       console.log("Payload sent to createProduct API:", payload);

//       try {
//         await productApi.createProduct(payload);
//         toast.success("Thêm sản phẩm thành công!");
//         // Sau khi thêm thành công, chuyển hướng về productlist
//         navigate(route.productlist); 
//       } catch (error) {
//         console.error("Create failed:", error);
//         const errorMessage = error.message || "Lỗi không xác định";
//         toast.error("Thêm sản phẩm thất bại: " + errorMessage);
//       } finally {
//         setLoading(false);
//       }
//   }

//   // --- 4. SUBMIT FORM (CREATE PRODUCT) DỮ LIỆU THỰC TỪ NGƯỜI DÙNG ---
//   const handleSubmit = async (e) => {
//     e.preventDefault(); 
    
//     // VALIDATION: Kiểm tra các trường bắt buộc
//     if (!formData.name || !formData.categoryId || !formData.brandId || !formData.sku || !formData.price) {
//       toast.warn("Vui lòng điền đầy đủ các trường bắt buộc (*): Tên, Category, Brand, SKU, Price.");
//       return;
//     }
    
//     // CHUẨN BỊ IMAGE URL AN TOÀN (Dùng ảnh upload hoặc placeholder)
//     const finalImageUrl = formData.thumbnailUrl || PLACEHOLDER_IMAGE_URL;

//     const payload = {
//       ...formData,
      
//       // FIX LỖI 400: Đảm bảo các trường string phức tạp luôn là chuỗi
//       shortDescription: String(formData.shortDescription || ""),
//       fullDescription: String(formData.fullDescription || ""),

//       // Đảm bảo kiểu dữ liệu là số
//       price: parseFloat(formData.price),
//       stockQuantity: parseInt(formData.stockQuantity) || 0,
      
//       // SỬ DỤNG URL AN TOÀN
//       thumbnailUrl: finalImageUrl,
      
//       // Cấu trúc ProductsImages (LUÔN GỬI 1 PHẦN TỬ ĐỂ TRÁNH LỖI 500 NULL REFERENCE)
//       images: [{
//           imageUrl: finalImageUrl,
//           altText: formData.name,
//           displayOrder: 1
//       }],
      
//       // Cấu trúc ProductVariants (LUÔN GỬI 1 PHẦN TỬ ĐỂ TRÁNH LỖI 500 NULL REFERENCE)
//       productVariants: [{
//           sku: formData.sku,
//           price: parseFloat(formData.price),
//           stockQuantity: parseInt(formData.stockQuantity) || 0,
//           originalPrice: parseFloat(formData.price), // Có thể là giá cũ nếu có, tạm bằng price
//           imageUrl: finalImageUrl, 
//           isActive: true
//       }]
//     };
    
//     await callCreateProductApi(payload);
//   };
  
//   // --- 5. SUBMIT SẢN PHẨM MẪU (DỮ LIỆU CỐ ĐỊNH AN TOÀN) ---
//   const handleSampleSubmit = async () => {
    
//     if (loading || uploadingImage) return; 
    
//     // Lấy ID đầu tiên có sẵn trong danh sách để đảm bảo tồn tại trong DB
//     const MOCK_CATEGORY_ID = categoriesList.length > 0 ? categoriesList[0].value : 1; 
//     const MOCK_BRAND_ID = brandsList.length > 0 ? brandsList[0].value : 1;    
//     const timestamp = Date.now();

//     // Check nếu không có ID nào hợp lệ
//     if (!MOCK_CATEGORY_ID || !MOCK_BRAND_ID) {
//         toast.error("Không tìm thấy Category hoặc Brand ID hợp lệ để tạo sản phẩm mẫu.");
//         return;
//     }
    
//     const payload = {
//         categoryId: MOCK_CATEGORY_ID, 
//         brandId: MOCK_BRAND_ID,       
        
//         name: `Sample Product ${timestamp}`,
//         slug: `sample-product-${timestamp}`, 
//         thumbnailUrl: PLACEHOLDER_IMAGE_URL,
        
//         shortDescription: "Mô tả ngắn của sản phẩm mẫu, dùng để test API.",
//         fullDescription: "<p>Mô tả chi tiết sản phẩm dùng để test API, kiểm tra dữ liệu đầy đủ.</p>",
//         ingredients: "Thành phần mẫu",
//         usageInstructions: "Hướng dẫn mẫu",
//         contraindications: "Chống chỉ định mẫu",
//         storageInstructions: "Bảo quản mẫu",
//         registrationNumber: "REG-TEST-999",
        
//         isPrescriptionDrug: true,
//         isActive: true,
//         isFeatured: true,
        
//         images: [{
//             imageUrl: PLACEHOLDER_IMAGE_URL,
//             altText: "Image Alt Text",
//             displayOrder: 1
//         }],
        
//         productVariants: [{
//             sku: `SKU-TEST-${timestamp}`,
//             barcode: `BAR-${timestamp}`,
//             price: 150000.00,
//             originalPrice: 150000.00,
//             stockQuantity: 100,
//             weight: 0.5,
//             dimensions: "10x10x10cm",
//             imageUrl: PLACEHOLDER_IMAGE_URL,
//             isActive: true
//         }]
//     };
    
//     await callCreateProductApi(payload);
//   };


//   // --- PHẦN RENDER (JSX) ---
//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Create Product</h4>
//             </div>
//           </div>
//           <ul className="table-top-head">
//             <li><Link to={route.productlist} className="btn btn-secondary"><i className="feather icon-arrow-left me-2" />Back</Link></li>
//           </ul>
//         </div>

//         <form onSubmit={handleSubmit} className="add-product-form">
//           <div className="card">
//             <div className="card-header"><h5 className="card-title">Product Information</h5></div>
//             <div className="card-body">
//                 <div className="row">
//                     <div className="col-sm-6 mb-3">
//                         <label className="form-label">Name <span className="text-danger">*</span></label>
//                         <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
//                     </div>
//                     <div className="col-sm-6 mb-3">
//                         <label className="form-label">Slug <span className="text-muted">(Auto-generated)</span></label>
//                         <input type="text" className="form-control bg-light" name="slug" value={formData.slug} readOnly />
//                     </div>
                    
//                     <div className="col-sm-6 mb-3">
//                         <label className="form-label">Category <span className="text-danger">*</span></label>
//                         <CommonSelect
//                             className="w-100"
//                             options={categoriesList}
//                             value={getSelectedOption(categoriesList, formData.categoryId)} 
//                             onChange={(opt) => handleSelectChange("categoryId", opt)}
//                             placeholder={loading ? "Loading..." : "Choose Category"}
//                             isDisabled={loading}
//                         />
//                     </div>
//                     <div className="col-sm-6 mb-3">
//                         <label className="form-label">Brand <span className="text-danger">*</span></label>
//                         <CommonSelect
//                             className="w-100"
//                             options={brandsList}
//                             value={getSelectedOption(brandsList, formData.brandId)} 
//                             onChange={(opt) => handleSelectChange("brandId", opt)}
//                             placeholder={loading ? "Loading..." : "Choose Brand"}
//                             isDisabled={loading}
//                         />
//                     </div>
                    
//                     <div className="col-12 mb-3">
//                         <label className="form-label">Short Description</label>
//                         <textarea className="form-control" rows={3} name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} />
//                     </div>
//                     <div className="col-12 mb-3">
//                         <label className="form-label">Full Description</label>
//                         <Editor value={formData.fullDescription} onTextChange={(e) => handleDescriptionChange(e.htmlValue)} style={{ height: "150px" }} />
//                     </div>
//                 </div>
//             </div>
//           </div>

//           <div className="card mt-3">
//              <div className="card-header"><h5 className="card-title">Pharma & Pricing</h5></div>
//              <div className="card-body">
//                 <div className="row">
//                     <div className="col-sm-6 mb-3">
//                         <label className="form-label">Registration Number</label>
//                         <input type="text" className="form-control" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} />
//                     </div>
//                     <div className="col-sm-6 mb-3 d-flex align-items-center pt-4">
//                         <div className="form-check form-switch">
//                             <input className="form-check-input" type="checkbox" role="switch" id="isPrescriptionDrug" name="isPrescriptionDrug" checked={formData.isPrescriptionDrug} onChange={handleCheckboxChange} />
//                             <label className="form-check-label ms-2" htmlFor="isPrescriptionDrug">Thuốc kê đơn?</label>
//                         </div>
//                     </div>
//                     <div className="col-sm-4 mb-3">
//                         <label className="form-label">SKU <span className="text-danger">*</span></label>
//                         <input type="text" className="form-control" name="sku" value={formData.sku} onChange={handleInputChange} required />
//                     </div>
//                     <div className="col-sm-4 mb-3">
//                         <label className="form-label">Price <span className="text-danger">*</span></label>
//                         <input type="number" className="form-control" name="price" value={formData.price} onChange={handleInputChange} required min="0" />
//                     </div>
//                     <div className="col-sm-4 mb-3">
//                         <label className="form-label">Stock Quantity</label>
//                         <input type="number" className="form-control" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} min="0" />
//                     </div>
//                 </div>
//              </div>
//           </div>

//           <div className="card mt-3">
//             <div className="card-header"><h5 className="card-title">Images (Optional for Testing)</h5></div>
//             <div className="card-body">
//                 <div className="image-upload-container text-center border p-4 rounded bg-light">
//                     <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="d-none" id="img-upload" />
//                     {!formData.thumbnailUrl ? (
//                         <label htmlFor="img-upload" className="cursor-pointer">
//                             {uploadingImage ? <div className="spinner-border text-primary"></div> : 
//                             <div className="d-flex flex-col align-items-center justify-content-center">
//                                 <i className="feather icon-image fs-1 mb-2 text-primary" />
//                                 <h5 className="text-primary">Click to upload image</h5>
//                                 <small className="text-muted">(Nếu bỏ qua, sẽ dùng ảnh placeholder)</small>
//                             </div>}
//                         </label>
//                     ) : (
//                         <div className="position-relative d-inline-block">
//                             <img src={formData.thumbnailUrl} alt="Thumbnail" style={{ maxHeight: '200px', maxWidth: '100%' }} className="img-thumbnail" />
//                             <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle" onClick={handleRemoveImage} style={{ transform: 'translate(50%, -50%)' }}><i className="feather icon-x" /></button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//           </div>

//           <div className="col-lg-12 mt-4 mb-4">
//               <div className="d-flex align-items-center justify-content-end">
//                 <button type="button" className="btn btn-secondary me-2" onClick={() => navigate(route.productlist)} disabled={loading || uploadingImage}>Cancel</button>
                
//                 {/* NÚT THÊM SẢN PHẨM MẪU */}
//                 <button 
//                   type="button" 
//                   className="btn btn-info me-2 text-white" 
//                   onClick={handleSampleSubmit} 
//                   disabled={loading || uploadingImage}
//                 >
//                   {loading && <span className="spinner-border spinner-border-sm me-2"/>} Add Sample Product
//                 </button>
                
//                 {/* NÚT SUBMIT FORM DỮ LIỆU THỰC */}
//                 <button type="submit" className="btn btn-primary" disabled={loading || uploadingImage}>
//                   {loading && <span className="spinner-border spinner-border-sm me-2"/>} Add Product
//                 </button>
//               </div>
//             </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddProduct;