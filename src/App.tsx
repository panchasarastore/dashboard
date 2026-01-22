import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { StoreProvider } from "./contexts/StoreContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import AddProduct from "./pages/AddProduct";
import ManageProducts from "./pages/ManageProducts";
import EditProduct from "./pages/EditProduct";
import OrderDetails from "./pages/OrderDetails";
import NotFound from "./pages/NotFound";
import MyComponent from "./pages/test";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StoreProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><ManageProducts /></ProtectedRoute>} />
              <Route path="/edit-product/:productId" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
              <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
              <Route path="/test" element={<ProtectedRoute><MyComponent /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StoreProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
