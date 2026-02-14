import { useRef, useEffect, useState } from 'react'

/**
 * ParallaxSection Component
 * Creates a parallax scrolling effect on its children
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to display
 * @param {string} props.backgroundImage - Optional background image URL
 * @param {number} props.speed - Parallax speed (0.1 to 1, default 0.5)
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 * @param {boolean} props.overlay - Whether to add a dark overlay
 */
function ParallaxSection({
    children,
    backgroundImage,
    speed = 0.5,
    className = '',
    style = {},
    overlay = false
}) {
    const sectionRef = useRef(null)
    const [offset, setOffset] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            if (sectionRef.current) {
                const rect = sectionRef.current.getBoundingClientRect()
                const scrolled = window.scrollY
                const sectionTop = rect.top + scrolled
                const relativeScroll = scrolled - sectionTop
                setOffset(relativeScroll * speed)
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Initial call

        return () => window.removeEventListener('scroll', handleScroll)
    }, [speed])

    const sectionStyle = {
        position: 'relative',
        overflow: 'hidden',
        ...style
    }

    const backgroundStyle = backgroundImage ? {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: `translateY(${offset}px)`,
        willChange: 'transform',
        zIndex: -1
    } : null

    return (
        <section
            ref={sectionRef}
            className={`parallax-section ${className}`}
            style={sectionStyle}
        >
            {backgroundImage && (
                <>
                    <div style={backgroundStyle} className="parallax-bg" />
                    {overlay && <div className="parallax-overlay" />}
                </>
            )}
            <div className="parallax-content" style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </section>
    )
}

export default ParallaxSection
