import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../Product/services/api';
import ImageLightbox from '../../components/image-lightbox';
import styles from './ProductDetail.module.css';
// Component: product-detail: Chi tiết sản phẩm với gallery ảnh, mô tả có phân đoạn và điều hướng.
// Làm sạch và chuẩn hóa HTML của mục "Mô tả sản phẩm"
const sanitizeHtml = (value) => {
  if (!value && value !== 0) return '';
  try {
    let html = String(value);
    html = html
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '')
      .replace(/\\t/g, '  ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
    return html.trim();
  } catch (e) {
    return String(value);
  }
};

// Làm sạch và chuẩn hóa HTML của mục "Mô tả ngắn"
const sanitizeShortDesc = (value) => {
  if (!value && value !== 0) return '';
  try {
    let text = String(value);
    // Xử lý các ký tự đặc biệt
    text = text
      .replace(/\\r\\n/g, '<br />')   // \r\n -> <br />
      .replace(/\\n/g, '<br />')       // \n -> <br />
      .replace(/\\r/g, '')             // Xóa \r
      .replace(/\\t/g, '  ')           // \t -> spaces
      .replace(/&nbsp;/g, ' ')         // Convert &nbsp; to space
      .replace(/\s+/g, ' ')            // Multiple spaces -> single space
      .trim();
    // Convert newlines to <br /> for HTML rendering
    text = text.split('\n').map(line => line.trim()).filter(Boolean).join('<br /><br />');
    
    return text;
  } catch (e) {
    return String(value);
  }
};

// Trích xuất nội dung bên trong cặp dấu ngoặc đơn
const extractParenthesis = (value) => {
  if (!value) return '';
  const m = String(value).match(/\(([^)]*)\)/);
  return m ? m[1].trim() : '';
};

