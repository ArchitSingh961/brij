import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function AdminLogin() {
    const navigate = useNavigate()
    const { login, isAuthenticated } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Redirect if already logged in
    if (isAuthenticated) {
        navigate('/admin/dashboard')
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await login(email, password)

        if (result.success) {
            navigate('/admin/dashboard')
        } else {
            setError(result.error)
        }

        setLoading(false)
    }

    return (
        <div className="admin-login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo-icon">BN</div>
                        <h1>Admin Login</h1>
                        <p>Sign in to manage your store</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="alert-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
        .admin-login-page {
          min-height: calc(100vh - 140px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          padding: var(--space-4);
        }
        
        .login-card {
          width: 100%;
          max-width: 400px;
          background: var(--bg-card);
          padding: var(--space-8);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-lg);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }
        
        .login-header .logo-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
          color: white;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: var(--text-2xl);
          margin: 0 auto var(--space-4);
        }
        
        .login-header h1 {
          font-size: var(--text-2xl);
          margin-bottom: var(--space-2);
        }
        
        .login-header p {
          color: var(--text-secondary);
        }
        
        .alert-error {
          background: var(--error-light);
          color: var(--error);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          font-size: var(--text-sm);
        }
      `}</style>
        </div>
    )
}

export default AdminLogin
