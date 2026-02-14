import { useEffect, useState, useCallback } from 'react'

/**
 * useParallax Hook
 * Provides parallax offset values based on scroll position
 * 
 * @param {number} speed - Parallax speed multiplier (0.1 to 1)
 * @param {React.RefObject} ref - Reference to the element
 * @returns {number} offset - The calculated parallax offset
 */
export function useParallax(speed = 0.5, ref = null) {
    const [offset, setOffset] = useState(0)

    const handleScroll = useCallback(() => {
        if (ref?.current) {
            const rect = ref.current.getBoundingClientRect()
            const scrolled = window.scrollY
            const sectionTop = rect.top + scrolled
            const relativeScroll = scrolled - sectionTop
            setOffset(relativeScroll * speed)
        } else {
            setOffset(window.scrollY * speed)
        }
    }, [speed, ref])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    return offset
}

/**
 * useScrollProgress Hook
 * Returns scroll progress as a value between 0 and 1
 */
export function useScrollProgress() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const scrollProgress = docHeight > 0 ? scrollTop / docHeight : 0
            setProgress(Math.min(1, Math.max(0, scrollProgress)))
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return progress
}

export default useParallax
