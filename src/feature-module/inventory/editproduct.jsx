import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { all_routes } from "../../routes/all_routes";
import { Editor } from "primereact/editor";
import { Chip } from "primereact/chip";
import { productApi, categoryApi, brandApi, fileUploadApi, productOptionApi } from "../../services/api.service";
import CommonSelect from "../../components/select/common-select";

const EditProduct = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const { id } = useParams();

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

      console.log("Raw categories data:", categoriesData);
      console.log("Raw brands data:", brandsData);

      // Parse categories - handle both array and pagination wrapper
      let categoryList = [];
      if (Array.isArray(categoriesData)) {
        categoryList = categoriesData;
      } else if (categoriesData?.data?.data) {
        // Has pagination wrapper: { data: { data: [...], pagination: {...} } }
        categoryList = categoriesData.data.data;
      } else if (categoriesData?.data) {
        // Simple wrapper: { data: [...] }
        categoryList = Array.isArray(categoriesData.data) ? categoriesData.data : [];
      }
      const categoryOptions = categoryList.map(c => ({ label: c.name, value: c.id }));
      console.log("Category options:", categoryOptions);
      setCategories(categoryOptions);

      // Parse brands - handle both array and pagination wrapper
      let brandList = [];
      if (Array.isArray(brandsData)) {
        brandList = brandsData;
      } else if (brandsData?.data?.data) {
        // Has pagination wrapper
        brandList = brandsData.data.data;
      } else if (brandsData?.data) {
        // Simple wrapper
        brandList = Array.isArray(brandsData.data) ? brandsData.data : [];
      }
      const brandOptions = brandList.map(b => ({ label: b.name, value: b.id }));
      console.log("Brand options:", brandOptions);
      setBrands(brandOptions);

      // Parse product options
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

  const fetchProductData = async (productId) => {
    setIsLoading(true);
    try {
      const productData = await productApi.getProductById(productId);
      console.log("Product data:", productData);

      // Populate form fields
      const product = productData.data || productData;
      setProductName(product.name || "");
      setSlug(product.slug || "");
      setRegistrationNumber(product.registrationNumber || "");
      setShortDescription(product.shortDescription || "");
      setFullDescription(product.fullDescription || "");
      setIngredients(product.ingredients || "");
      setUsageInstructions(product.usageInstructions || "");
      setContraindications(product.contraindications || "");

      // Set category and brand (will be matched after options are loaded)
      if (product.categoryId) {
        setSelectedCategory(product.categoryId);
      }
      if (product.brandId) {
        setSelectedBrand(product.brandId);
      }

      // Set product images
      if (product.thumbnailUrl) {
        setProductImages([product.thumbnailUrl]);
      }

      // Set variants
      if (product.productVariants && product.productVariants.length > 0) {
        setVariants(product.productVariants.map(v => ({
          id: v.id,
          sku: v.sku || "",
          price: v.price || 0,
          originalPrice: v.originalPrice || 0,
          stockQuantity: v.stockQuantity || 0,
          weight: v.weight || 0,
          dimensions: v.dimensions || "",
          imageUrl: v.imageUrl || "",
          variantOptionValueIds: v.optionValues?.map(ov => ov.optionValueId) || [],
        })));
        if (product.productVariants.length > 1) {
          setProductType("variable");
        }
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      alert("Failed to load product data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchInitialData();
      if (id) {
        await fetchProductData(id);
      }
    };
    loadData();
  }, [id]);

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

  const getOptionIdFromValueId = (optionValueId) => {
    for (const option of productOptions) {
      if (option.productOptionValues?.some(v => v.id === optionValueId)) {
        return option.id;
      }
    }
    return null;
  };

  const setVariantOption = (variantIndex, optionValueId) => {
    const newVariants = [...variants];
    const variant = newVariants[variantIndex];

    const optionId = getOptionIdFromValueId(optionValueId);
    if (!optionId) return;

    const option = productOptions.find(o => o.id === optionId);
    if (!option) return;

    const optionValueIds = option.productOptionValues?.map(v => v.id) || [];

    variant.variantOptionValueIds = variant.variantOptionValueIds.filter(
      id => !optionValueIds.includes(id)
    );

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

  const getAvailableOptionsByAttribute = (variantIndex) => {
    const variant = variants[variantIndex];
    const groupedOptions = [];

    productOptions.forEach(option => {
      const hasSelectedValue = option.productOptionValues?.some(v =>
        variant.variantOptionValueIds.includes(v.id)
      );

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

  const setupImageHandler = () => {
    if (editorRef.current) {
      const quill = editorRef.current.getQuill();
      if (quill) {
        const toolbar = quill.getModule('toolbar');
        if (toolbar) {
          toolbar.addHandler('image', function () {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
              const file = input.files[0];
              if (file) {
                setIsUploading(true);
                try {
                  const response = await fileUploadApi.uploadFile(file, 1);
                  const url = response.data?.fileUrl || response.fileUrl;

                  if (!url) {
                    throw new Error("No file URL in response");
                  }

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
        }
      }
    }
  };

  useEffect(() => {
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
          id: v.id || null,
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

      await productApi.updateProduct(id, payload);
      console.log("Product updated successfully");
      navigate(route.productlist);
    } catch (error) {
      console.error("Update product error:", error);
      alert(error.message || "Failed to update product");
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
              <h4>Edit Product</h4>
              <h6>Update product information</h6>
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
                {isLoading ? "Updating..." : "Update Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
