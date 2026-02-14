import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [admin, setAdmin] = useState(null)
    const [loading, setLoading] = useState(true)
    const [token, setToken] = useState(localStorage.getItem('admin-token'))

    // Verify token on mount
    useEffect(() => {
        if (token) {
            verifyToken()
        } else {
            setLoading(false)
        }
    }, [])

    const verifyToken = async () => {
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setAdmin(data.data.user)
            } else {
                logout()
            }
        } catch (error) {
            console.error('Token verification failed:', error)
            logout()
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Login failed')
            }

            setToken(data.data.token)
            setAdmin(data.data.admin)
            localStorage.setItem('admin-token', data.data.token)

            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
        } catch (error) {
            console.error('Logout error:', error)
        }

        setToken(null)
        setAdmin(null)
        localStorage.removeItem('admin-token')
    }

    const value = {
        admin,
        token,
        loading,
        isAuthenticated: !!admin,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext
