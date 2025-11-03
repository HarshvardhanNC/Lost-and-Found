import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useAuth } from '../../context/AuthContext'; // Keeping for sync
import LostFoundManagement from './LostFoundManagement';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(0);
  
  // Redux state
  const { user } = useAppSelector((state) => state.auth);
  
  // Context API (for backward compatibility)
  const { logout: contextLogout } = useAuth();

  const handleLogout = () => {
    dispatch(logout()); // Redux logout
    contextLogout(); // Context logout (for sync)
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80)' }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-65 z-0"></div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex justify-between items-center p-4 bg-blue-600 bg-opacity-85 backdrop-blur-md text-white shadow-lg">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="font-medium">Welcome, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto mt-8 px-4">
        <div className="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-xl shadow-2xl">
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab(0)}
                className={`px-6 py-3 font-semibold transition duration-200 border-b-2 ${
                  activeTab === 0
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                Lost & Found Management
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`px-6 py-3 font-semibold transition duration-200 border-b-2 ${
                  activeTab === 1
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                User Management
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-4">
            {activeTab === 0 && <LostFoundManagement />}
            {activeTab === 1 && <UserManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
