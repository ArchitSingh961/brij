import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import ScrollReveal from '../components/ScrollReveal'

function Search() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q')
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (query) {
            fetchSearchResults()
        } else {
            setLoading(false)
        }
    }, [query])

    const fetchSearchResults = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=100`)
            const data = await response.json()
            if (data.success) {
                setProducts(data.data)
            }
        } catch (error) {
            console.error('Search failed:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="search-page" style={{ paddingTop: 'var(--space-8)', minHeight: '80vh' }}>
            <div className="container">
                <ScrollReveal animation="fade-in">
                    <h1 className="section-title">Search Results</h1>
                    <p className="section-subtitle">
                        {loading
                            ? 'Searching...'
                            : `Found ${products.length} result${products.length !== 1 ? 's' : ''} for "${query}"`
                        }
                    </p>
                </ScrollReveal>

                {loading ? (
                    <div className="flex justify-center" style={{ padding: 'var(--space-12)' }}>
                        <div className="spinner"></div> // Will be replaced by branded loader later
                    </div>
                ) : (
                    <>
                        {products.length > 0 ? (
                            <div className="products-grid" style={{ marginTop: 'var(--space-8)' }}>
                                {products.map((product, index) => (
                                    <ScrollReveal key={product._id} animation="fade-in" delay={index * 50}>
                                        <ProductCard
                                            product={product}
                                            onClick={() => navigate(`/products/${product._id}`)}
                                        />
                                    </ScrollReveal>
                                ))}
                            </div>
                        ) : (
                            <div className="no-results" style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-8)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🔍</div>
                                <h3 style={{ marginBottom: 'var(--space-2)' }}>No products found</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                                    We couldn't find any matches for "{query}". <br />Try checking for typos or using different keywords.
                                </p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/')}
                                >
                                    Browse All Products
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Search
