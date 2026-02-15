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
import ManageOrders from "./pages/ManageOrders";
import OrderDetails from "./pages/OrderDetails";
import NotFound from "./pages/NotFound";
import MyComponent from "./pages/test";

import DashboardLayout from "./components/layout/DashboardLayout";

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children ? <>{children}</> : null;
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

              {/* Dashboard Layout Group */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route path="products" element={<ManageProducts />} />
                <Route path="orders" element={<ManageOrders />} />
                <Route path="edit-product/:productId" element={<EditProduct />} />
                <Route path="orders/:orderId" element={<OrderDetails />} />
                <Route path="test" element={<MyComponent />} />
              </Route>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StoreProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
