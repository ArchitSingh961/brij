import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Home Page Tab Component for managing home page slots
function HomePageTab({ token }) {
    const [categories, setCategories] = useState([])
    const [allProducts, setAllProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    // Modal states
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [showProductModal, setShowProductModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '📦' })
    const [formError, setFormError] = useState('')

    useEffect(() => {
        fetchCategories()
        fetchAllProducts()
    }, [])

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (data.success) {
                setCategories(data.data.sort((a, b) => a.displayOrder - b.displayOrder))
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchAllProducts = async () => {
        try {
            const response = await fetch('/api/products/all?limit=200', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (data.success) {
                setAllProducts(data.data.filter(p => p.isActive !== false))
            }
        } catch (error) {
            console.error('Failed to fetch products:', error)
        }
    }

    const toggleShowOnHome = async (categoryId, currentValue) => {
        setSaving(true)
        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ showOnHome: !currentValue })
            })
            if (response.ok) {
                setCategories(prev => prev.map(c =>
                    c._id === categoryId ? { ...c, showOnHome: !currentValue } : c
                ))
                setMessage('Updated successfully!')
                setTimeout(() => setMessage(''), 2000)
            }
        } catch (error) {
            setMessage('Update failed')
        } finally {
            setSaving(false)
        }
    }

    const toggleSpecialSlot = async (categoryId, slotType) => {
        setSaving(true)
        const category = categories.find(c => c._id === categoryId)
        const isCurrentlySpecial = category?.isSpecialSlot && category?.slotType === slotType

        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    isSpecialSlot: !isCurrentlySpecial,
                    slotType: isCurrentlySpecial ? 'category' : slotType
                })
            })
            if (response.ok) {
                setCategories(prev => prev.map(c =>
                    c._id === categoryId ? {
                        ...c,
                        isSpecialSlot: !isCurrentlySpecial,
                        slotType: isCurrentlySpecial ? 'category' : slotType
                    } : c
                ))
                setMessage('Updated successfully!')
                setTimeout(() => setMessage(''), 2000)
            }
        } catch (error) {
            setMessage('Update failed')
        } finally {
            setSaving(false)
        }
    }

    const moveCategory = async (index, direction) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= categories.length) return

        const newCategories = [...categories]
        const temp = newCategories[index]
        newCategories[index] = newCategories[newIndex]
        newCategories[newIndex] = temp

        // Update display orders
        const updates = newCategories.map((cat, i) => ({
            id: cat._id,
            displayOrder: i
        }))

        setSaving(true)
        try {
            const response = await fetch('/api/categories/reorder', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ updates })
            })
            if (response.ok) {
                setCategories(newCategories.map((cat, i) => ({ ...cat, displayOrder: i })))
            }
        } catch (error) {
            console.error('Reorder failed:', error)
        } finally {
            setSaving(false)
        }
    }

    // Category CRUD
    const openCategoryModal = (category = null) => {
        if (category) {
            setEditingCategory(category)
            setCategoryForm({
                name: category.name,
                description: category.description || '',
                icon: category.icon || '📦'
            })
        } else {
            setEditingCategory(null)
            setCategoryForm({ name: '', description: '', icon: '📦' })
        }
        setFormError('')
        setShowCategoryModal(true)
    }

    const handleCategorySubmit = async (e) => {
        e.preventDefault()
        setFormError('')
        setSaving(true)

        try {
            const url = editingCategory
                ? `/api/categories/${editingCategory._id}`
                : '/api/categories'

            const response = await fetch(url, {
                method: editingCategory ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...categoryForm, showOnHome: true })
            })

            const data = await response.json()

            if (data.success) {
                setShowCategoryModal(false)
                fetchCategories()
                setMessage(editingCategory ? 'Category updated!' : 'Category created!')
                setTimeout(() => setMessage(''), 2000)
            } else {
                setFormError(data.error || 'Failed to save category')
            }
        } catch (error) {
            setFormError('Network error. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const deleteCategory = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return

        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                setCategories(prev => prev.filter(c => c._id !== categoryId))
                setMessage('Category deleted!')
                setTimeout(() => setMessage(''), 2000)
            }
        } catch (error) {
            setMessage('Delete failed')
        }
    }

    // Product assignment
    const openProductModal = (category) => {
        setSelectedCategory(category)
        setShowProductModal(true)
    }

    const assignProductToCategory = async (productId) => {
        if (!selectedCategory) return

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ category: selectedCategory.name })
            })

            if (response.ok) {
                setMessage(`Product assigned to ${selectedCategory.name}!`)
                setTimeout(() => setMessage(''), 2000)
                fetchAllProducts()
            }
        } catch (error) {
            setMessage('Assignment failed')
        }
    }

    if (loading) {
        return <div className="flex justify-center" style={{ padding: 'var(--space-16)' }}><div className="spinner"></div></div>
    }

    return (
        <>
            <div className="admin-header">
                <div>
                    <h2>Home Page Management</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>
                        Configure which categories appear on the home page and in what order
                    </p>
                </div>
            </div>

            {/* Action Buttons - Styled like reference image */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                padding: 'var(--space-4)',
                background: '#FFF8F0',
                borderRadius: 'var(--radius-xl)'
            }}>
                <button
                    onClick={() => openCategoryModal()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-3) var(--space-6)',
                        background: 'white',
                        border: '2px solid #F5A623',
                        borderRadius: '50px',
                        fontSize: 'var(--text-base)',
                        fontWeight: 600,
                        color: '#333',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(245, 166, 35, 0.15)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#FFF8F0'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                >
                    <span style={{ fontSize: '20px' }}>📁</span>
                    Manage Categories
                </button>
                <button
                    onClick={() => categories.length > 0 && openProductModal(categories[0])}
                    disabled={categories.length === 0}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-3) var(--space-6)',
                        background: 'linear-gradient(135deg, #F5A623 0%, #E8940C 100%)',
                        border: 'none',
                        borderRadius: '50px',
                        fontSize: 'var(--text-base)',
                        fontWeight: 600,
                        color: 'white',
                        cursor: categories.length > 0 ? 'pointer' : 'not-allowed',
                        opacity: categories.length > 0 ? 1 : 0.6,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(245, 166, 35, 0.3)'
                    }}
                    onMouseOver={(e) => categories.length > 0 && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    + Add Product
                </button>
            </div>

            {message && (
                <div className="alert-success" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                    {message}
                </div>
            )}

            <div className="homepage-slots-section">
                <h3 style={{ marginBottom: 'var(--space-4)' }}>📋 Home Page Sections</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    Use arrows to reorder. Toggle visibility to show/hide on home page.
                </p>

                <div className="homepage-slots-list">
                    {categories.map((category, index) => (
                        <div
                            key={category._id}
                            className="homepage-slot-card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 'var(--space-4)',
                                background: category.showOnHome ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--space-2)',
                                opacity: category.showOnHome ? 1 : 0.6
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <button
                                        onClick={() => moveCategory(index, 'up')}
                                        disabled={index === 0 || saving}
                                        className="btn btn-ghost btn-sm"
                                        style={{ padding: '2px 8px', fontSize: '14px' }}
                                    >↑</button>
                                    <button
                                        onClick={() => moveCategory(index, 'down')}
                                        disabled={index === categories.length - 1 || saving}
                                        className="btn btn-ghost btn-sm"
                                        style={{ padding: '2px 8px', fontSize: '14px' }}
                                    >↓</button>
                                </div>
                                <span style={{ fontSize: '24px' }}>{category.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{category.name}</div>
                                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                                        {category.isSpecialSlot ? (
                                            <span style={{ color: 'var(--primary-600)' }}>
                                                Special: Shows {category.slotType === 'bestseller' ? 'Best Sellers' : 'Palm Oil Free'} products
                                            </span>
                                        ) : (
                                            `Shows products from ${category.name} category`
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                {/* Edit & Delete */}
                                <button
                                    onClick={() => openCategoryModal(category)}
                                    className="btn btn-ghost btn-sm"
                                    title="Edit category"
                                >✏️</button>
                                <button
                                    onClick={() => openProductModal(category)}
                                    className="btn btn-ghost btn-sm"
                                    title="Add products to this category"
                                >➕</button>
                                <button
                                    onClick={() => deleteCategory(category._id)}
                                    className="btn btn-ghost btn-sm"
                                    style={{ color: 'var(--error)' }}
                                    title="Delete category"
                                >🗑️</button>

                                {/* Special Slot Options */}
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <button
                                        onClick={() => toggleSpecialSlot(category._id, 'bestseller')}
                                        className={`btn btn-sm ${category.isSpecialSlot && category.slotType === 'bestseller' ? 'btn-primary' : 'btn-ghost'}`}
                                        disabled={saving}
                                        title="Show Best Seller products"
                                    >
                                        ⭐ Best Sellers
                                    </button>
                                    <button
                                        onClick={() => toggleSpecialSlot(category._id, 'palmOilFree')}
                                        className={`btn btn-sm ${category.isSpecialSlot && category.slotType === 'palmOilFree' ? 'btn-primary' : 'btn-ghost'}`}
                                        disabled={saving}
                                        title="Show Palm Oil Free products"
                                    >
                                        🌿 Palm Oil Free
                                    </button>
                                </div>

                                {/* Show on Home Toggle */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={category.showOnHome}
                                        onChange={() => toggleShowOnHome(category._id, category.showOnHome)}
                                        disabled={saving}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span style={{ fontSize: 'var(--text-sm)' }}>Show on Home</span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                {categories.length === 0 && (
                    <div className="empty-state" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                        <p>No categories yet. Click "Manage Categories" to create your first home page category.</p>
                    </div>
                )}
            </div>

            <div className="homepage-info" style={{ marginTop: 'var(--space-8)', padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ marginBottom: 'var(--space-2)' }}>💡 How Special Slots Work</h4>
                <ul style={{ color: 'var(--text-secondary)', marginLeft: 'var(--space-4)' }}>
                    <li><strong>Best Sellers:</strong> Enables this slot to show all products marked as "Best Seller" across all categories</li>
                    <li><strong>Palm Oil Free:</strong> Shows all products marked as "Palm Oil Free" across all categories</li>
                    <li>Click the button again to disable special slot mode and show products from the category itself</li>
                </ul>
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingCategory ? 'Edit Category' : 'Create Home Page Category'}</h3>
                            <button className="modal-close" onClick={() => setShowCategoryModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCategorySubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Category Name *</label>
                                    <input
                                        type="text"
                                        value={categoryForm.name}
                                        onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        placeholder="e.g., Best Sellers, New Arrivals"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={categoryForm.description}
                                        onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                                        rows={2}
                                        placeholder="Brief description for this section"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Icon (emoji)</label>
                                    <input
                                        type="text"
                                        value={categoryForm.icon}
                                        onChange={e => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                                        placeholder="📦"
                                        style={{ width: '80px', textAlign: 'center', fontSize: '24px' }}
                                    />
                                </div>
                                {formError && <div className="alert-error" style={{ marginBottom: 'var(--space-4)' }}>{formError}</div>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Product Selector Modal */}
            {showProductModal && selectedCategory && (
                <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden' }}>
                        <div className="modal-header">
                            <h3>Add Products to "{selectedCategory.name}"</h3>
                            <button className="modal-close" onClick={() => setShowProductModal(false)}>×</button>
                        </div>

                        {/* Category Selector */}
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>Select Category:</label>
                            <select
                                value={selectedCategory._id}
                                onChange={e => setSelectedCategory(categories.find(c => c._id === e.target.value))}
                                style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
                            >
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                                Click on a product to assign it to this category:
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
                                {allProducts.map(product => (
                                    <div
                                        key={product._id}
                                        onClick={() => assignProductToCategory(product._id)}
                                        style={{
                                            padding: 'var(--space-3)',
                                            border: product.category === selectedCategory.name
                                                ? '2px solid var(--primary-600)'
                                                : '1px solid var(--border-light)',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            background: product.category === selectedCategory.name ? 'var(--primary-50)' : 'white'
                                        }}
                                    >
                                        {product.images?.[0] && (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-2)' }}
                                            />
                                        )}
                                        <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{product.name}</div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                            {product.category || 'Uncategorized'}
                                        </div>
                                        {product.category === selectedCategory.name && (
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-600)', fontWeight: 600 }}>
                                                ✓ In this category
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-actions" style={{ marginTop: 'var(--space-4)' }}>
                            <button className="btn btn-primary" onClick={() => setShowProductModal(false)}>Done</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function SettingsTab({ token }) {
    const [catalogueInfo, setCatalogueInfo] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState('')
    const fileInputRef = useRef(null)

    useEffect(() => {
        fetchCatalogueInfo()
    }, [])

    const fetchCatalogueInfo = async () => {
        try {
            const response = await fetch('/api/settings')
            const data = await response.json()
            if (data.success) {
                setCatalogueInfo(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch catalogue info:', error)
        }
    }

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.type !== 'application/pdf') {
            setMessage('Only PDF files are allowed')
            return
        }

        setUploading(true)
        setMessage('')

        const formData = new FormData()
        formData.append('catalogue', file)

        try {
            const response = await fetch('/api/settings/catalogue', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            })
            const data = await response.json()
            if (data.success) {
                setMessage('Catalogue uploaded successfully!')
                fetchCatalogueInfo()
            } else {
                setMessage(data.error || 'Upload failed')
            }
        } catch (error) {
            setMessage('Upload failed: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete the catalogue?')) return

        try {
            const response = await fetch('/api/settings/catalogue', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (data.success) {
                setMessage('Catalogue deleted')
                setCatalogueInfo({ ...catalogueInfo, hasCatalogue: false, catalogueFileName: null })
            }
        } catch (error) {
            setMessage('Delete failed: ' + error.message)
        }
    }

    return (
        <>
            <div className="admin-header">
                <h2>Settings</h2>
            </div>

            <div className="settings-section">
                <h3 style={{ marginBottom: 'var(--space-4)' }}>📥 Product Catalogue (PDF)</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    Upload a PDF catalogue that customers can download from the Products page.
                </p>

                {message && (
                    <div className={message.includes('success') ? 'alert-success' : 'alert-info'} style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                        {message}
                    </div>
                )}

                {catalogueInfo?.hasCatalogue ? (
                    <div className="catalogue-info" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
                        <p><strong>Current File:</strong> {catalogueInfo.catalogueFileName}</p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                            Uploaded: {new Date(catalogueInfo.catalogueUploadedAt).toLocaleDateString()}
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => window.open('/api/settings/catalogue/download', '_blank')}
                            >
                                Preview
                            </button>
                            <button
                                className="btn btn-ghost"
                                style={{ color: 'var(--error)' }}
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                        No catalogue uploaded yet.
                    </p>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    accept=".pdf"
                    style={{ display: 'none' }}
                />
                <button
                    className="btn btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : (catalogueInfo?.hasCatalogue ? 'Replace Catalogue' : 'Upload Catalogue')}
                </button>
            </div>

            <div className="settings-section" style={{ marginTop: 'var(--space-8)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>🏠 Home Page Settings</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Use the <strong>Home Page</strong> tab in the sidebar to manage which sections appear on the home page, their order, and special slots like "Best Sellers" or "Palm Oil Free".
                </p>
            </div>
        </>
    )
}

function BlogsTab({ token }) {
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingBlog, setEditingBlog] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'Recipes',
        author: 'Admin',
        readTime: '5 min read',
        isActive: true
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef(null)

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        try {
            const response = await fetch('/api/blogs/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (data.success) {
                setBlogs(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch blogs:', error)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            category: 'Recipes',
            author: 'Admin',
            readTime: '5 min read',
            isActive: true
        })
        setImageFile(null)
        setImagePreview(null)
        setEditingBlog(null)
        setError('')
    }

    const openModal = (blog = null) => {
        if (blog) {
            setEditingBlog(blog)
            setFormData({
                title: blog.title,
                excerpt: blog.excerpt,
                content: blog.content,
                category: blog.category,
                author: blog.author,
                readTime: blog.readTime,
                isActive: blog.isActive
            })
            setImagePreview(blog.image)
        } else {
            resetForm()
        }
        setShowModal(true)
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB')
                return
            }
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            const data = new FormData()
            Object.keys(formData).forEach(key => data.append(key, formData[key]))
            if (imageFile) {
                data.append('image', imageFile)
            }

            const url = editingBlog ? `/api/blogs/${editingBlog._id}` : '/api/blogs'
            const method = editingBlog ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            })

            const result = await response.json()
            if (result.success) {
                setShowModal(false)
                fetchBlogs()
                resetForm()
            } else {
                setError(result.error || 'Failed to save blog')
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog post?')) return

        try {
            const response = await fetch(`/api/blogs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                setBlogs(prev => prev.filter(b => b._id !== id))
            }
        } catch (err) {
            alert('Failed to delete blog')
        }
    }

    if (loading) return <div className="spinner"></div>

    return (
        <div className="blogs-tab">
            <div className="admin-header">
                <div>
                    <h2>Blog Management</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your blog posts</p>
                </div>
                <button onClick={() => openModal()} className="btn btn-primary">+ New Post</button>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {blogs.map(blog => (
                        <tr key={blog._id}>
                            <td>
                                <img src={blog.image} alt={blog.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            </td>
                            <td>
                                <div style={{ fontWeight: 500 }}>{blog.title}</div>
                                <div style={{ fontSize: '12px', color: 'gray' }}>{blog.author}</div>
                            </td>
                            <td><span className="badge badge-info">{blog.category}</span></td>
                            <td>
                                <span className={`badge badge-${blog.isActive ? 'success' : 'warning'}`}>
                                    {blog.isActive ? 'Published' : 'Draft'}
                                </span>
                            </td>
                            <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button onClick={() => openModal(blog)} className="btn btn-ghost btn-sm">Edit</button>
                                <button onClick={() => handleDelete(blog._id)} className="btn btn-ghost btn-sm" style={{ color: 'red' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3>{editingBlog ? 'Edit Post' : 'New Post'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                                    <div>
                                        <div className="form-group">
                                            <label>Title</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Excerpt (Short Description)</label>
                                            <textarea
                                                className="form-input"
                                                rows="3"
                                                value={formData.excerpt}
                                                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Content (Markdown Supported)</label>
                                            <textarea
                                                className="form-input"
                                                rows="10"
                                                value={formData.content}
                                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                                required
                                                style={{ fontFamily: 'monospace' }}
                                            />
                                            <p className="form-hint">Use ## for headings, **bold** for text, - for lists</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="form-group">
                                            <label>Category</label>
                                            <select
                                                className="form-input"
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                {['Recipes', 'Culture', 'Health', 'News', 'Other'].map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Read Time</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={formData.readTime}
                                                onChange={e => setFormData({ ...formData, readTime: e.target.value })}
                                                placeholder="e.g. 5 min read"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Author</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={formData.author}
                                                onChange={e => setFormData({ ...formData, author: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Image</label>
                                            <div className="image-upload-area" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', minHeight: '150px' }}>
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <span>Click to Upload</span>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                                />
                                                <span>Publish Immediately</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {error && <div className="alert-error">{error}</div>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function AdminDashboard() {
    const navigate = useNavigate()
    const { admin, token, isAuthenticated, loading: authLoading, logout } = useAuth()
    const [activeTab, setActiveTab] = useState('overview')
    const [stats, setStats] = useState({ totalOrders: 0, todayOrders: 0, pendingOrders: 0, totalRevenue: 0 })
    const [orders, setOrders] = useState([])
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal states
    const [showProductModal, setShowProductModal] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [editingCategory, setEditingCategory] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)

    // Form states - simplified (removed price, weight, stock)
    const [productForm, setProductForm] = useState({
        name: '', description: '', category: '', isActive: true, isBestSeller: false, isPalmOilFree: false
    })
    const [imageFiles, setImageFiles] = useState([])
    const [imagePreviews, setImagePreviews] = useState([])
    const fileInputRef = useRef(null)

    const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '📦', showOnHome: true })
    const [deleteType, setDeleteType] = useState(null) // 'product' or 'category'
    const [formError, setFormError] = useState('')
    const [formLoading, setFormLoading] = useState(false)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/admin/login')
        }
    }, [authLoading, isAuthenticated, navigate])

    useEffect(() => {
        if (token) {
            fetchData()
        }
    }, [token, activeTab])

    const fetchData = async () => {
        setLoading(true)
        try {
            const headers = { 'Authorization': `Bearer ${token}` }

            // Fetch stats
            const statsRes = await fetch('/api/orders/stats/summary', { headers })
            if (statsRes.ok) {
                const statsData = await statsRes.json()
                setStats(statsData.data)
            }

            // Fetch orders
            const ordersRes = await fetch('/api/orders?limit=10', { headers })
            if (ordersRes.ok) {
                const ordersData = await ordersRes.json()
                setOrders(ordersData.data || [])
            }

            // Fetch products - filter to only show active ones
            const productsRes = await fetch('/api/products/all?limit=50', { headers })
            if (productsRes.ok) {
                const productsData = await productsRes.json()
                // Filter to show only active products in the UI
                setProducts((productsData.data || []).filter(p => p.isActive !== false))
            }

            // Fetch categories - filter to only show active ones
            const categoriesRes = await fetch('/api/categories/all', { headers })
            if (categoriesRes.ok) {
                const categoriesData = await categoriesRes.json()
                // Filter to show only active categories in the UI
                setCategories((categoriesData.data || []).filter(c => c.isActive !== false))
            }
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (orderId, status) => {
        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            })

            if (response.ok) {
                fetchData()
            }
        } catch (error) {
            console.error('Failed to update status:', error)
        }
    }

    // =========== PRODUCT CRUD ===========
    const openProductModal = (product = null) => {
        if (product) {
            setEditingProduct(product)
            setProductForm({
                name: product.name,
                description: product.description,
                category: product.category,
                isActive: product.isActive !== false,
                isBestSeller: product.isBestSeller || false,
                isPalmOilFree: product.isPalmOilFree || false
            })
            // Load existing images as previews
            const existingImages = product.images && product.images.length > 0
                ? product.images
                : (product.image ? [product.image] : [])
            setImagePreviews(existingImages)
        } else {
            setEditingProduct(null)
            setProductForm({
                name: '', description: '', category: categories[0]?.name || '', isActive: true, isBestSeller: false, isPalmOilFree: false
            })
            setImagePreviews([])
        }
        setImageFiles([])
        setFormError('')
        setShowProductModal(true)
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files)
        if (files.length > 0) {
            // Only allow 1 image - replace any existing
            const selectedFile = files[0]
            setImageFiles([selectedFile])

            // Create preview URL for the single file
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreviews([reader.result])
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    const removeImage = () => {
        // Clear all image state
        setImageFiles([])
        setImagePreviews([])
    }

    const handleProductSubmit = async (e) => {
        e.preventDefault()
        setFormError('')
        setFormLoading(true)

        try {
            const url = editingProduct
                ? `/api/products/${editingProduct._id}`
                : '/api/products'

            // Use FormData for file upload
            const formData = new FormData()
            formData.append('name', productForm.name)
            formData.append('description', productForm.description)
            formData.append('category', productForm.category)
            formData.append('isActive', productForm.isActive)
            formData.append('isBestSeller', productForm.isBestSeller)
            formData.append('isPalmOilFree', productForm.isPalmOilFree)

            // For editing: separate existing images (URLs) from new file uploads
            if (editingProduct) {
                // Existing images are URLs (start with /uploads/ or http)
                const existingImages = imagePreviews.filter(img =>
                    typeof img === 'string' && (img.startsWith('/uploads/') || img.startsWith('http'))
                )
                formData.append('existingImages', JSON.stringify(existingImages))
            }

            // Append only new file uploads
            imageFiles.forEach(file => {
                formData.append('images', file)
            })

            const response = await fetch(url, {
                method: editingProduct ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            const data = await response.json()

            if (data.success) {
                setShowProductModal(false)
                setImageFile(null)
                setImagePreview('')
                fetchData()
            } else {
                setFormError(data.error || 'Failed to save product')
            }
        } catch (error) {
            setFormError('Network error. Please try again.')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return

        try {
            const endpoint = deleteType === 'category'
                ? `/api/categories/${deleteTarget._id}`
                : `/api/products/${deleteTarget._id}`

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                // Immediately remove from state for instant UI feedback
                if (deleteType === 'category') {
                    setCategories(prev => prev.filter(c => c._id !== deleteTarget._id))
                } else {
                    setProducts(prev => prev.filter(p => p._id !== deleteTarget._id))
                }
                setShowDeleteConfirm(false)
                setDeleteTarget(null)
                setDeleteType(null)
            }
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    const openDeleteConfirm = (item, type) => {
        setDeleteTarget(item)
        setDeleteType(type)
        setShowDeleteConfirm(true)
    }

    // =========== CATEGORY CRUD ===========
    const openCategoryModal = (category = null) => {
        if (category) {
            setEditingCategory(category)
            setCategoryForm({
                name: category.name,
                description: category.description || '',
                icon: category.icon || '📦',
                showOnHome: category.showOnHome !== false
            })
        } else {
            setEditingCategory(null)
            setCategoryForm({ name: '', description: '', icon: '📦', showOnHome: true })
        }
        setFormError('')
        setShowCategoryModal(true)
    }

    const handleCategorySubmit = async (e) => {
        e.preventDefault()
        setFormError('')
        setFormLoading(true)

        try {
            const url = editingCategory
                ? `/api/categories/${editingCategory._id}`
                : '/api/categories'

            const response = await fetch(url, {
                method: editingCategory ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(categoryForm)
            })

            const data = await response.json()

            if (data.success) {
                setShowCategoryModal(false)
                fetchData()
            } else {
                setFormError(data.error || 'Failed to save category')
            }
        } catch (error) {
            setFormError('Network error. Please try again.')
        } finally {
            setFormLoading(false)
        }
    }

    // Move category up in display order
    const moveCategoryUp = async (index) => {
        if (index === 0) return
        const newCategories = [...categories]
            ;[newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]]

        // Update display orders
        const reorderData = newCategories.map((cat, i) => ({ id: cat._id, displayOrder: i }))

        try {
            await fetch('/api/categories/reorder', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ categories: reorderData })
            })
            setCategories(newCategories)
        } catch (error) {
            console.error('Failed to reorder:', error)
        }
    }

    // Move category down in display order
    const moveCategoryDown = async (index) => {
        if (index === categories.length - 1) return
        const newCategories = [...categories]
            ;[newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]]

        // Update display orders
        const reorderData = newCategories.map((cat, i) => ({ id: cat._id, displayOrder: i }))

        try {
            await fetch('/api/categories/reorder', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ categories: reorderData })
            })
            setCategories(newCategories)
        } catch (error) {
            console.error('Failed to reorder:', error)
        }
    }

    if (authLoading) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-layout">
                {/* Sidebar */}
                <aside className="admin-sidebar">
                    <div style={{ marginBottom: 'var(--space-8)' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
                            {admin?.name || 'Admin'}
                        </h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                            {admin?.email}
                        </p>
                    </div>

                    <nav className="admin-nav">
                        <button
                            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            📊 Overview
                        </button>
                        <button
                            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            📦 Orders
                        </button>
                        <button
                            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => setActiveTab('products')}
                        >
                            🍿 Products
                        </button>
                        <button
                            className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
                            onClick={() => setActiveTab('categories')}
                        >
                            📂 Categories
                        </button>
                        <button
                            className={`admin-nav-item ${activeTab === 'blogs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('blogs')}
                        >
                            📝 Blogs
                        </button>
                        <button
                            className={`admin-nav-item ${activeTab === 'homepage' ? 'active' : ''}`}
                            onClick={() => setActiveTab('homepage')}
                        >
                            🏠 Home Page
                        </button>
                        <button
                            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            ⚙️ Settings
                        </button>
                    </nav>

                    <button
                        onClick={logout}
                        className="btn btn-ghost"
                        style={{ marginTop: 'auto', width: '100%', justifyContent: 'flex-start', color: 'var(--error)' }}
                    >
                        🚪 Logout
                    </button>
                </aside>

                {/* Main Content */}
                <main className="admin-content">
                    {loading ? (
                        <div className="flex justify-center" style={{ padding: 'var(--space-16)' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <>
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <>
                                    <h2 style={{ marginBottom: 'var(--space-6)' }}>Dashboard Overview</h2>

                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-icon orders">📦</div>
                                            <div className="stat-value">{stats.totalOrders}</div>
                                            <div className="stat-label">Total Orders</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon revenue">💰</div>
                                            <div className="stat-value">₹{stats.totalRevenue?.toLocaleString()}</div>
                                            <div className="stat-label">Total Revenue</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon pending">⏳</div>
                                            <div className="stat-value">{stats.pendingOrders}</div>
                                            <div className="stat-label">Pending Orders</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon products">🍿</div>
                                            <div className="stat-value">{products.length}</div>
                                            <div className="stat-label">Products</div>
                                        </div>
                                    </div>

                                    <h3 style={{ margin: 'var(--space-8) 0 var(--space-4)' }}>Recent Orders</h3>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Order #</th>
                                                <th>Customer</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.slice(0, 5).map(order => (
                                                <tr key={order._id}>
                                                    <td>{order.orderNumber}</td>
                                                    <td>{order.customerName}</td>
                                                    <td>₹{order.total?.toFixed(2)}</td>
                                                    <td>
                                                        <span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'warning' : 'primary'}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <>
                                    <div className="admin-header">
                                        <h2>Orders</h2>
                                        <button onClick={fetchData} className="btn btn-secondary">Refresh</button>
                                    </div>

                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Order #</th>
                                                <th>Customer</th>
                                                <th>Email</th>
                                                <th>Total</th>
                                                <th>Payment</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order._id}>
                                                    <td>{order.orderNumber}</td>
                                                    <td>{order.customerName}</td>
                                                    <td>{order.customerEmail}</td>
                                                    <td>₹{order.total?.toFixed(2)}</td>
                                                    <td>
                                                        <span className={`badge badge-${order.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                                                            {order.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                            className="form-input"
                                                            style={{ padding: 'var(--space-2)', width: 'auto' }}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="confirmed">Confirmed</option>
                                                            <option value="processing">Processing</option>
                                                            <option value="shipped">Shipped</option>
                                                            <option value="delivered">Delivered</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-ghost btn-sm">View</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            {/* Products Tab */}
                            {activeTab === 'products' && (
                                <>
                                    <div className="admin-header">
                                        <h2>Products</h2>
                                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                            <button onClick={() => setActiveTab('categories')} className="btn btn-secondary">
                                                📂 Manage Categories
                                            </button>
                                            <button onClick={() => openProductModal()} className="btn btn-primary">
                                                + Add Product
                                            </button>
                                        </div>
                                    </div>

                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Image</th>
                                                <th>Name</th>
                                                <th>Category</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(product => (
                                                <tr key={product._id}>
                                                    <td>
                                                        <img
                                                            src={product.image || 'https://via.placeholder.com/50'}
                                                            alt={product.name}
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                                                        />
                                                    </td>
                                                    <td>{product.name}</td>
                                                    <td>{product.category}</td>
                                                    <td>
                                                        <span className={`badge badge-${product.isActive ? 'success' : 'error'}`}>
                                                            {product.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                            <button
                                                                onClick={() => openProductModal(product)}
                                                                className="btn btn-ghost btn-sm"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteConfirm(product, 'product')}
                                                                className="btn btn-ghost btn-sm"
                                                                style={{ color: 'var(--error)' }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            {/* Categories Tab */}
                            {activeTab === 'categories' && (
                                <>
                                    <div className="admin-header">
                                        <div>
                                            <h2>Categories</h2>
                                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                                                Use arrows to change display order on home page
                                            </p>
                                        </div>
                                        <button onClick={() => openCategoryModal()} className="btn btn-primary">
                                            + Add Category
                                        </button>
                                    </div>

                                    <div className="categories-list">
                                        {categories.map((category, index) => (
                                            <div key={category._id} className="category-card-row">
                                                <div className="category-order-controls">
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => moveCategoryUp(index)}
                                                        disabled={index === 0}
                                                        title="Move up"
                                                    >
                                                        ↑
                                                    </button>
                                                    <span className="order-number">{index + 1}</span>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => moveCategoryDown(index)}
                                                        disabled={index === categories.length - 1}
                                                        title="Move down"
                                                    >
                                                        ↓
                                                    </button>
                                                </div>
                                                <div className="category-icon">{category.icon}</div>
                                                <div className="category-info">
                                                    <h3>
                                                        {category.name}
                                                        {category.showOnHome !== false && (
                                                            <span className="badge badge-success" style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                                                                Home
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p>{category.description || 'No description'}</p>
                                                </div>
                                                <div className="category-actions">
                                                    <button
                                                        onClick={() => openCategoryModal(category)}
                                                        className="btn btn-ghost btn-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteConfirm(category, 'category')}
                                                        className="btn btn-ghost btn-sm"
                                                        style={{ color: 'var(--error)' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {categories.length === 0 && (
                                            <div className="empty-state">
                                                <p>No categories yet. Add your first category!</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Home Page Tab */}
                            {activeTab === 'homepage' && (
                                <HomePageTab token={token} />
                            )}

                            {/* Settings Tab */}
                            {activeTab === 'settings' && (
                                <SettingsTab token={token} />
                            )}

                            {/* Blogs Tab */}
                            {activeTab === 'blogs' && (
                                <BlogsTab token={token} />
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Product Modal - Simplified with Image Upload */}
            {showProductModal && (
                <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            <button className="modal-close" onClick={() => setShowProductModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleProductSubmit}>
                            <div className="modal-body">
                                {formError && <div className="alert-error">{formError}</div>}

                                <div className="form-group">
                                    <label className="form-label">Product Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={productForm.name}
                                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                        required
                                        placeholder="e.g., Masala Namkeen"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description *</label>
                                    <textarea
                                        className="form-input"
                                        rows="3"
                                        value={productForm.description}
                                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                        required
                                        placeholder="Describe the product..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select
                                        className="form-input"
                                        value={productForm.category}
                                        onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Image Upload - Single */}
                                <div className="form-group">
                                    <label className="form-label">Product Image</label>
                                    <div className="image-upload-area">
                                        {imagePreviews.length > 0 && (
                                            <div className="image-preview-grid" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="image-preview-item" style={{ position: 'relative' }}>
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage()}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '-8px',
                                                                right: '-8px',
                                                                width: '24px',
                                                                height: '24px',
                                                                borderRadius: '50%',
                                                                background: 'var(--error)',
                                                                color: 'white',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: '14px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            style={{ display: 'none' }}
                                        />
                                        {imagePreviews.length === 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Upload Image
                                            </button>
                                        )}
                                        <p className="form-hint">Max 5MB. Supported: JPG, PNG, GIF, WebP</p>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={productForm.isActive}
                                            onChange={e => setProductForm({ ...productForm, isActive: e.target.checked })}
                                        />
                                        <span>Product is active</span>
                                    </label>
                                </div>

                                <div className="form-group" style={{ marginTop: 'var(--space-2)' }}>
                                    <label className="form-label">Product Tags</label>
                                    <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                                        <label className="form-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={productForm.isBestSeller}
                                                onChange={e => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                                            />
                                            <span>⭐ Best Seller</span>
                                        </label>
                                        <label className="form-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={productForm.isPalmOilFree}
                                                onChange={e => setProductForm({ ...productForm, isPalmOilFree: e.target.checked })}
                                            />
                                            <span>🌿 Palm Oil Free</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                                    {formLoading ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Add Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }

            {/* Category Modal */}
            {
                showCategoryModal && (
                    <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                                </h3>
                                <button className="modal-close" onClick={() => setShowCategoryModal(false)}>✕</button>
                            </div>
                            <form onSubmit={handleCategorySubmit}>
                                <div className="modal-body">
                                    {formError && <div className="alert-error">{formError}</div>}

                                    <div className="form-group">
                                        <label className="form-label">Category Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={categoryForm.name}
                                            onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                            required
                                            placeholder="e.g., Namkeen, Sweets, Snacks"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-input"
                                            rows="2"
                                            value={categoryForm.description}
                                            onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                            placeholder="Optional description"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Icon (emoji)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={categoryForm.icon}
                                            onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                                            placeholder="📦"
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={formLoading}>
                                        {formLoading ? 'Saving...' : (editingCategory ? 'Save Changes' : 'Add Category')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                showDeleteConfirm && (
                    <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                            <div className="modal-header">
                                <h3 className="modal-title">Confirm Delete</h3>
                                <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</p>
                                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleDelete} style={{ background: 'var(--error)' }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                .admin-dashboard {
                    min-height: calc(100vh - 140px);
                }
                
                .categories-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: var(--space-4);
                }
                
                .category-card {
                    background: var(--bg-card);
                    border-radius: var(--radius-xl);
                    padding: var(--space-5);
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                    box-shadow: var(--shadow-sm);
                }
                
                .category-icon {
                    font-size: 2rem;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--primary-50);
                    border-radius: var(--radius-lg);
                }
                
                .category-info {
                    flex: 1;
                }
                
                .category-info h3 {
                    font-size: var(--text-lg);
                    font-weight: 600;
                    margin-bottom: var(--space-1);
                }
                
                .category-info p {
                    font-size: var(--text-sm);
                    color: var(--text-secondary);
                }
                
                .category-actions {
                    display: flex;
                    gap: var(--space-2);
                }
                
                .form-checkbox {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    cursor: pointer;
                }
                
                .form-checkbox input {
                    width: 18px;
                    height: 18px;
                }
                
                .alert-error {
                    background: var(--error-light);
                    color: var(--error);
                    padding: var(--space-3);
                    border-radius: var(--radius-md);
                    margin-bottom: var(--space-4);
                    font-size: var(--text-sm);
                }
                
                textarea.form-input {
                    resize: vertical;
                    min-height: 80px;
                }
                
                .image-upload-area {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-4);
                    border: 2px dashed var(--border-color);
                    border-radius: var(--radius-lg);
                    background: var(--bg-tertiary);
                }
                
                .image-preview {
                    width: 150px;
                    height: 150px;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }
                
                .image-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .form-hint {
                    font-size: var(--text-xs);
                    color: var(--text-tertiary);
                    margin: 0;
                }
            `}</style>
        </div >
    )
}

export default AdminDashboard
