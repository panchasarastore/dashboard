import { useAuth } from '@/contexts/AuthContext';
const MyComponent = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Please log in</div>;

    return <div>Welcome, {user.email}</div>;
};

export default MyComponent;