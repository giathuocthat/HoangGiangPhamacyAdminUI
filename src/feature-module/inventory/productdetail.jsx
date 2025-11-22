import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { fetchProductById } from '../products/services/api';
import ImageLightbox from '../../components/image-lightbox';

const stripHtml = (value) => {
  if (!value && value !== 0) return '';
  try {
    const s = String(value);
    const noHtml = s.replace(/<[^>]*>/g, '');
    return noHtml.replace(/\r|\n|\t/g, ' ').replace(/\s+/g, ' ').trim();
  } catch (e) {
    return String(value);
  }
};

const extractParenthesis = (value) => {
  if (!value) return '';
  const m = String(value).match(/\(([^)]*)\)/);
  return m ? m[1].trim() : '';
};

const ProductDetail = () => {
  const { id: idParam } = useParams();
  const location = useLocation();
  const qs = new URLSearchParams(location.search || '');
  const id = idParam || qs.get('id');

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightbox, setLightbox] = useState({ open: false, index: 0, images: [] });

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
        // console.error('Product detail load error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  if (!id) return (
    <div className="page-wrapper"><div className="content"><div className="alert alert-warning">No product id provided.</div></div></div>
  );

  const onThumbClick = (idx) => setSelectedIndex(idx);
  const openLight = (index = 0) => setLightbox(s => ({ ...s, open: true, index }));

  const row = product || {};
  const name = row['Tên'] || row['Name'] || row.name || '';
  const brand = row['Thương hiệu'] || row['Brand'] || '';
  const category = row['Danh mục'] || row['Danh muc'] || row['Category'] || '';
  const unit = row['Giá trị thuộc tính 1'] || row['Tên thuộc tính 1'] || row['attribute 1'] || '';
  const shortDesc = row['Mô tả ngắn'] || row['Short description'] || row.short_description || '';
  const longDesc = row['Mô tả'] || row['Description'] || row.description || '';
  const quycach = extractParenthesis(name) || extractParenthesis(row['Quy cách'] || '');
  const images = (lightbox.images || []);
  const mainImage = images[selectedIndex] || images[0] || row['Hình đại diện'] || row['productImage'] || '';

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>Product Detail</h4>
            <h6>Product information</h6>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="row">
                <div className="col-lg-5">
                  <div className="product-gallery">
                    <div className="main-image mb-3">
                      {mainImage ? (
                        <img src={mainImage} alt={name} className="img-fluid" style={{ maxHeight: 420, objectFit: 'contain', width: '100%' }} onClick={() => openLight(selectedIndex)} />
                      ) : (
                        <div className="placeholder bg-light" style={{ height: 420 }} />
                      )}
                    </div>
                    <div className="thumbnails d-flex gap-2">
                      {images.length ? images.map((img, idx) => (
                        <button key={idx} type="button" className={`thumb btn p-0 border ${idx === selectedIndex ? 'active' : ''}`} onClick={() => onThumbClick(idx)} style={{ width: 76, height: 76 }}>
                          <img src={img} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      )) : null}
                    </div>
                  </div>
                </div>
                <div className="col-lg-7">
                  <div className="product-info">
                    <h2 style={{ marginTop: 0 }}>{name}</h2>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="text-muted">ID: <strong>{row.ID || row.id || '-'}</strong></div>
                      <div className="text-muted">Thương hiệu: <strong>{brand || '-'}</strong></div>
                    </div>
                    <div className="mb-2">Danh mục: <strong>{category || '-'}</strong></div>

                    <div className="mb-3">
                      <div className="mb-1 text-muted">Phân loại sản phẩm</div>
                      <div>
                        {unit ? (
                          <div className="btn-group">
                            <button className="btn btn-outline-primary">{unit}</button>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </div>
                    </div>

                    <hr />

                    <div className="row">
                      <div className="col-4 text-muted">Mô tả ngắn</div>
                      <div className="col-8">{stripHtml(shortDesc) || '-'}</div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-4 text-muted">Quy cách</div>
                      <div className="col-8">{quycach || '-'}</div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-12">
                        <div className="text-muted mb-2">Mô tả</div>
                        <div>{stripHtml(longDesc) || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
