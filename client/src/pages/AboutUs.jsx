import ScrollReveal from '../components/ScrollReveal'

function AboutUs() {
    return (
        <div className="about-page">
            {/* Hero with Parallax */}
            <section className="about-hero parallax-section">
                <div className="container">
                    <ScrollReveal animation="fade-in">
                        <h1>About Brij Namkeen</h1>
                        <p>Authentic taste, passed down through generations</p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Story with Parallax Slide Effects */}
            <section className="about-section">
                <div className="container">
                    <div className="about-grid">
                        <ScrollReveal animation="slide-left">
                            <div className="about-image" style={{ textAlign: 'center' }}>
                                <img
                                    src="/founder.png"
                                    alt="Founder of Brij Namkeen"
                                    style={{ marginBottom: 'var(--space-4)' }}
                                />
                                <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-1)', color: 'var(--primary-700)' }}>Mr. BRIJNANDAN SINGH</h3>
                                <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>The Director</p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal animation="slide-right" delay={200}>
                            <div className="about-content">
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>
                                    About Us
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: 'var(--space-4)' }}>
                                    At Brij Namkeen, we believe that every snack tells a story. Rooted in
                                    tradition and crafted with love, our Namkeen embodies the rich flavors
                                    and vibrant culture of India. Each batch is made with carefully selected
                                    ingredients, combining authentic spices and timeless recipes to bring you
                                    the perfect blend of crunch and taste.
                                </p>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: 'var(--space-4)' }}>
                                    Our mission is to deliver joy in every bite, whether you're enjoying a quiet
                                    moment or sharing with friends and family. We take pride in our
                                    commitment to quality and sustainability, ensuring that each product not
                                    only delights your palate but also respects the planet.
                                </p>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: 'var(--space-4)' }}>
                                    Join us on this flavorful journey, and experience the essence of India in
                                    every crunchy morsel.
                                </p>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontWeight: '600' }}>
                                    Taste the difference with Brij Namkeen — where tradition meets innovation.
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Values with Staggered Parallax */}
            <section className="about-section parallax-section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <ScrollReveal animation="fade-in">
                        <div className="section-header">
                            <h2 className="section-title">Our Values</h2>
                            <p className="section-subtitle">
                                What makes Brij Namkeen special
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="values-grid parallax-stagger">
                        <ScrollReveal animation="fade-in" delay={0}>
                            <div className="value-card">
                                <div className="value-icon parallax-float" style={{ animationDelay: '0s' }}>🌿</div>
                                <h3>100% Palm Oil Free</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    We use only pure, healthy oils in all our products — no palm oil ever.
                                    Enjoy guilt-free snacking with ingredients you can trust.
                                </p>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal animation="fade-in" delay={100}>
                            <div className="value-card">
                                <div className="value-icon parallax-float" style={{ animationDelay: '0.3s' }}>🏆</div>
                                <h3>Quality First</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Every product goes through strict quality checks before reaching you.
                                </p>
                            </div>
                        </ScrollReveal>



                        <ScrollReveal animation="fade-in" delay={300}>
                            <div className="value-card">
                                <div className="value-icon parallax-float" style={{ animationDelay: '0.9s' }}>💚</div>
                                <h3>Made with Love</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Handcrafted by skilled artisans who take pride in their work.
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Contact with Parallax */}
            <section className="about-section">
                <div className="container">
                    <ScrollReveal animation="scale">
                        <div className="section-header">
                            <h2 className="section-title">Visit Us</h2>
                            <p className="section-subtitle">
                                We'd love to hear from you
                            </p>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal animation="fade-in" delay={200}>
                        <div className="contact-info" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <strong>Address:</strong><br />
                                G-306, Sector - 63, Noida, Dadri Tahsil, Gautam
                                Buddha Nagar, (U.P.) - 201301 India
                            </div>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <strong>Phone:</strong><br />
                                0120-4462579
                            </div>
                            <div>
                                <strong>Email:</strong><br />
                                contact@brijnamkeen.com
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    )
}

export default AboutUs

