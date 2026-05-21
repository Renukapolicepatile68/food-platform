import React, { useState } from 'react';
import { ShoppingBag, User, Mail, Lock, Building, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'customer' // default
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const response = await fetch('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Registration failed');
        }

        navigate('/login', { state: { successMessage: 'Registration successful! Please login.' } });
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
        <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-orange-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        
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
              Create an account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join the fastest food delivery network
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {submitError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 font-medium text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.fullName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'} rounded-xl bg-white/50 focus:bg-white transition-all outline-none text-gray-900 placeholder-gray-400`}
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                  {errors.fullName && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
              </div>

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

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I want to register as a</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border ${formData.role === 'customer' ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'} transition-all`}
                    onClick={() => setFormData({...formData, role: 'customer'})}
                  >
                    <User className={`w-5 h-5 ${formData.role === 'customer' ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span className="font-medium">Customer</span>
                  </button>
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border ${formData.role === 'restaurant' ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'} transition-all`}
                    onClick={() => setFormData({...formData, role: 'restaurant'})}
                  >
                    <Building className={`w-5 h-5 ${formData.role === 'restaurant' ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span className="font-medium">Restaurant</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
              {!submitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-orange-500 hover:text-orange-600 transition-colors">
                Log in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
