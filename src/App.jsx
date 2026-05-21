import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';
import OrderTracker from './pages/OrderTracker';

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/restaurant/:id/menu" element={<Menu />} />
            <Route path="/checkout" element={
              <ProtectedRoute allowedRole="customer">
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/order-tracker/:orderId" element={
              <ProtectedRoute allowedRole="customer">
                <OrderTracker />
              </ProtectedRoute>
            } />
            <Route path="/customer-dashboard" element={
              <ProtectedRoute allowedRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/restaurant-dashboard" element={
              <ProtectedRoute allowedRole="restaurant">
                <RestaurantDashboard />
              </ProtectedRoute>
            } />
          </Routes>
          <CartDrawer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