// Component để render HTML an toàn
const HtmlContent = ({ html, className = '' }) => {
  if (!html || html === '-') {
    return <span className="text-muted">Chưa có thông tin</span>;
  }
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

const ProductDetail = () => {
  const { id: idParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(location.search || '');
  const id = idParam || qs.get('id');

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightbox, setLightbox] = useState({ open: false, index: 0, images: [] });
  const [activeSection, setActiveSection] = useState('mo-ta');

  // Refs cho sections
  const sectionRefs = useRef({});
  const contentContainerRef = useRef(null);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/Product');
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const p = await fetchProductById(id);
        if (!mounted) return;
        setProduct(p || {});
        const imgs = [];
        const imgField = p && (p['Hình ảnh'] || p['Image'] || p['images'] || p['Images'] || '');
        if (imgField) imgs.push(...String(imgField).split(',').map(s => s.trim()).filter(Boolean));
        setLightbox((s) => ({ ...s, images: imgs }));
        setSelectedIndex(0);
      } catch (err) {
        console.error('Product detail load error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  // Scroll to section when clicking menu
  const scrollToSection = useCallback((sectionId) => {
    const section = sectionRefs.current[sectionId];
    if (section && contentContainerRef.current) {
      const container = contentContainerRef.current;
      const offsetTop = section.offsetTop - container.offsetTop - 20;
      container.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  }, []);

  // Intersection Observer for scroll spy
  useEffect(() => {
    if (!contentContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: contentContainerRef.current,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [loading]);

  if (!id) return (
    <div className="page-wrapper">
      <div className="content">
        <div className="alert alert-warning">No product id provided.</div>
      </div>
    </div>
  );

  const onThumbClick = useCallback((idx) => setSelectedIndex(idx), []);
  const openLight = useCallback((index = 0) => setLightbox(s => ({ ...s, open: true, index })), []);

  const row = product || {};
  const name = row['Tên'] || row['Name'] || row.name || '';
  const brand = row['Thương hiệu'] || row['Brand'] || '';
  const category = row['Danh mục'] || row['Danh muc'] || row['Category'] || '';
  const unit = row['Giá trị thuộc tính 1'] || row['Tên thuộc tính 1'] || row['attribute 1'] || '';
  const shortDesc = row['Mô tả ngắn'] || row['Short description'] || row.short_description || '';
  const longDesc = row['Mô tả'] || row['Description'] || row.description || '';

  const spec = useMemo(() => extractParenthesis(name) || extractParenthesis(row['Quy cách'] || ''), [name, row]);

  // Parse description sections
  // Parse description sections
const descriptionSections = useMemo(() => {
  if (!longDesc) return [];
  
  const html = sanitizeHtml(longDesc);
  const sections = [];
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Chỉ lấy các heading cấp cao (h1, h2, h3, h4) - KHÔNG lấy strong
  // Để tránh parse quá chi tiết
  const mainHeadings = tempDiv.querySelectorAll('h1, h2, h3, h4');
  
  if (mainHeadings.length === 0) {
    // Nếu không có heading, return toàn bộ content
    return [{
      id: 'mo-ta',
      title: 'Mô tả sản phẩm',
      content: html
    }];
  }

  mainHeadings.forEach((heading, index) => {
    const title = heading.textContent.trim();
    
    // Bỏ qua heading rỗng
    if (!title) return;
    
    const id = `section-${index}`;
    
    // Lấy toàn bộ content từ heading này đến heading tiếp theo
    let content = '';
    let currentNode = heading.nextSibling;
    const nextHeading = mainHeadings[index + 1];
    
    // Collect all content between current heading and next heading
    while (currentNode) {
      // Nếu gặp heading tiếp theo thì dừng
      if (nextHeading && currentNode === nextHeading) {
        break;
      }
      
      // Nếu gặp main heading khác (không phải nextHeading) thì cũng dừng
      if (currentNode.nodeType === 1 && 
          ['H1', 'H2', 'H3', 'H4'].includes(currentNode.tagName)) {
        break;
      }
      
      if (currentNode.nodeType === 1) { // Element node
        content += currentNode.outerHTML;
      } else if (currentNode.nodeType === 3) { // Text node
        const text = currentNode.textContent.trim();
        if (text) content += `<p>${text}</p>`;
      }
      
      currentNode = currentNode.nextSibling;
    }
    
    // Chỉ thêm section nếu có content
    if (content.trim()) {
      sections.push({ 
        id, 
        title, 
        content: content.trim() 
      });
    }
  });

  return sections.length > 0 ? sections : [{
    id: 'mo-ta',
    title: 'Mô tả sản phẩm',
    content: html
  }];
}, [longDesc]);

  const images = (lightbox.images || []);
  const mainImage = images[selectedIndex] || images[0] || row['Hình đại diện'] || row['productImage'] || '';

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="page-title">
            <h4>CHI TIẾT SẢN PHẨM</h4>
            <h6>Thông tin sản phẩm</h6>
          </div>
          <div className="ms-auto">
            <button type="button" className="btn btn-outline-secondary" onClick={handleBack}>
              <i className="ti ti-arrow-left me-1" /> Quay lại
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <div className="card-body">
              <div className={styles.loadingContainer}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Product Overview Card */}
            <div className="card mb-3">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-5">
                    <div className={styles.productGallery}>
                      <div className={styles.mainImage}>
                        {mainImage ? (
                          <img 
                            src={mainImage} 
                            alt={name} 
                            loading="lazy" 
                            onClick={() => openLight(selectedIndex)} 
                          />
                        ) : (
                          <div className={styles.placeholder}>
                            <span className="text-muted">Không có hình ảnh</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.thumbnails}>
                        {images.length ? images.map((img, idx) => (
                          <button 
                            key={idx} 
                            type="button" 
                            className={`${styles.thumb} ${idx === selectedIndex ? styles.active : ''}`}
                            onClick={() => onThumbClick(idx)}
                          >
                            <img 
                              src={img} 
                              alt={`thumb-${idx}`} 
                              loading="lazy"
                            />
                          </button>
                        )) : null}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-7">
                    <div className={styles.productInfo}>
                      <h2>{name}</h2>
                      
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="text-muted">
                          ID: <strong>{row.ID || row.id || '-'}</strong>
                        </div>
                        {brand && (
                          <>
                            <span className="text-muted">•</span>
                            <div className="text-muted">
                              Thương hiệu: <strong>{brand}</strong>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {category && (
                        <div className="mb-3">
                          <span className="text-muted">Danh mục: </span>
                          <strong>{category}</strong>
                        </div>
                      )}

                      {unit && (
                        <div className="mb-3">
                          <div className="mb-2 text-muted">Phân loại sản phẩm</div>
                          <div className="btn-group">
                            <button className="btn btn-outline-primary">{unit}</button>
                          </div>
                        </div>
                      )}

                      {shortDesc && (
                        <>
                          <hr />
                          <div className="mb-3">
                            <h6 className="text-muted mb-2">Mô tả ngắn</h6>
                            <HtmlContent 
                              html={sanitizeShortDesc(shortDesc)}
                              className={styles.shortDescContent}
                            />
                          </div>
                        </>
                      )}

                      {spec && (
                        <div className="mb-3">
                          <h6 className="text-muted mb-2">Quy cách</h6>
                          <div>{spec}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description with Side Navigation */}
            {descriptionSections.length > 0 && (
              <div className="card">
                <div className="card-body p-0">
                  <div className="row g-0">
                    {/* Left Navigation */}
                    <div className="col-md-3 border-end">
                      <div className={styles.descriptionNav}>
                        <h6>Mô tả sản phẩm</h6>
                        <ul className="nav flex-column">
                          {descriptionSections.map((section) => (
                            <li key={section.id} className={styles.navItem}>
                              <button
                                className={`${styles.navLink} ${
                                  activeSection === section.id ? styles.active : ''
                                }`}
                                onClick={() => scrollToSection(section.id)}
                              >
                                {section.title}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right Content */}
                    <div className="col-md-9">
                      <div 
                        ref={contentContainerRef}
                        className={styles.descriptionContent}
                      >
                        {descriptionSections.map((section) => (
                          <div
                            key={section.id}
                            id={section.id}
                            ref={(el) => (sectionRefs.current[section.id] = el)}
                            className={styles.contentSection}
                          >
                            <h5>{section.title}</h5>
                            <HtmlContent 
                              html={section.content}
                              className={styles.sectionContent}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <ImageLightbox
        open={lightbox.open}
        images={lightbox.images}
        index={lightbox.index}
        onClose={() => setLightbox(s => ({ ...s, open: false }))}
        onPrev={() => setLightbox(s => ({ ...s, index: Math.max(0, s.index - 1) }))}
        onNext={() => setLightbox(s => ({ ...s, index: Math.min((s.images||[]).length - 1, s.index + 1) }))}
      />
    </div>
  );
};

export default ProductDetail;