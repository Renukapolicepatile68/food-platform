import React, { useState } from 'react';
import { ShoppingBag, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(location.state?.successMessage || null);

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setSubmitting(true);
      setSubmitError(null);
      setSuccessMsg(null);
      try {
        const response = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Login failed');
        }

        const data = await response.json();
        
        // Save role & token for ProtectedRoute and authorization headers
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userName', data.full_name);
        
        if (data.role === 'customer') {
          navigate('/customer-dashboard');
        } else if (data.role === 'restaurant') {
          navigate('/restaurant-dashboard');
        } else {
          navigate('/');
        }
      } catch (err) {
        setSubmitError(err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background blobs for aesthetic */}
        <div className="absolute top-0 right-1/2 w-[800px] h-[800px] bg-orange-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gray-400/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        
        <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 relative z-10">
          <div>
            <Link to="/" className="flex items-center justify-center gap-2 cursor-pointer mb-8">
              <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/30">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <span className="font-bold text-3xl tracking-tight text-gray-900">
                Quick<span className="text-orange-500">Bite</span>
              </span>
            </Link>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please enter your details to sign in
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {successMsg && (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-2 font-medium text-sm border border-emerald-100 animate-fade-in">
                <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{successMsg}</span>
              </div>
            )}
            {submitError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 font-medium text-sm border border-red-100 animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'} rounded-xl bg-white/50 focus:bg-white transition-all outline-none text-gray-900 placeholder-gray-400`}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  {errors.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'} rounded-xl bg-white/50 focus:bg-white transition-all outline-none text-gray-900 placeholder-gray-400`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  {errors.password && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
              {!submitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-orange-500 hover:text-orange-600 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
