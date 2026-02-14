import { useState } from 'react'

function ProductCard({ product, onClick }) {
    const [isHovered, setIsHovered] = useState(false)

    // Get images array, fallback to single image
    const images = product.images?.length > 0 ? product.images : [product.image]

    // Show second image on hover if available, otherwise show first
    const displayImage = isHovered && images.length > 1 ? images[1] : images[0]
    const fallbackImage = 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400'

    return (
        <div
            className="product-card"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="product-image">
                <img
                    src={displayImage || fallbackImage}
                    alt={product.name}
                    loading="lazy"
                    style={{ transition: 'opacity 0.3s ease' }}
                />

                {/* Product Tags */}
                <div className="product-tags">
                    {product.isBestSeller && (
                        <span className="product-tag tag-bestseller">★ Best Seller</span>
                    )}
                    {product.isPalmOilFree && (
                        <span className="product-tag tag-palmoilfree">🌿 Palm Oil Free</span>
                    )}
                </div>

                {!product.isActive && (
                    <span className="product-badge badge badge-warning">Out of Stock</span>
                )}

                {/* Image count indicator */}
                {images.length > 1 && (
                    <span className="image-count">{images.length} images</span>
                )}
            </div>

            <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>

                <div className="product-footer">
                    <span className="view-details-btn">View Details →</span>
                </div>
            </div>

            <style>{`
                .product-card {
                    position: relative;
                }
                
                .product-image {
                    position: relative;
                    overflow: hidden;
                }
                
                .product-tags {
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    z-index: 2;
                }
                
                .product-tag {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
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
                
                .image-count {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    background: rgba(0, 0, 0, 0.6);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    backdrop-filter: blur(4px);
                }
            `}</style>
        </div>
    )
}

export default ProductCard
