import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  ShoppingBag, 
  CheckCircle2, 
  Truck, 
  Utensils, 
  AlertTriangle, 
  Loader2, 
  Sparkles, 
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';

const OrderTracker = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Order Details
  const fetchOrderDetails = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('You must be logged in to view order details.');
      }
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        navigate('/login', { state: { successMessage: 'Session expired. Please log in again.' } });
        return;
      }
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        }
        if (response.status === 403) {
          throw new Error('Access denied to this order.');
        }
        throw new Error('Failed to fetch order details');
      }
      const data = await response.json();
      setOrder(data);
      setError(null);
    } catch (err) {
      if (!isSilent) setError(err.message);
      console.error(err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Poll for real-time status updates every 5 seconds
  useEffect(() => {
    fetchOrderDetails();

    const interval = setInterval(() => {
      fetchOrderDetails(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  // Status mapping to steps
  // 1: Placed, 2: Preparing, 3: Delivering, 4: Delivered
  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'accepted': return 2;
      case 'delivering': return 3;
      case 'delivered': return 4;
      case 'rejected': return -1;
      default: return 1;
    }
  };

  const currentStep = order ? getStatusStep(order.status) : 1;

  // Est Time and Info based on step
  const getStatusDetails = (status) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Order Placed',
          description: 'Waiting for restaurant confirmation',
          estTime: 35,
          color: 'from-amber-400 to-orange-500',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-100'
        };
      case 'accepted':
        return {
          title: 'Preparing Food',
          description: 'The kitchen is crafting your delicious meal',
          estTime: 25,
          color: 'from-purple-500 to-indigo-600',
          textColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-100'
        };
      case 'delivering':
        return {
          title: 'Out for Delivery',
          description: 'Our rider is speeding to your location',
          estTime: 12,
          color: 'from-blue-400 to-cyan-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100'
        };
      case 'delivered':
        return {
          title: 'Order Delivered',
          description: 'Enjoy your warm food!',
          estTime: 0,
          color: 'from-emerald-400 to-teal-500',
          textColor: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-100'
        };
      case 'rejected':
        return {
          title: 'Order Cancelled',
          description: 'The restaurant was unable to fulfill your request',
          estTime: null,
          color: 'from-rose-500 to-red-600',
          textColor: 'text-rose-600',
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-100'
        };
      default:
        return {
          title: 'Processing',
          description: 'Please wait...',
          estTime: 30,
          color: 'from-gray-400 to-gray-600',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-100'
        };
    }
  };

  const statusDetails = order ? getStatusDetails(order.status) : {};

  // Formatter for dates
  const formatOrderTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // Stepper representation
  const steps = [
    { label: 'Placed', icon: ShoppingBag, desc: 'We\'ve got it' },
    { label: 'Preparing', icon: Utensils, desc: 'In the kitchen' },
    { label: 'Delivering', icon: Truck, desc: 'On the way' },
    { label: 'Delivered', icon: CheckCircle2, desc: 'Enjoy!' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="text-center space-y-4 animate-pulse">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
          <p className="font-extrabold text-xl text-gray-900">Locating your order...</p>
          <p className="text-gray-400 text-sm">Getting live status from backend</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center space-y-6">
          <div className="bg-rose-50 text-rose-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto border border-rose-100">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-gray-900">Oops! Tracker Error</h3>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button 
              onClick={() => fetchOrderDetails()}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-[0.98] cursor-pointer"
            >
              Try Reconnecting
            </button>
            <Link 
              to="/customer-dashboard" 
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Delivery details helpers
  const deliveryFee = 2.99;
  const subtotal = order ? order.total_amount : 0;
  const totalAmount = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      
      {/* Premium Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm h-16 flex items-center px-4 sm:px-8 sticky top-0 z-40 justify-between">
        <button 
          onClick={() => navigate('/customer-dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-950 font-bold transition-all px-3 py-1.5 rounded-xl hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Dashboard
        </button>
        <div className="flex items-center gap-2">
          <span className="bg-orange-500 w-2.5 h-2.5 rounded-full animate-ping"></span>
          <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            Live Updates Enabled
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {/* Main Status Announcement Header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch">
          <div className={`p-8 md:p-10 flex-1 bg-gradient-to-br ${statusDetails.color} text-white flex flex-col justify-between relative`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-40 h-40" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                  Order Status
                </span>
                <span className="text-white/80 text-xs font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatOrderTime(order.created_at)}
                </span>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{statusDetails.title}</h1>
                <p className="text-white/90 text-sm font-medium">{statusDetails.description}</p>
              </div>
            </div>

            {order.status !== 'rejected' && order.status !== 'delivered' && (
              <div className="mt-8 md:mt-12 flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <Clock className="w-8 h-8 text-white shrink-0 animate-pulse" />
                <div>
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-wider block">Estimated Wait Time</span>
                  <span className="text-2xl font-black text-white flex items-baseline gap-1">
                    ~{statusDetails.estTime} 
                    <span className="text-sm font-semibold text-white/90">minutes</span>
                  </span>
                </div>
              </div>
            )}

            {order.status === 'delivered' && (
              <div className="mt-8 md:mt-12 flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <CheckCircle2 className="w-8 h-8 text-white shrink-0" />
                <div>
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-wider block">Delivered At</span>
                  <span className="text-lg font-black text-white">Just now! Enjoy your meal.</span>
                </div>
              </div>
            )}

            {order.status === 'rejected' && (
              <div className="mt-8 md:mt-12 flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <AlertTriangle className="w-8 h-8 text-white shrink-0" />
                <div>
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-wider block">Notice</span>
                  <span className="text-xs font-medium text-white/90">
                    Your payment (if any) was voided. Please contact support if you need assistance.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 md:p-10 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-between bg-gray-50/50 md:w-80">
            <div className="space-y-4">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Reference Info</span>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-gray-400 block">Order Number</span>
                  <span className="text-base font-black text-gray-900">#QD-{order.id}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 block">Deliver to Address</span>
                  <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                    Customer Location (Default)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200/60 mt-6 space-y-2">
              <span className="text-xs text-gray-400 font-semibold block">Need immediate help?</span>
              <button 
                onClick={() => alert("Customer service chat is offline. Please call restaurant directly.")}
                className="w-full text-center bg-white hover:bg-gray-100 text-gray-700 font-bold py-2.5 px-4 rounded-xl border border-gray-200 transition-colors text-xs"
              >
                Contact Customer Support
              </button>
            </div>
          </div>
        </div>

        {/* Stepper Card (Only show if not rejected) */}
        {order.status !== 'rejected' ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8">
            <h3 className="text-lg font-black text-gray-900">Live Delivery Progress</h3>
            
            {/* Visual Stepper */}
            <div className="relative">
              
              {/* Stepper line background */}
              <div className="absolute top-8 left-6 right-6 h-1 bg-gray-100 -translate-y-1/2 hidden md:block rounded-full"></div>
              
              {/* Stepper line active progress */}
              <div 
                className="absolute top-8 left-6 h-1 bg-gradient-to-r from-orange-400 to-orange-500 -translate-y-1/2 hidden md:block rounded-full transition-all duration-1000"
                style={{ 
                  width: `${
                    currentStep === 1 ? '16%' :
                    currentStep === 2 ? '50%' :
                    currentStep === 3 ? '83%' :
                    currentStep === 4 ? '100%' : '0%'
                  }` 
                }}
              ></div>

              {/* Vertical line background for mobile */}
              <div className="absolute left-8 top-8 bottom-8 w-1 bg-gray-100 -translate-x-1/2 md:hidden rounded-full"></div>

              {/* Vertical line active progress for mobile */}
              <div 
                className="absolute left-8 top-8 w-1 bg-gradient-to-b from-orange-400 to-orange-500 -translate-x-1/2 md:hidden rounded-full transition-all duration-1000"
                style={{ 
                  height: `${
                    currentStep === 1 ? '10%' :
                    currentStep === 2 ? '42%' :
                    currentStep === 3 ? '75%' :
                    currentStep === 4 ? '100%' : '0%'
                  }` 
                }}
              ></div>

              {/* Stepper Steps grid */}
              <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
                {steps.map((step, idx) => {
                  const stepNumber = idx + 1;
                  const isActive = stepNumber <= currentStep;
                  const isCurrent = stepNumber === currentStep;
                  const StepIcon = step.icon;
                  
                  return (
                    <div 
                      key={step.label} 
                      className={`flex md:flex-col items-center gap-4 md:text-center transition-all duration-300 ${
                        isActive ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      <div 
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${
                          isActive 
                            ? isCurrent
                              ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25 scale-110 animate-bounce-slow' 
                              : 'bg-orange-50 border-orange-200 text-orange-600'
                            : 'bg-white border-gray-100 text-gray-300'
                        }`}
                      >
                        <StepIcon className="w-7 h-7" />
                      </div>
                      
                      <div className="space-y-0.5">
                        <span className={`text-sm font-black block ${isActive ? 'text-gray-900 font-black' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                        <span className="text-xs text-gray-400 font-medium block">
                          {isCurrent ? 'Happening now' : step.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        ) : (
          /* Rejected / Cancelled Visual */
          <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="bg-rose-100 text-rose-600 p-5 rounded-2xl shrink-0">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-rose-800">Order Delivery Stopped</h3>
              <p className="text-rose-700 text-sm max-w-xl leading-relaxed font-medium">
                We're incredibly sorry for this inconvenience. The restaurant was unable to accept or prepare this order, likely due to operational capacity constraints or items running out of stock. A full refund has been requested.
              </p>
            </div>
          </div>
        )}

        {/* Order Details & Summary Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-6">
          <h3 className="text-lg font-black text-gray-900 pb-4 border-b border-gray-100">
            Order Summary
          </h3>

          {/* Ordered items list */}
          <div className="divide-y divide-gray-100">
            {order.items && order.items.map(item => (
              <div key={item.id} className="py-4.5 flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 font-extrabold text-orange-600 shrink-0 text-sm">
                    {item.quantity}x
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base">{item.name}</h4>
                    <span className="text-xs text-gray-400 font-semibold">${item.price.toFixed(2)} each</span>
                  </div>
                </div>
                <span className="font-black text-gray-900 text-base">
                  ${(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Cost details list */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <div className="flex justify-between text-sm text-gray-400 font-semibold">
              <span>Items Subtotal</span>
              <span className="text-gray-700">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400 font-semibold">
              <span>Standard Delivery Fee</span>
              <span className="text-gray-700">${deliveryFee.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-lg font-extrabold text-gray-900 pt-5 mt-2 border-t border-gray-100 flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                Total Charged
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">
                  USD
                </span>
              </span>
              <span className="text-xl font-black text-orange-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderTracker;
