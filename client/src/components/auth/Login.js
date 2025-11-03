import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser } from '../../store/slices/authSlice';
import { useAuth } from '../../context/AuthContext'; // Keeping for sync

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { user, loading: reduxLoading, error: reduxError } = useAppSelector((state) => state.auth);
  
  // Context API (for backward compatibility)
  const { login: contextLogin } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Sync Redux state with Context API
  useEffect(() => {
    if (user) {
      contextLogin(localStorage.getItem('token'), user);
    }
  }, [user, contextLogin]);

  // Handle Redux errors
  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
    }
  }, [reduxError]);

  // Handle successful login
  useEffect(() => {
    if (user && !reduxLoading) {
      console.log('User role:', user.role);
      console.log('Redirecting to:', user.role === 'admin' ? '/admin/dashboard' : '/lost-found');
      
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/lost-found');
      }
    }
  }, [user, reduxLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Dispatch Redux action
    dispatch(loginUser({ 
      email: formData.email, 
      password: formData.password 
    }));
  };

  const loading = reduxLoading;

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/images/campus.jpg)' }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

      {/* Main Container */}
      <div className="relative z-20 w-full max-w-md mx-auto px-4">
        {/* Card */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-lg shadow-2xl flex flex-col items-center">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">
            Sign In to Lost & Found System
          </h1>

          {error && (
            <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full mt-2">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                autoFocus
                required
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              disabled={loading}
              className="w-full mt-3 text-blue-600 hover:text-blue-700 font-medium py-2 disabled:text-gray-400 disabled:cursor-not-allowed transition duration-200"
            >
              Don't have an account? Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
