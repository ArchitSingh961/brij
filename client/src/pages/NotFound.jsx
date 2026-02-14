import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import './NotFound.css'

function NotFound() {
    return (
        <div className="not-found-page">
            <Helmet>
                <title>Page Not Found - Brij Namkeen</title>
                <meta name="robots" content="noindex" />
            </Helmet>

            <div className="container">
                <div className="not-found-content">
                    <div className="error-code">404</div>
                    <div className="error-icon">🥨</div>
                    <h1 className="error-title">Oops! This page was eaten.</h1>
                    <p className="error-message">
                        The page you are looking for might have been removed, had its name changed,
                        or was just too delicious and got finished.
                    </p>
                    <Link to="/" className="btn btn-primary btn-lg">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default NotFound
