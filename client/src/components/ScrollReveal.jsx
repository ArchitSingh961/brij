import { useEffect, useRef } from 'react'

/**
 * ScrollReveal Component
 * Adds scroll-triggered reveal animations to children
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} props.animation - Animation type: 'fade-in', 'slide-left', 'slide-right', 'scale', 'rotate'
 * @param {number} props.delay - Animation delay in ms
 * @param {number} props.threshold - Intersection threshold (0 to 1)
 * @param {string} props.className - Additional CSS classes
 */
function ScrollReveal({
    children,
    animation = 'fade-in',
    delay = 0,
    threshold = 0.1,
    className = ''
}) {
    const ref = useRef(null)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('visible')
                        }, delay)
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold, rootMargin: '0px 0px -50px 0px' }
        )

        observer.observe(element)

        return () => observer.disconnect()
    }, [delay, threshold])

    const animationClass = {
        'fade-in': 'parallax-fade-in',
        'slide-left': 'parallax-slide-left',
        'slide-right': 'parallax-slide-right',
        'scale': 'parallax-scale',
        'rotate': 'parallax-rotate'
    }[animation] || 'parallax-fade-in'

    return (
        <div ref={ref} className={`${animationClass} ${className}`}>
            {children}
        </div>
    )
}

export default ScrollReveal
