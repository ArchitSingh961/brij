import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { HelmetProvider } from 'react-helmet-async'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Search from './pages/Search'
import ProductDetail from './pages/ProductDetail'
import AboutUs from './pages/AboutUs'
import Contact from './pages/Contact'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import NotFound from './pages/NotFound'
import Blogs from './pages/Blogs'
import BlogDetail from './pages/BlogDetail'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import './App.css'

function App() {
    return (
        <BrowserRouter>
            <HelmetProvider>
                <ScrollToTop />
                <AuthProvider>
                    <Routes>
                        {/* Admin Routes - No Navbar/Footer */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />

                        {/* Public Routes - With Navbar/Footer */}
                        <Route path="/*" element={
                            <div className="app">
                                <Navbar />
                                <main className="main-content">
                                    <Routes>
                                        <Route index element={<Home />} />
                                        <Route path="/search" element={<Search />} />

                                        <Route path="/products/:id" element={<ProductDetail />} />
                                        <Route path="/blogs" element={<Blogs />} />
                                        <Route path="/blogs/:id" element={<BlogDetail />} />
                                        <Route path="/about" element={<AboutUs />} />
                                        <Route path="/contact" element={<Contact />} />
                                        <Route path="/terms" element={<TermsOfService />} />
                                        <Route path="/privacy" element={<PrivacyPolicy />} />
                                        <Route path="*" element={<NotFound />} />
                                    </Routes>
                                </main>
                                <Footer />
                            </div>
                        } />
                    </Routes>
                </AuthProvider>
            </HelmetProvider>
        </BrowserRouter>
    )
}

export default App
