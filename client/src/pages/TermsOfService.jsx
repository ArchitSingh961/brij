import { Link } from 'react-router-dom'

function TermsOfService() {
    return (
        <div className="legal-page">
            <section className="section">
                <div className="container">
                    <div className="legal-content">
                        <h1>Terms of Service</h1>
                        <p className="last-updated">Last Updated: February 2026</p>

                        <section className="legal-section">
                            <h2>1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using the Brij Namkeen website and services, you agree to be bound
                                by these Terms of Service. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>2. Products and Orders</h2>
                            <p>
                                All products displayed on our website are subject to availability. We reserve the right
                                to limit quantities, discontinue products, and refuse service at our discretion.
                            </p>
                            <ul>
                                <li>Product images are for illustration purposes only</li>
                                <li>Actual products may vary slightly from images shown</li>
                                <li>Prices are subject to change without notice</li>
                                <li>All orders are subject to confirmation and acceptance</li>
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2>3. Payment and Pricing</h2>
                            <p>
                                All prices are listed in Indian Rupees (INR). Payment must be made through our
                                approved payment methods. We use secure payment processing to protect your information.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>4. Delivery</h2>
                            <p>
                                Delivery times are estimates and may vary based on location and product availability.
                                We are not responsible for delays caused by circumstances beyond our control.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>5. Returns and Refunds</h2>
                            <p>
                                Due to the perishable nature of our food products, returns are only accepted for
                                damaged or incorrect items. Please contact us within 24 hours of delivery for any issues.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>6. Intellectual Property</h2>
                            <p>
                                All content on this website, including text, images, logos, and designs, is the
                                property of Brij Namkeen and is protected by intellectual property laws.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>7. Limitation of Liability</h2>
                            <p>
                                Brij Namkeen shall not be liable for any indirect, incidental, or consequential
                                damages arising from the use of our products or services.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>8. Contact Information</h2>
                            <p>
                                For questions about these Terms of Service, please contact us at:
                            </p>
                            <ul>
                                <li>Email: brijenterprises@yahoo.com</li>
                                <li>Phone: 0120-4462579</li>
                                <li>Address: G-306, Sector - 63, Noida, Dadri Tahsil, Gautam Buddha Nagar, (U.P.) - 201301 India</li>
                            </ul>
                        </section>

                        <div className="legal-footer">
                            <Link to="/" className="btn btn-primary">← Back to Home</Link>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .legal-page {
                    padding: var(--space-8) 0;
                }

                .legal-content {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .legal-content h1 {
                    font-family: var(--font-display);
                    font-size: var(--text-4xl);
                    color: var(--text-primary);
                    margin-bottom: var(--space-2);
                }

                .last-updated {
                    color: var(--text-tertiary);
                    font-size: var(--text-sm);
                    margin-bottom: var(--space-8);
                }

                .legal-section {
                    margin-bottom: var(--space-8);
                }

                .legal-section h2 {
                    font-size: var(--text-xl);
                    color: var(--text-primary);
                    margin-bottom: var(--space-3);
                }

                .legal-section p {
                    color: var(--text-secondary);
                    line-height: 1.8;
                    margin-bottom: var(--space-3);
                }

                .legal-section ul {
                    color: var(--text-secondary);
                    padding-left: var(--space-6);
                    line-height: 1.8;
                }

                .legal-section li {
                    margin-bottom: var(--space-2);
                }

                .legal-footer {
                    margin-top: var(--space-12);
                    padding-top: var(--space-8);
                    border-top: 1px solid var(--border-light);
                }
            `}</style>
        </div>
    )
}

export default TermsOfService
