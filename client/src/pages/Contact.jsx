import { useState } from 'react'
import ScrollReveal from '../components/ScrollReveal'

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })
    const [status, setStatus] = useState({ type: '', message: '' })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setStatus({ type: '', message: '' })

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                setStatus({
                    type: 'success',
                    message: 'Thank you for your message! We will get back to you soon.'
                })
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
            } else {
                let errorMessage = data.message || 'Something went wrong. Please try again.';
                if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    errorMessage = data.errors.map(err => err.msg).join('. ');
                }
                setStatus({
                    type: 'error',
                    message: errorMessage
                })
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: 'Failed to send message. Please try again later.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="contact-page">
            <section className="section parallax-section" style={{ background: 'var(--bg-secondary)', paddingTop: 'var(--space-8)' }}>
                <div className="container">
                    <ScrollReveal animation="fade-in">
                        <div className="section-header">
                            <h1 className="section-title">Contact Us</h1>
                            <p className="section-subtitle">
                                Have questions or want to place an order? We'd love to hear from you!
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="contact-grid">
                        {/* Contact Form */}
                        <ScrollReveal animation="slide-left" delay={100}>
                            <div className="contact-form-wrapper">
                                <form onSubmit={handleSubmit} className="contact-form">
                                    <h2>Send us a Message</h2>

                                    {status.message && (
                                        <div className={`alert ${status.type}`}>
                                            {status.message}
                                        </div>
                                    )}

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="name">Full Name *</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">Email Address *</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="phone">Phone Number</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="subject">Subject *</label>
                                            <select
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select a subject</option>
                                                <option value="general">General Inquiry</option>
                                                <option value="order">Place an Order</option>
                                                <option value="bulk">Bulk Order</option>
                                                <option value="feedback">Feedback</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="message">Message *</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="5"
                                            placeholder="Tell us how we can help you..."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={loading}
                                    >
                                        {loading ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        </ScrollReveal>

                        {/* Contact Info */}
                        <ScrollReveal animation="slide-right" delay={200}>
                            <div className="contact-info">
                                <div className="info-card">
                                    <div className="info-icon parallax-float" style={{ animationDelay: '0s' }}>📍</div>
                                    <h3>Visit Us</h3>
                                    <p>Brij Namkeen</p>
                                    <p>G-306, Sector - 63, Noida</p>
                                    <p>Dadri Tahsil, Gautam Buddha Nagar</p>
                                    <p>(U.P.) - 201301 India</p>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon parallax-float" style={{ animationDelay: '0.3s' }}>📞</div>
                                    <h3>Call Us</h3>
                                    <p>0120-4462579</p>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon parallax-float" style={{ animationDelay: '0.6s' }}>✉️</div>
                                    <h3>Email Us</h3>
                                    <p>brijenterprises@yahoo.com</p>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon parallax-float" style={{ animationDelay: '0.9s' }}>🕐</div>
                                    <h3>Business Hours</h3>
                                    <p>Monday - Saturday</p>
                                    <p>9:00 AM - 8:00 PM</p>
                                    <p className="note">Sunday: Closed</p>
                                </div>

                                {/* Embedded Google Map */}
                                <div className="map-embed">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.7095045614186!2d77.37347767549877!3d28.612504075677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5456e8a0a9d%3A0x9e3f4f3e4a2d3a3c!2sSector%2063%2C%20Noida%2C%20Uttar%20Pradesh%20201301!5e0!3m2!1sen!2sin!4v1706703600000!5m2!1sen!2sin"
                                        width="100%"
                                        height="200"
                                        style={{ border: 0, borderRadius: '12px' }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Brij Namkeen Location"
                                    ></iframe>
                                    <a
                                        href="https://www.google.com/maps/search/G-306+Sector+63+Noida+Dadri+Tahsil+Gautam+Buddha+Nagar+201301"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="map-link"
                                    >
                                        View larger map →
                                    </a>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            <style>{`
                .contact-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: var(--space-10);
                    margin-top: var(--space-8);
                }

                @media (min-width: 992px) {
                    .contact-grid {
                        grid-template-columns: 1.2fr 0.8fr;
                    }
                }

                .contact-form-wrapper {
                    background: var(--bg-card);
                    padding: var(--space-8);
                    border-radius: var(--radius-2xl);
                    box-shadow: var(--shadow-lg);
                }

                .contact-form h2 {
                    font-family: var(--font-display);
                    font-size: var(--text-2xl);
                    margin-bottom: var(--space-6);
                    color: var(--text-primary);
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: var(--space-4);
                }

                @media (min-width: 576px) {
                    .form-row {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                .form-group {
                    margin-bottom: var(--space-4);
                }

                .form-group label {
                    display: block;
                    margin-bottom: var(--space-2);
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: var(--space-3) var(--space-4);
                    border: 2px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    font-size: var(--text-base);
                    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
                    background: var(--bg-primary);
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: var(--primary-500);
                    box-shadow: 0 0 0 3px var(--primary-100);
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 120px;
                }

                .alert {
                    padding: var(--space-4);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--space-4);
                }

                .alert.success {
                    background: var(--success-light, #dcfce7);
                    color: var(--success, #16a34a);
                    border: 1px solid var(--success, #16a34a);
                }

                .alert.error {
                    background: var(--error-light, #fee2e2);
                    color: var(--error, #dc2626);
                    border: 1px solid var(--error, #dc2626);
                }

                .contact-info {
                    display: grid;
                    gap: var(--space-4);
                }

                .info-card {
                    background: var(--bg-card);
                    padding: var(--space-5);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-md);
                    transition: transform var(--transition-fast);
                }

                .info-card:hover {
                    transform: translateY(-2px);
                }

                .info-icon {
                    font-size: 2rem;
                    margin-bottom: var(--space-2);
                }

                .info-card h3 {
                    font-size: var(--text-lg);
                    margin-bottom: var(--space-2);
                    color: var(--text-primary);
                }

                .info-card p {
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                    line-height: 1.6;
                }

                .info-card .note {
                    color: var(--primary-600);
                    font-weight: 500;
                    margin-top: var(--space-2);
                }

                .map-embed {
                    background: var(--bg-card);
                    padding: var(--space-4);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-md);
                }

                .map-embed iframe {
                    display: block;
                    margin-bottom: var(--space-3);
                }

                .map-link {
                    display: inline-block;
                    color: var(--primary-500);
                    font-size: var(--text-sm);
                    font-weight: 500;
                    transition: color var(--transition-fast);
                }

                .map-link:hover {
                    color: var(--primary-600);
                }

                .contact-form .btn {
                    width: 100%;
                    margin-top: var(--space-4);
                }

                .contact-form .btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    )
}

export default Contact
