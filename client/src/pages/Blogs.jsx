import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Blogs() {
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('all')

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        try {
            const response = await fetch('/api/blogs')
            const data = await response.json()
            if (data.success) {
                setBlogs(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch blogs:', error)
        } finally {
            setLoading(false)
        }
    }



    const filteredBlogs = selectedCategory === 'all'
        ? blogs
        : blogs.filter(b => b.category === selectedCategory)

    if (loading) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="blogs-page">
            <section className="section" style={{ background: 'var(--bg-secondary)', paddingTop: 'var(--space-8)' }}>
                <div className="container">
                    <div className="section-header">
                        <h1 className="section-title">Our Blog</h1>
                        <p className="section-subtitle">
                            Stories, recipes, and insights from the world of Indian snacks
                        </p>
                    </div>



                    {/* Featured Post */}
                    {selectedCategory === 'all' && blogs.length > 0 && (
                        <Link to={`/blogs/${blogs[0]._id}`} className="featured-post-link">
                            <article className="featured-post">
                                <div className="featured-image">
                                    <img src={blogs[0].image} alt={blogs[0].title} />
                                </div>
                                <div className="featured-content">
                                    <span className="post-category">{blogs[0].category}</span>
                                    <h2 className="featured-title">{blogs[0].title}</h2>
                                    <p className="featured-excerpt">{blogs[0].excerpt}</p>
                                    <div className="post-meta">
                                        <span className="post-author">By {blogs[0].author}</span>
                                        <span className="post-date">{new Date(blogs[0].createdAt).toLocaleDateString()}</span>
                                        <span className="post-read-time">{blogs[0].readTime}</span>
                                    </div>
                                    <span className="read-more-btn">Read Full Article →</span>
                                </div>
                            </article>
                        </Link>
                    )}

                    {/* Blog Grid */}
                    <div className="blogs-grid">
                        {(selectedCategory === 'all' ? filteredBlogs.slice(1) : filteredBlogs).map(blog => (
                            <Link to={`/blogs/${blog._id}`} key={blog._id} className="blog-card-link">
                                <article className="blog-card">
                                    <div className="blog-image">
                                        <img src={blog.image} alt={blog.title} loading="lazy" />
                                    </div>
                                    <div className="blog-content">
                                        <span className="post-category">{blog.category}</span>
                                        <h3 className="blog-title">{blog.title}</h3>
                                        <p className="blog-excerpt">{blog.excerpt}</p>
                                        <div className="post-meta">
                                            <span className="post-author">{blog.author}</span>
                                            <span className="post-date">{new Date(blog.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <span className="read-more">Read More →</span>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>

                    {/* Newsletter CTA */}
                    <div className="newsletter-cta">
                        <h2>Stay Updated</h2>
                        <p>Get the latest recipes and articles delivered to your inbox</p>
                        <Link to="/contact" className="btn btn-primary btn-lg">
                            Subscribe Now
                        </Link>
                    </div>
                </div>
            </section>

            <style>{`
                .featured-post {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: var(--space-8);
                    background: var(--bg-card);
                    border-radius: var(--radius-2xl);
                    overflow: hidden;
                    box-shadow: var(--shadow-lg);
                    margin: var(--space-8) 0;
                }

                @media (min-width: 768px) {
                    .featured-post {
                        grid-template-columns: 1.2fr 1fr;
                    }
                }

                .featured-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    min-height: 300px;
                }

                .featured-content {
                    padding: var(--space-8);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .featured-title {
                    font-family: var(--font-display);
                    font-size: var(--text-3xl);
                    margin: var(--space-3) 0;
                    color: var(--text-primary);
                }

                .featured-excerpt {
                    color: var(--text-secondary);
                    font-size: var(--text-lg);
                    line-height: 1.7;
                    margin-bottom: var(--space-4);
                }

                .post-category {
                    display: inline-block;
                    background: var(--primary-100);
                    color: var(--primary-700);
                    padding: var(--space-1) var(--space-3);
                    border-radius: var(--radius-full);
                    font-size: var(--text-sm);
                    font-weight: 500;
                }

                .post-meta {
                    display: flex;
                    gap: var(--space-4);
                    font-size: var(--text-sm);
                    color: var(--text-secondary);
                    flex-wrap: wrap;
                }

                .post-author {
                    font-weight: 500;
                    color: var(--primary-600);
                }

                .blogs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: var(--space-8);
                    margin-top: var(--space-8);
                }

                .blog-card {
                    background: var(--bg-card);
                    border-radius: var(--radius-xl);
                    overflow: hidden;
                    box-shadow: var(--shadow-md);
                    transition: transform var(--transition-base), box-shadow var(--transition-base);
                }

                .blog-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-xl);
                }

                .blog-image {
                    aspect-ratio: 16/10;
                    overflow: hidden;
                }

                .blog-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform var(--transition-base);
                }

                .blog-card:hover .blog-image img {
                    transform: scale(1.05);
                }

                .blog-content {
                    padding: var(--space-5);
                }

                .blog-title {
                    font-family: var(--font-display);
                    font-size: var(--text-xl);
                    margin: var(--space-2) 0;
                    color: var(--text-primary);
                    line-height: 1.3;
                }

                .blog-excerpt {
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                    line-height: 1.6;
                    margin-bottom: var(--space-4);
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .newsletter-cta {
                    text-align: center;
                    margin-top: var(--space-16);
                    padding: var(--space-12);
                    background: linear-gradient(135deg, var(--primary-500) 0%, var(--secondary-500) 100%);
                    border-radius: var(--radius-2xl);
                    color: white;
                }

                .newsletter-cta h2 {
                    font-family: var(--font-display);
                    font-size: var(--text-3xl);
                    margin-bottom: var(--space-3);
                }

                .newsletter-cta p {
                    font-size: var(--text-lg);
                    opacity: 0.9;
                    margin-bottom: var(--space-6);
                }

                .newsletter-cta .btn {
                    background: white;
                    color: var(--primary-600);
                }

                .newsletter-cta .btn:hover {
                    background: var(--neutral-100);
                }

                /* Clickable Card Styles */
                .featured-post-link,
                .blog-card-link {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                }

                .featured-post-link:hover .featured-post,
                .blog-card-link:hover .blog-card {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-xl);
                }

                .featured-post-link:hover .featured-image img,
                .blog-card-link:hover .blog-image img {
                    transform: scale(1.05);
                }

                .read-more-btn {
                    display: inline-block;
                    margin-top: var(--space-4);
                    padding: var(--space-2) var(--space-4);
                    background: var(--primary-500);
                    color: white;
                    border-radius: var(--radius-lg);
                    font-weight: 500;
                    font-size: var(--text-sm);
                    transition: all var(--transition-fast);
                }

                .featured-post-link:hover .read-more-btn {
                    background: var(--primary-600);
                }

                .read-more {
                    display: inline-block;
                    margin-top: var(--space-2);
                    color: var(--primary-600);
                    font-weight: 500;
                    font-size: var(--text-sm);
                    transition: color var(--transition-fast);
                }

                .blog-card-link:hover .read-more {
                    color: var(--primary-700);
                }

                .featured-post,
                .blog-card {
                    transition: transform var(--transition-base), box-shadow var(--transition-base);
                }

                .featured-image img,
                .blog-image img {
                    transition: transform var(--transition-base);
                }
            `}</style>
        </div>
    )
}

export default Blogs
