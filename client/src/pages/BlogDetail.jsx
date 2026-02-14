import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function BlogDetail() {
    const { id } = useParams()
    const [blog, setBlog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`/api/blogs/${id}`)
                const data = await response.json()
                if (data.success) {
                    setBlog(data.data)
                } else {
                    setError('Blog post not found')
                }
            } catch (err) {
                setError('Failed to fetch blog post')
            } finally {
                setLoading(false)
            }
        }

        fetchBlog()
    }, [id])

    if (loading) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        )
    }

    if (error || !blog) {
        return (
            <div className="blog-detail-page">
                <section className="section" style={{ background: 'var(--bg-secondary)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="container" style={{ textAlign: 'center' }}>
                        <h1>Blog Not Found</h1>
                        <p style={{ marginTop: 'var(--space-4)', color: 'var(--text-secondary)' }}>
                            {error || "The blog post you're looking for doesn't exist."}
                        </p>
                        <Link to="/blogs" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}>
                            ← Back to Blogs
                        </Link>
                    </div>
                </section>
            </div>
        )
    }

    return (
        <div className="blog-detail-page">
            <section className="section" style={{ background: 'var(--bg-secondary)', paddingTop: 'var(--space-8)' }}>
                <div className="container">
                    <Link to="/blogs" className="back-link">
                        ← Back to Blogs
                    </Link>

                    <article className="blog-article">
                        <header className="blog-header">
                            <span className="blog-category">{blog.category}</span>
                            <h1 className="blog-title">{blog.title}</h1>
                            <div className="blog-meta">
                                <span className="blog-author">By {blog.author}</span>
                                <span className="blog-date">{new Date(blog.createdAt).toLocaleDateString()}</span>
                                <span className="blog-read-time">{blog.readTime}</span>
                            </div>
                        </header>

                        <div className="blog-featured-image">
                            <img src={blog.image} alt={blog.title} />
                        </div>

                        <div className="blog-content">
                            {blog.content.split('\n').map((line, index) => {
                                // Simple markdown-like parsing
                                const trimmed = line.trim();
                                if (trimmed === '') return <br key={index} />;

                                if (trimmed.startsWith('## ')) {
                                    return <h2 key={index}>{trimmed.replace('## ', '')}</h2>
                                } else if (trimmed.startsWith('---')) {
                                    return <hr key={index} />
                                } else if (trimmed.startsWith('- ')) {
                                    return <li key={index} style={{ marginLeft: '20px' }}>{trimmed.replace('- ', '')}</li>
                                } else {
                                    // Handle bold text **text**
                                    const parts = line.split(/(\*\*.*?\*\*)/g);
                                    return (
                                        <p key={index}>
                                            {parts.map((part, i) => {
                                                if (part.startsWith('**') && part.endsWith('**')) {
                                                    return <strong key={i}>{part.slice(2, -2)}</strong>
                                                }
                                                return part;
                                            })}
                                        </p>
                                    )
                                }
                            })}
                        </div>

                        <footer className="blog-footer">
                            <div className="share-section">
                                <span>Share this article:</span>
                                <div className="share-buttons">
                                    <button className="btn btn-ghost btn-sm" onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link copied to clipboard!');
                                    }}>
                                        📋 Copy Link
                                    </button>
                                </div>
                            </div>
                            <Link to="/blogs" className="btn btn-primary">
                                ← Back to All Blogs
                            </Link>
                        </footer>
                    </article>
                </div>
            </section>

            <style>{`
                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-2);
                    color: var(--primary-600);
                    font-weight: 500;
                    margin-bottom: var(--space-6);
                    transition: color var(--transition-fast);
                }

                .back-link:hover {
                    color: var(--primary-700);
                }

                .blog-article {
                    max-width: 800px;
                    margin: 0 auto;
                    background: var(--bg-card);
                    border-radius: var(--radius-2xl);
                    overflow: hidden;
                    box-shadow: var(--shadow-lg);
                }

                .blog-header {
                    padding: var(--space-8);
                    text-align: center;
                    border-bottom: 1px solid var(--border-light);
                }

                .blog-category {
                    display: inline-block;
                    background: var(--primary-100);
                    color: var(--primary-700);
                    padding: var(--space-1) var(--space-4);
                    border-radius: var(--radius-full);
                    font-size: var(--text-sm);
                    font-weight: 600;
                    margin-bottom: var(--space-4);
                }

                .blog-title {
                    font-family: var(--font-display);
                    font-size: var(--text-4xl);
                    color: var(--text-primary);
                    line-height: 1.2;
                    margin-bottom: var(--space-4);
                }

                @media (max-width: 768px) {
                    .blog-title {
                        font-size: var(--text-2xl);
                    }
                }

                .blog-meta {
                    display: flex;
                    justify-content: center;
                    gap: var(--space-4);
                    flex-wrap: wrap;
                    font-size: var(--text-sm);
                    color: var(--text-secondary);
                }

                .blog-author {
                    font-weight: 500;
                    color: var(--primary-600);
                }

                .blog-featured-image {
                    width: 100%;
                    overflow: hidden;
                    background: #f5f5f5;
                }

                .blog-featured-image img {
                    width: 100%;
                    height: auto;
                    display: block;
                }

                .blog-content {
                    padding: var(--space-8);
                    font-size: var(--text-lg);
                    line-height: 1.8;
                    color: var(--text-primary);
                }

                .blog-content h2 {
                    font-family: var(--font-display);
                    font-size: var(--text-2xl);
                    color: var(--text-primary);
                    margin-top: var(--space-8);
                    margin-bottom: var(--space-4);
                }

                .blog-content p {
                    margin-bottom: var(--space-4);
                    color: var(--text-secondary);
                }

                .blog-content hr {
                    border: none;
                    border-top: 2px solid var(--border-light);
                    margin: var(--space-8) 0;
                }

                .blog-footer {
                    padding: var(--space-8);
                    border-top: 1px solid var(--border-light);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: var(--space-4);
                }

                .share-section {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                    color: var(--text-secondary);
                }

                .share-buttons {
                    display: flex;
                    gap: var(--space-2);
                }
            `}</style>
        </div>
    )
}

export default BlogDetail
