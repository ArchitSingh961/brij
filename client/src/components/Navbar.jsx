import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    return (
        <header className="navbar">
            <div className="container">
                <div className="navbar-content">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo" onClick={closeMenu}>
                        <img src="/logo.png" alt="Brij Namkeen" className="logo-image" />
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="search-bar-desktop">
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const query = e.target.search.value
                            if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query)}`
                        }} style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="text"
                                name="search"
                                placeholder="Search snacks..."
                                className="search-input"
                            />
                            <button type="submit" className="search-btn" aria-label="Search">
                                🔍
                            </button>
                        </form>
                    </div>

                    {/* Navigation Links */}
                    <nav className={`navbar-nav ${isMenuOpen ? 'active' : ''}`}>
                        <div className="mobile-search">
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                const query = e.target.mobileSearch.value
                                if (query.trim()) {
                                    window.location.href = `/search?q=${encodeURIComponent(query)}`
                                    closeMenu()
                                }
                            }}>
                                <input
                                    type="text"
                                    name="mobileSearch"
                                    placeholder="Search..."
                                    className="search-input-mobile"
                                />
                            </form>
                        </div>
                        <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
                        <Link to="/blogs" className="nav-link" onClick={closeMenu}>Blogs</Link>
                        <a href="/api/settings/catalogue/download" className="nav-link" onClick={closeMenu} target="_blank" rel="noopener noreferrer">Catalogue</a>
                        <Link to="/about" className="nav-link" onClick={closeMenu}>About Us</Link>
                        <Link to="/contact" className="nav-link" onClick={closeMenu}>Contact</Link>
                    </nav>

                    {/* Mobile Menu Button - unchanged */}
                    <button
                        className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
                        aria-label="Menu"
                        onClick={toggleMenu}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {isMenuOpen ? (
                                <path d="M6 6l12 12M6 18L18 6"></path>
                            ) : (
                                <path d="M3 12h18M3 6h18M3 18h18"></path>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
        </header>
    )
}

export default Navbar
