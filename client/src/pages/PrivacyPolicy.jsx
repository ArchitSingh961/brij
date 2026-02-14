import { Link } from 'react-router-dom'

function PrivacyPolicy() {
    return (
        <div className="legal-page">
            <section className="section">
                <div className="container">
                    <div className="legal-content">
                        <h1>Privacy Policy</h1>
                        <p className="last-updated">Last Updated: February 2026</p>

                        <section className="legal-section">
                            <h2>1. Information We Collect</h2>
                            <p>
                                We collect information that you provide directly to us, including:
                            </p>
                            <ul>
                                <li>Name and contact information (email, phone number, address)</li>
                                <li>Order and transaction history</li>
                                <li>Communication preferences</li>
                                <li>Feedback and correspondence</li>
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2>2. How We Use Your Information</h2>
                            <p>
                                We use the information we collect to:
                            </p>
                            <ul>
                                <li>Process and fulfill your orders</li>
                                <li>Communicate with you about orders and services</li>
                                <li>Send promotional offers (with your consent)</li>
                                <li>Improve our products and services</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2>3. Information Sharing</h2>
                            <p>
                                We do not sell, trade, or rent your personal information to third parties.
                                We may share your information with:
                            </p>
                            <ul>
                                <li>Delivery partners to fulfill orders</li>
                                <li>Payment processors for secure transactions</li>
                                <li>Service providers who assist our operations</li>
                                <li>Law enforcement when required by law</li>
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2>4. Data Security</h2>
                            <p>
                                We implement appropriate security measures to protect your personal information
                                against unauthorized access, alteration, disclosure, or destruction. This includes
                                encryption, secure servers, and access controls.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>5. Cookies and Tracking</h2>
                            <p>
                                Our website uses cookies to enhance your browsing experience. Cookies help us
                                understand how you use our site and remember your preferences. You can control
                                cookie settings through your browser.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>6. Your Rights</h2>
                            <p>
                                You have the right to:
                            </p>
                            <ul>
                                <li>Access your personal information</li>
                                <li>Correct inaccurate information</li>
                                <li>Request deletion of your data</li>
                                <li>Opt-out of marketing communications</li>
                                <li>Withdraw consent at any time</li>
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2>7. Data Retention</h2>
                            <p>
                                We retain your personal information for as long as necessary to fulfill the
                                purposes for which it was collected, comply with legal obligations, resolve
                                disputes, and enforce our agreements.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>8. Children's Privacy</h2>
                            <p>
                                Our services are not directed to individuals under 18 years of age. We do not
                                knowingly collect personal information from children.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>9. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any
                                changes by posting the new policy on this page with an updated revision date.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2>10. Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy or our data practices, please contact us at:
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

export default PrivacyPolicy
