import { Navigate } from 'react-router-dom'
import { useAuth } from '../../services/authService'
import { LoadingScreen } from './LoadingScreen';

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return <LoadingScreen />
    }
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
}

export default PublicRoute