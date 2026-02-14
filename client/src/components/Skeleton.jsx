import './Skeleton.css'

function Skeleton({ type = 'text', width, height, className = '' }) {
    const style = {
        width,
        height
    }

    return (
        <div
            className={`skeleton skeleton-${type} ${className}`}
            style={style}
        ></div>
    )
}

export function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <Skeleton type="rect" height="200px" className="mb-4" />
            <Skeleton type="text" width="60%" height="20px" className="mb-2" />
            <Skeleton type="text" width="80%" height="24px" className="mb-4" />
            <Skeleton type="rect" width="100%" height="40px" />
        </div>
    )
}

export default Skeleton
