import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  LogOut, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Image as ImageIcon, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  DollarSign, 
  Tag, 
  FileText, 
  Filter,
  RefreshCw,
  Utensils,
  Clock,
  Check,
  XCircle,
  Package,
  Receipt
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api/restaurants';
const DEFAULT_RESTAURANT_ID = 1;

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  
  // Tab State
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'orders'

  // Dashboard & Menu States
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Incoming Orders States
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [updatingOrderIds, setUpdatingOrderIds] = useState({});

  // Filter & Search States (for Menu)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image_url: '',
    is_active: true
  });
  const [formError, setFormError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Delete Dialog States
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Toast System
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch Menu, Restaurant Profile & Orders
  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      // Fetch restaurant details
      const resResponse = await fetch(`${API_BASE_URL}/${DEFAULT_RESTAURANT_ID}`);
      if (!resResponse.ok) throw new Error('Failed to fetch restaurant profile');
      const resData = await resResponse.json();
      setRestaurant(resData);

      // Fetch menu items
      const menuResponse = await fetch(`${API_BASE_URL}/${DEFAULT_RESTAURANT_ID}/menu`);
      if (!menuResponse.ok) throw new Error('Failed to fetch menu items');
      const menuData = await menuResponse.json();
      setMenuItems(menuData);

      // Fetch orders in background
      await fetchOrdersSilently();
    } catch (err) {
      setError(err.message);
      showToast('error', `Failed to load dashboard data: ${err.message}`);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch Orders explicitly (with visual loader on tab)
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }
      const response = await fetch(`http://localhost:8000/api/restaurant/orders?restaurant_id=${DEFAULT_RESTAURANT_ID}`, {
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
      if (!response.ok) throw new Error('Failed to fetch restaurant orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setOrdersError(err.message);
      showToast('error', `Failed to load orders: ${err.message}`);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Silently refresh orders to keep counters up to date
  const fetchOrdersSilently = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      const response = await fetch(`http://localhost:8000/api/restaurant/orders?restaurant_id=${DEFAULT_RESTAURANT_ID}`, {
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
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to silently fetch orders:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch orders when orders tab becomes active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/');
  };

  // Modal Open for Add
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: '',
      category: 'Main Course', // default preset
      description: '',
      image_url: '',
      is_active: true
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Modal Open for Edit
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      price: item.price !== undefined ? item.price.toString() : '',
      category: item.category || 'Main Course',
      description: item.description || '',
      image_url: item.image_url || '',
      is_active: item.is_active !== undefined ? item.is_active : true
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Modal Form Validation & Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Frontend validations
    if (!formData.name.trim()) {
      setFormError('Item name is required');
      return;
    }
    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError('Please enter a valid price (greater than or equal to 0)');
      return;
    }
    if (!formData.category.trim()) {
      setFormError('Category is required');
      return;
    }

    try {
      setFormSubmitting(true);
      const url = editingItem 
        ? `${API_BASE_URL}/${DEFAULT_RESTAURANT_ID}/menu/${editingItem.id}`
        : `${API_BASE_URL}/${DEFAULT_RESTAURANT_ID}/menu`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const payload = {
        name: formData.name.trim(),
        price: parsedPrice,
        category: formData.category.trim(),
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
        is_active: formData.is_active
      };

      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('Not authenticated. Please log in.');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        navigate('/login', { state: { successMessage: 'Session expired. Please log in again.' } });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to ${editingItem ? 'update' : 'create'} menu item`);
      }

      showToast('success', `Menu item ${editingItem ? 'updated' : 'added'} successfully!`);
      setIsModalOpen(false);
      
      // Refresh items list
      await fetchData();
    } catch (err) {
      setFormError(err.message);
      showToast('error', err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete Item
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmItem) return;
    
    try {
      setDeleteSubmitting(true);
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('Not authenticated. Please log in.');

      const response = await fetch(`${API_BASE_URL}/${DEFAULT_RESTAURANT_ID}/menu/${deleteConfirmItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        navigate('/login', { state: { successMessage: 'Session expired. Please log in again.' } });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to delete menu item');
      }

      showToast('success', `"${deleteConfirmItem.name}" deleted successfully.`);
      setDeleteConfirmItem(null);
      
      // Refresh items list
      await fetchData();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Handle Accept/Reject Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderIds(prev => ({ ...prev, [orderId]: true }));
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('Not authenticated. Please log in.');

      const response = await fetch(`http://localhost:8000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        navigate('/login', { state: { successMessage: 'Session expired. Please log in again.' } });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update order status');
      }

      showToast('success', `Order #${orderId} was successfully ${newStatus}!`);
      
      // Refresh orders list
      await fetchOrdersSilently();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setUpdatingOrderIds(prev => {
        const copy = { ...prev };
        delete copy[orderId];
        return copy;
      });
    }
  };

  // Quick Preset Categories (for Menu form)
  const CATEGORY_PRESETS = [
    'Appetizers',
    'Main Course',
    'Desserts',
    'Beverages',
    'Sides',
    'Salads',
    'Healthy'
  ];

  // Dynamic Tailwind Category Badge Style Helper
  const getCategoryBadgeClass = (category) => {
    const cleanCat = (category || '').toLowerCase().trim();
    if (cleanCat.includes('appetizer') || cleanCat.includes('side')) {
      return 'bg-blue-50 text-blue-700 border border-blue-100';
    }
    if (cleanCat.includes('main') || cleanCat.includes('course')) {
      return 'bg-purple-50 text-purple-700 border border-purple-100';
    }
    if (cleanCat.includes('dessert') || cleanCat.includes('sweet')) {
      return 'bg-pink-50 text-pink-700 border border-pink-100';
    }
    if (cleanCat.includes('beverage') || cleanCat.includes('drink')) {
      return 'bg-cyan-50 text-cyan-700 border border-cyan-100';
    }
    if (cleanCat.includes('salad') || cleanCat.includes('health') || cleanCat.includes('green')) {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    }
    return 'bg-amber-50 text-amber-700 border border-amber-100';
  };

  // Get distinct categories in currently fetched menu
  const distinctCategories = ['All', ...new Set(menuItems.map(item => item.category).filter(Boolean))];

  // Filter and search items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Filter pending orders only
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const pendingOrdersCount = pendingOrders.length;

  // Calculate Stats
  const totalItems = menuItems.length;
  const activeItemsCount = menuItems.filter(item => item.is_active).length;
  const categoriesCount = new Set(menuItems.map(item => item.category).filter(Boolean)).size;
  const averagePrice = totalItems > 0 
    ? menuItems.reduce((acc, curr) => acc + curr.price, 0) / totalItems
    : 0;

  // Format Order Date Helper
  const formatOrderTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Toast Alert System */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border animate-slide-in transition-all ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          )}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm h-16 flex items-center px-8 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white p-2 rounded-xl">
            <Utensils className="w-5 h-5" />
          </div>
          <div className="font-bold text-xl text-gray-900">
            Quick<span className="text-orange-500">Bite</span> <span className="font-medium text-gray-500">Partner</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="w-5 h-5" />
            Home
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Profile Card Banner */}
        {restaurant ? (
          <div className="relative rounded-3xl overflow-hidden shadow-md border border-gray-100 bg-white group">
            <div className="h-44 md:h-52 w-full relative">
              <img 
                src={restaurant.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2070'} 
                alt={restaurant.name} 
                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-900/60 to-transparent"></div>
            </div>
            
            <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white flex flex-col md:flex-row md:items-end justify-between w-full gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {restaurant.cuisine}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                    ★ {restaurant.rating} Rating
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{restaurant.name}</h1>
                <p className="text-gray-300 text-sm mt-1">Manage dishes, pricing, and live customer orders in real time.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    fetchData(true);
                    if (activeTab === 'orders') fetchOrders();
                  }}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2.5 px-4 rounded-xl backdrop-blur-md transition-colors cursor-pointer text-sm"
                  title="Sync Dashboard Data"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync Status
                </button>
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-center gap-4 text-amber-800">
              <AlertTriangle className="w-10 h-10 text-amber-600 shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Restaurant Profile Missing</h3>
                <p className="text-sm">We couldn't retrieve restaurant configuration. Using default styling and mock placeholders.</p>
              </div>
            </div>
          )
        )}

        {/* Dashboard Stats */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Items</span>
              <span className="text-3xl font-extrabold text-gray-900 mt-2">{totalItems}</span>
              <span className="text-xs text-gray-400 mt-1">Dishes in full menu database</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Items</span>
              <span className="text-3xl font-extrabold text-emerald-600 mt-2 flex items-center gap-2">
                {activeItemsCount}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {totalItems > 0 ? Math.round((activeItemsCount / totalItems) * 100) : 0}%
                </span>
              </span>
              <span className="text-xs text-gray-400 mt-1">Visible to customers online</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending Orders</span>
              <span className="text-3xl font-extrabold text-purple-600 mt-2 flex items-center gap-2">
                {pendingOrdersCount}
                {pendingOrdersCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 animate-pulse">
                    Action Required
                  </span>
                )}
              </span>
              <span className="text-xs text-gray-400 mt-1">Awaiting kitchen confirmation</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Average Price</span>
              <span className="text-3xl font-extrabold text-orange-500 mt-2">
                ${averagePrice.toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 mt-1">Mean cost across entire menu</span>
            </div>

          </div>
        )}

        {/* Dynamic Tab Switcher */}
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('menu')}
            className={`py-4 px-6 font-extrabold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'menu'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Menu Catalog
          </button>
          
          <button 
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-6 font-extrabold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'orders'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Incoming Orders
            {pendingOrdersCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </div>

        {/* loading / error checks */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="font-semibold text-lg">Retrieving restaurant catalog...</p>
            <p className="text-sm text-gray-400 mt-1">Connecting to MySQL backend</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm text-center max-w-lg mx-auto">
            <div className="bg-red-50 text-red-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sync Connection Failure</h3>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button 
              onClick={() => fetchData()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          
          /* TAB CONTENT CONTAINER */
          <div>
            
            {/* VIEW 1: MENU CATALOG TAB */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                
                {/* Catalog Control Bar */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="text" 
                        placeholder="Search menu item name or description..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-orange-500 focus:bg-white rounded-2xl text-sm font-medium text-gray-900 transition-all outline-none"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer text-sm"
                      >
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                        Add Menu Item
                      </button>
                    </div>

                  </div>

                  {/* Horizontal Category Badges */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mr-2 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" />
                      Filter:
                    </span>
                    {distinctCategories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all border ${
                          selectedCategory === cat 
                            ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                            : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                </div>

                {/* Table View */}
                {filteredMenuItems.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm text-center">
                    <div className="bg-gray-50 text-gray-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Utensils className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-950">No Menu Items Found</h3>
                    <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                      {searchQuery || selectedCategory !== 'All' 
                        ? "We couldn't find items matching your active search filters. Try clearing queries or resetting tabs."
                        : "Your restaurant catalog is currently empty. Get started by creating your very first menu dish!"}
                    </p>
                    {(searchQuery || selectedCategory !== 'All') && (
                      <button 
                        onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                        className="mt-5 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                      >
                        Clear Search Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-gray-50/70 border-b border-gray-100">
                            <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Item Details</th>
                            <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredMenuItems.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group/row">
                              <td className="px-6 py-4.5">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0 flex items-center justify-center relative group-hover/row:scale-[1.03] transition-transform">
                                    {item.image_url ? (
                                      <img 
                                        src={item.image_url} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <div 
                                      className="absolute inset-0 items-center justify-center text-gray-400 bg-gray-50"
                                      style={{ display: item.image_url ? 'none' : 'flex' }}
                                    >
                                      <ImageIcon className="w-6 h-6" />
                                    </div>
                                  </div>
                                  <div className="max-w-md">
                                    <h4 className="font-bold text-gray-900 text-base">{item.name}</h4>
                                    <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                                      {item.description || <span className="italic text-gray-400">No description provided.</span>}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4.5 whitespace-nowrap">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${getCategoryBadgeClass(item.category)}`}>
                                  {item.category || 'Uncategorized'}
                                </span>
                              </td>
                              <td className="px-6 py-4.5 whitespace-nowrap">
                                <span className="font-extrabold text-gray-950 text-base">${item.price.toFixed(2)}</span>
                              </td>
                              <td className="px-6 py-4.5 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold leading-none ${
                                  item.is_active 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                  {item.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4.5 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2.5">
                                  <button 
                                    onClick={() => handleOpenEditModal(item)}
                                    className="p-2.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                                    title="Edit Item details"
                                  >
                                    <Pencil className="w-4.5 h-4.5" />
                                  </button>
                                  <button 
                                    onClick={() => setDeleteConfirmItem(item)}
                                    className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                    title="Delete Item"
                                  >
                                    <Trash2 className="w-4.5 h-4.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div>
                        Showing <span className="font-semibold text-gray-700">{filteredMenuItems.length}</span> of{' '}
                        <span className="font-semibold text-gray-700">{menuItems.length}</span> total items
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: INCOMING ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                
                {ordersLoading ? (
                  <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-gray-500">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                    <p className="font-semibold text-lg">Fetching active orders...</p>
                    <p className="text-sm text-gray-400 mt-1">Accessing secure order records</p>
                  </div>
                ) : ordersError ? (
                  <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Failed to Load Orders</h3>
                    <p className="text-gray-500 text-sm mb-4">{ordersError}</p>
                    <button 
                      onClick={fetchOrders}
                      className="bg-orange-500 text-white font-semibold py-2 px-4 rounded-xl cursor-pointer"
                    >
                      Reload Orders
                    </button>
                  </div>
                ) : pendingOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm text-center">
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-950">You're All Caught Up!</h3>
                    <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                      There are no pending customer orders at the moment. New requests will blink here instantly.
                    </p>
                  </div>
                ) : (
                  
                  /* Pending Orders Card Layout */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingOrders.map(order => (
                      <div 
                        key={order.id} 
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden relative"
                      >
                        
                        {/* Order Header */}
                        <div className="bg-gray-50/70 px-6 py-4.5 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-orange-50 text-orange-600 p-2.5 rounded-xl border border-orange-100">
                              <Receipt className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-gray-950 text-base">Order #{order.id}</h4>
                              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3.5 h-3.5" />
                                {formatOrderTime(order.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/50 px-3 py-1 rounded-full text-xs font-extrabold animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Pending Action
                          </span>
                        </div>

                        {/* Order Items List */}
                        <div className="p-6 flex-1 space-y-4">
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Requested Dishes</span>
                          
                          <div className="space-y-3.5">
                            {order.items.map(item => (
                              <div key={item.id} className="flex items-center justify-between gap-3 text-sm font-medium">
                                <div className="flex items-center gap-3">
                                  <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-lg text-xs font-extrabold border border-orange-100">
                                    {item.quantity}x
                                  </span>
                                  <div className="max-w-xs">
                                    <span className="text-gray-900 font-bold block">{item.name}</span>
                                    <span className="text-gray-400 text-xs">${item.price.toFixed(2)} each</span>
                                  </div>
                                </div>
                                <span className="text-gray-900 font-bold shrink-0">
                                  ${(item.quantity * item.price).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Subtotal</span>
                            <span className="text-xl font-extrabold text-gray-950">${order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-gray-50/50 px-6 py-4.5 border-t border-gray-100 flex items-center gap-3.5">
                          
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2.5 px-4 rounded-xl border border-rose-200/50 transition-all cursor-pointer text-sm"
                            disabled={updatingOrderIds[order.id]}
                          >
                            {updatingOrderIds[order.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Reject
                          </button>

                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-emerald-500/10 active:scale-[0.98] transition-all cursor-pointer text-sm"
                            disabled={updatingOrderIds[order.id]}
                          >
                            {updatingOrderIds[order.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Accept Order
                          </button>

                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>

      {/* CREATE & EDIT OVERLAY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl overflow-hidden flex flex-col my-8 animate-scale-up">
            
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  {editingItem ? 'Update specifications and pricing for this dish' : 'Insert a fresh dish to your online customer menu'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-200/50 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    Item Name <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Classic Cheeseburger, Garlic Bread, etc."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-medium text-gray-900 transition-all outline-none"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    Price ($) <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="number" 
                      placeholder="9.99"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-8 pr-3 py-3 bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-medium text-gray-900 transition-all outline-none"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  Category / Cuisine Section <span className="text-rose-500 font-extrabold">*</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="E.g., Appetizers, Entrées, Desserts..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-medium text-gray-900 transition-all outline-none"
                    maxLength={50}
                    required
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CATEGORY_PRESETS.map(preset => (
                    <button 
                      type="button"
                      key={preset}
                      onClick={() => setFormData({ ...formData, category: preset })}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                        formData.category === preset
                          ? 'bg-orange-50 border-orange-200 text-orange-700'
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  Description
                </label>
                <textarea 
                  placeholder="Elaborate details about ingredients, dietary notes, sizing, or preparation..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-medium text-gray-900 transition-all outline-none min-h-[90px] max-h-[180px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  Image URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-medium text-gray-900 transition-all outline-none"
                />
                
                {formData.image_url ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-12 h-12 object-cover rounded-lg bg-gray-200 border border-gray-200 shrink-0"
                      onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Invalid+Image'; }}
                    />
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Image Source Link Status</span>
                      <span className="text-xs font-medium text-gray-500 truncate block">{formData.image_url}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800' })}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-gray-500 hover:text-gray-700 bg-gray-100/70 border border-gray-200/50 cursor-pointer"
                    >
                      🍔 Use Mock Burger Image
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800' })}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-gray-500 hover:text-gray-700 bg-gray-100/70 border border-gray-200/50 cursor-pointer"
                    >
                      🥗 Use Mock Salad Image
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-gray-900 block">Catalog Visibility Status</span>
                  <span className="text-xs text-gray-500 block">Toggle if item can be ordered immediately by customers.</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`w-14 h-8 rounded-full transition-colors relative flex items-center cursor-pointer ${
                    formData.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`w-6.5 h-6.5 rounded-full bg-white shadow-md transition-transform absolute ${
                    formData.is_active ? 'translate-x-6.5' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
            </form>

            <div className="bg-gray-50 px-6 py-4.5 border-t border-gray-100 flex items-center justify-end gap-3.5">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-transparent hover:bg-gray-200/50 text-gray-700 font-bold py-3 px-5 rounded-2xl text-sm transition-colors cursor-pointer"
                disabled={formSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleFormSubmit}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 px-6 rounded-2xl text-sm shadow-md hover:shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer"
                disabled={formSubmitting}
              >
                {formSubmitting && <Loader2 className="w-4.5 h-4.5 animate-spin" />}
                {formSubmitting ? 'Saving changes...' : (editingItem ? 'Save Item Changes' : 'Create Menu Item')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL DIALOG */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-scale-up">
            <div className="p-6 text-center space-y-4">
              <div className="bg-rose-50 text-rose-600 p-4.5 rounded-full w-18 h-18 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 stroke-[2]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-gray-950">Remove Menu Dish?</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                  Are you absolutely certain you wish to delete <span className="font-semibold text-gray-800">"{deleteConfirmItem.name}"</span>? This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4.5 border-t border-gray-100 flex items-center justify-center gap-3">
              <button 
                onClick={() => setDeleteConfirmItem(null)}
                className="bg-transparent hover:bg-gray-200/50 text-gray-700 font-bold py-3 px-5 rounded-2xl text-sm transition-colors cursor-pointer flex-1"
                disabled={deleteSubmitting}
              >
                Keep Dish
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 px-5 rounded-2xl text-sm shadow-md transition-colors cursor-pointer flex-1"
                disabled={deleteSubmitting}
              >
                {deleteSubmitting && <Loader2 className="w-4.5 h-4.5 animate-spin" />}
                {deleteSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RestaurantDashboard;
