import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Loader from '../components/Loader'

function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    useEffect(() => {
        fetchProduct()
    }, [id])

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${id}`)
            const data = await response.json()
            if (data.success) {
                setProduct(data.data)
            } else {
                navigate('/catalogue')
            }
        } catch (error) {
            console.error('Failed to fetch product:', error)
            navigate('/catalogue')
        } finally {
            setLoading(false)
        }
    }

    // Get images array, fallback to single image
    const getImages = () => {
        if (!product) return []
        if (product.images?.length > 0) return product.images
        if (product.image) return [product.image]
        return ['https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800']
    }

    const images = product ? getImages() : []

    const nextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '80vh' }}>
                <Loader />
            </div>
        )
    }

    if (!product) {
        return null
    }

    return (
        <div className="product-detail-page">
            <Helmet>
                <title>{`${product.name} - Brij Namkeen`}</title>
                <meta name="description" content={product.description} />
                <meta property="og:title" content={`${product.name} - Brij Namkeen`} />
                <meta property="og:description" content={product.description} />
                <meta property="og:image" content={product.images?.[0] || product.image} />
            </Helmet>

            <section className="section">
                <div className="container">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-ghost"
                        style={{ marginBottom: 'var(--space-6)' }}
                    >
                        ← Back to Products
                    </button>

                    <div className="product-detail-grid">
                        {/* Product Image Gallery */}
                        <div className="product-gallery">
                            <div className="main-image-container">
                                {images.length > 1 && (
                                    <button className="gallery-nav prev" onClick={prevImage}>‹</button>
                                )}
                                <img
                                    src={images[selectedImageIndex] || 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800'}
                                    alt={product.name}
                                    className="main-image"
                                />
                                {images.length > 1 && (
                                    <button className="gallery-nav next" onClick={nextImage}>›</button>
                                )}

                                {/* Product Tags */}
                                <div className="product-detail-tags">
                                    {product.isBestSeller && (
                                        <span className="detail-tag tag-bestseller">★ Best Seller</span>
                                    )}
                                    {product.isPalmOilFree && (
                                        <span className="detail-tag tag-palmoilfree">🌿 Palm Oil Free</span>
                                    )}
                                </div>
                            </div>

                            {/* Thumbnail Strip */}
                            {images.length > 1 && (
                                <div className="thumbnail-strip">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                                            onClick={() => setSelectedImageIndex(index)}
                                        >
                                            <img src={img} alt={`${product.name} ${index + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="product-detail-info">
                            <span className="badge badge-primary">{product.category}</span>

                            <h1 className="product-detail-name">{product.name}</h1>

                            <p className="product-detail-desc">{product.description}</p>

                            <div className="product-detail-actions">
                                <Link to="/contact" className="btn btn-primary btn-lg">
                                    📞 Contact for Orders
                                </Link>
                            </div>

                            <div className="order-info">
                                <h4>How to Order</h4>
                                <p>To place an order for this product, please contact us via:</p>
                                <ul>
                                    <li>📱 Phone: +91 98765 43210</li>
                                    <li>✉️ Email: orders@brijnamkeen.com</li>
                                    <li>💬 Fill our contact form</li>
                                </ul>
                            </div>

                            <div className="product-features">
                                <div className="feature">
                                    <span>🌿</span> 100% Palm Oil Free
                                </div>
                                <div className="feature">
                                    <span>🚚</span> Delivery Available
                                </div>
                                <div className="feature">
                                    <span>📦</span> Fresh & Hygienically Packed
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .product-detail-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: var(--space-10);
                }

                @media (min-width: 768px) {
                    .product-detail-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                .product-gallery {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }

                .main-image-container {
                    position: relative;
                    border-radius: var(--radius-2xl);
                    overflow: hidden;
                    box-shadow: var(--shadow-xl);
                }

                .main-image {
                    width: 100%;
                    aspect-ratio: 1;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .gallery-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    font-size: 24px;
                    cursor: pointer;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    box-shadow: var(--shadow-md);
                }

                .gallery-nav:hover {
                    background: white;
                    transform: translateY(-50%) scale(1.1);
                }

                .gallery-nav.prev {
                    left: 12px;
                }

                .gallery-nav.next {
                    right: 12px;
                }

                .product-detail-tags {
                    position: absolute;
                    top: 16px;
                    left: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    z-index: 2;
                }

                .detail-tag {
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    backdrop-filter: blur(4px);
                }

                .tag-bestseller {
                    background: linear-gradient(135deg, #ffd700, #ffb347);
                    color: #1a1a1a;
                    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
                }

                .tag-palmoilfree {
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    color: white;
                    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
                }

                .thumbnail-strip {
                    display: flex;
                    gap: var(--space-2);
                    overflow-x: auto;
                    padding: var(--space-2);
                }

                .thumbnail {
                    flex-shrink: 0;
                    width: 70px;
                    height: 70px;
                    border: 2px solid transparent;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    padding: 0;
                    background: none;
                }

                .thumbnail:hover {
                    border-color: var(--primary-400);
                }

                .thumbnail.active {
                    border-color: var(--primary-600);
                    box-shadow: 0 0 0 2px var(--primary-200);
                }

                .thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .product-detail-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }

                .product-detail-name {
                    font-family: var(--font-display);
                    font-size: var(--text-4xl);
                    color: var(--text-primary);
                }

                .product-detail-meta {
                    display: flex;
                    gap: var(--space-4);
                    color: var(--text-secondary);
                }

                .product-detail-stock {
                    color: var(--success);
                }

                .product-detail-desc {
                    font-size: var(--text-lg);
                    color: var(--text-secondary);
                    line-height: 1.7;
                }

                .product-detail-price {
                    font-size: var(--text-4xl);
                    font-weight: 700;
                    color: var(--primary-600);
                }

                .product-detail-actions {
                    display: flex;
                    gap: var(--space-4);
                    align-items: center;
                    flex-wrap: wrap;
                }

                .order-info {
                    background: var(--bg-secondary);
                    padding: var(--space-5);
                    border-radius: var(--radius-xl);
                    margin-top: var(--space-2);
                }

                .order-info h4 {
                    font-size: var(--text-lg);
                    margin-bottom: var(--space-2);
                    color: var(--text-primary);
                }

                .order-info p {
                    color: var(--text-secondary);
                    margin-bottom: var(--space-3);
                }

                .order-info ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .order-info li {
                    padding: var(--space-2) 0;
                    color: var(--text-secondary);
                }

                .product-features {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                    padding-top: var(--space-6);
                    border-top: 1px solid var(--border-light);
                    margin-top: var(--space-4);
                }

                .feature {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    )
}

export default ProductDetail
