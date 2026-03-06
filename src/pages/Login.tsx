import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await signOut();
            toast.success('Signed out successfully');
        } catch (error: any) {
            toast.error(error.message || 'Error signing out');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            toast.success('Logged in successfully');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Error logging in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <img
                            src="https://pnsara.store/logo_pnsara.png"
                            alt="Panchasara Logo"
                            className="h-12 w-auto"
                            onError={(e) => {
                                // Fallback if the absolute URL fails for some reason
                                (e.target as HTMLImageElement).src = '/favicon.svg';
                            }}
                        />
                    </div>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>Enter your email and password to access the dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    {user ? (
                        <div className="space-y-4">
                            <div className="p-3 bg-muted rounded-md text-sm">
                                Signed in as: <span className="font-medium text-primary">{user.email}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button className="flex-1" variant="outline" onClick={() => navigate('/dashboard')}>
                                    Go to Dashboard
                                </Button>
                                <Button className="flex-1" variant="destructive" onClick={handleSignOut} disabled={loading}>
                                    {loading ? 'Signing out...' : 'Sign Out'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
