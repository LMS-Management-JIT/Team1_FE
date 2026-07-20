import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../services/authService'
import { LoadingScreen } from './LoadingScreen'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return <LoadingScreen />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <>{children}</>
}

export default ProtectedRoute