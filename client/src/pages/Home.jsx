import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ProductCard from '../components/ProductCard'
import ScrollReveal from '../components/ScrollReveal'
import { SkeletonCard } from '../components/Skeleton'
import Testimonials from '../components/Testimonials'
import './Home.css'

function Home() {
    const [categories, setCategories] = useState([])

    const [allProducts, setAllProducts] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('Namkeen')


    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const categoryRefs = useRef({})


    // Banner images for continuously rolling banner
    const bannerImages = [
        '/banners/banner1.jpg',
        '/banners/banner2.jpg',
        '/banners/banner3.jpg',
        '/banners/banner4.jpg'
    ]

    useEffect(() => {
        fetchCategories()
        fetchProducts()
    }, [])

    const fetchCategories = async () => {
        try {
            // Fetch managed categories from Admin panel
            const response = await fetch('/api/categories')
            const data = await response.json()
            if (data.success) {
                // Map to names and ensure "All" is present
                const categoryNames = data.data.map(c => c.name)
                setCategories([...categoryNames, "All"])
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error)
            setCategories(["Namkeen", "Bhujia", "Diet", "Besan", "All"]) // Fallback without Mixture
        }
    }

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/products?limit=1000')
            const data = await response.json()
            if (data.success) {
                // Filter for active products
                const activeProducts = data.data.filter(p => p.isActive)
                setAllProducts(activeProducts)
            }
        } catch (error) {
            console.error('Failed to fetch products:', error)
        } finally {
            setLoading(false)
        }
    }

    const scrollOurProducts = (direction) => {
        if (ourProductsRef.current) {
            const scrollAmount = 320
            ourProductsRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }


    const scrollCategory = (categoryId, direction) => {
        const ref = categoryRefs.current[categoryId]
        if (ref) {
            const scrollAmount = 320
            ref.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    const filteredProducts = allProducts
        .filter(product => selectedCategory === 'All' || (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()))
        .sort((a, b) => {
            // Only sort by category if we are viewing "All"
            if (selectedCategory !== 'All') return 0

            const indexA = categories.indexOf(a.category)
            const indexB = categories.indexOf(b.category)

            // If category not found in list, push to end
            if (indexA === -1 && indexB === -1) return 0
            if (indexA === -1) return 1
            if (indexB === -1) return -1

            return indexA - indexB
        })

    return (
        <div className="home-page">
            <Helmet>
                <title>Brij Namkeen - Authentic Indian Snacks & Sweets</title>
                <meta name="description" content="Order premium quality namkeen, bhujia, and sweets online. Fresh, authentic Indian flavors delivered to your doorstep." />
            </Helmet>

            {/* Continuously Rolling Banner */}
            <section className="rolling-banner-section">
                <div className="rolling-banner-container">
                    <div className="rolling-banner-track">
                        {/* Duplicate images 4x for seamless infinite loop on all screens */}
                        {[...bannerImages, ...bannerImages, ...bannerImages, ...bannerImages].map((img, index) => (
                            <div key={index} className="rolling-banner-slide">
                                <img src={img} alt={`Banner ${(index % bannerImages.length) + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Product Catalogue Section with Filters */}
            <section className="product-catalogue-section" id="catalogue">
                <div className="container">
                    <ScrollReveal animation="fade-in">
                        <div className="section-header">
                            <h2 className="section-title">Our Collection</h2>
                            <p className="section-subtitle">
                                Explore our wide range of authentic Indian snacks and sweets
                            </p>
                        </div>
                    </ScrollReveal>

                    {/* Category Tabs */}
                    <ScrollReveal animation="fade-in" delay={100}>
                        <div className="categories-filter">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category === 'All' ? 'All Products' : category}
                                </button>
                            ))}
                        </div>
                    </ScrollReveal>

                    {/* Products Grid */}
                    <ScrollReveal animation="fade-in" delay={200} threshold={0}>
                        {loading ? (
                            <div className="products-grid">
                                {[...Array(8)].map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="products-grid">
                                {filteredProducts.map(product => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        onClick={() => navigate(`/products/${product._id}`)}
                                    />
                                ))}
                            </div>
                        )}
                        {!loading && filteredProducts.length === 0 && (
                            <div className="empty-state">
                                <p className="empty-state-text">No products found in this category.</p>
                            </div>
                        )}
                    </ScrollReveal>
                </div>
            </section>

            {/* Features Section with Staggered Parallax */}
            <section className="section features-section">
                <div className="container">
                    <div className="features-grid parallax-stagger">
                        <ScrollReveal animation="fade-in" delay={0}>
                            <div className="feature-card">
                                <div className="feature-icon parallax-float" style={{ animationDelay: '0s' }}>🌿</div>
                                <h3>100% Palm Oil Free</h3>
                                <p>We use only pure, healthy oils in all our products — no palm oil ever. Enjoy guilt-free snacking with ingredients you can trust.</p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal animation="fade-in" delay={100}>
                            <div className="feature-card">
                                <div className="feature-icon parallax-float" style={{ animationDelay: '0.5s' }}>🏆</div>
                                <h3>Premium Quality</h3>
                                <p>Handcrafted with traditional recipes</p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal animation="fade-in" delay={200}>
                            <div className="feature-card">
                                <div className="feature-icon parallax-float" style={{ animationDelay: '1s' }}>🚚</div>
                                <h3>Fast Delivery</h3>
                                <p>Quick delivery across the city</p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal animation="fade-in" delay={300}>
                            <div className="feature-card">
                                <div className="feature-icon parallax-float" style={{ animationDelay: '1.5s' }}>💯</div>
                                <h3>Satisfaction Guaranteed</h3>
                                <p>Fresh products or your money back</p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <Testimonials />



            {/* CTA Section with Parallax */}
            <section className="section cta-section parallax-section">
                <div className="container">
                    <ScrollReveal animation="scale">
                        <div className="cta-content">
                            <h2>Ready to Taste the Difference?</h2>
                            <p>Contact us now and experience the authentic flavors of traditional Indian snacks.</p>
                            <Link to="/contact" className="btn btn-primary btn-lg">
                                Contact Us
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>


        </div>
    )
}

export default Home
