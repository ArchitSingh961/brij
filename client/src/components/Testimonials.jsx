import React from 'react'
import ScrollReveal from './ScrollReveal'
import './Testimonials.css'

const testimonials = [
    {
        id: 1,
        name: "Rajesh Kumar",
        platform: "BigBasket",
        product: "Ratllami Sev (Bestseller)",
        rating: 5,
        text: "Absolutely authentic taste! The Ratlami Sev reminds me of my time in Indore. Perfectly spicy and crunchy. Highly recommended!"
    },
    {
        id: 2,
        name: "Priya Sharma",
        platform: "JioMart",
        product: "All in One Mixture",
        rating: 5,
        text: "Love the variety in the All in One Mixture. It's the perfect tea-time snack. The packaging kept it fresh and crisp."
    },
    {
        id: 3,
        name: "Amit Patel",
        platform: "BigBasket",
        product: "Moong Dal",
        rating: 5,
        text: "Best Moong Dal I've had in a long time. Not too oily, just perfect saltiness. My kids love it too!"
    },
    {
        id: 4,
        name: "Sneha Gupta",
        platform: "JioMart",
        product: "Khatta Meetha (Bestseller)",
        rating: 5,
        text: "The Khatta Meetha is addictive! Can't stop eating it. Delivery was super fast even to Bangalore."
    },
    {
        id: 5,
        name: "Vikram Singh",
        platform: "BigBasket",
        product: "Bhujia Sev",
        rating: 5,
        text: "Authentic Bikaneri taste. The Bhujia Sev has that perfect moth dal flavor. Will definitely order again."
    },
    {
        id: 6,
        name: "Anjali Desai",
        platform: "JioMart",
        product: "Chana Dal",
        rating: 5,
        text: "Very fresh and tasty Chana Dal. Spices are balanced perfectly. Great to see such quality traditional snacks online."
    },
    {
        id: 7,
        name: "Karan Malhotra",
        platform: "BigBasket",
        product: "Cornflakes Mixture",
        rating: 5,
        text: "Unique and tasty! The Cornflakes Mixture is a great change from regular namkeens. Very crunchy and flavorful."
    },
    {
        id: 8,
        name: "Meera Reddy",
        platform: "JioMart",
        product: "Punjabi Tadka (Bestseller)",
        rating: 5,
        text: "Spicy and tangy! Punjabi Tadka lives up to its name. Perfect companion for evening drinks."
    }
]

const Testimonials = () => {
    return (
        <section className="testimonials-section">
            <div className="container">
                <ScrollReveal animation="fade-in">
                    <div className="section-header">
                        <h2 className="section-title">What Our Customers Say</h2>
                        <p className="section-subtitle">
                            Join thousands of happy customers enjoying authentic flavors
                        </p>
                    </div>
                </ScrollReveal>

                <div className="testimonials-grid">
                    {testimonials.map((review, index) => (
                        <ScrollReveal key={review.id} animation="fade-in" delay={index * 50}>
                            <div className="testimonial-card">
                                <div className="testimonial-header">
                                    <div className="platform-tag">{review.platform}</div>
                                    <div className="rating">{"★".repeat(review.rating)}</div>
                                </div>
                                <p className="testimonial-text">"{review.text}"</p>
                                <div className="testimonial-footer">
                                    <div className="customer-info">
                                        <h4 className="customer-name">{review.name}</h4>
                                        <span className="product-tag">{review.product}</span>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonials
