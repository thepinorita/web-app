import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const AdminPanel: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/admin/login`, { password });
      if (res.data.success) {
        setIsAuthenticated(true);
        toast.success('Welcome Admin');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Login failed');
    }
  };

  const clearAllShifts = async () => {
    if (!window.confirm('Are you sure you want to delete ALL shifts?')) return;
    try {
      await axios.delete(`${API_URL}/admin/shifts`, {
        headers: { adminPassword: password }
      });
      toast.success('All shifts cleared!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to clear shifts');
    }
  };

  const updatePassword = async () => {
    try {
      await axios.post(`${API_URL}/admin/update-password`, 
        { newPassword }, 
        { headers: { adminPassword: password } }
      );
      toast.success('Password updated!');
      setNewPassword('');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Admin Access</h2>
        <input 
          type="password" 
          placeholder="Enter Admin Password"
          className="p-2 border rounded-lg shadow-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button 
          onClick={handleLogin}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Management</h2>
        
        <div className="flex flex-col space-y-3">
          <p className="text-gray-600">Danger Zone</p>
          <button 
            onClick={clearAllShifts}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold"
          >
            Clear All Shifts
          </button>
        </div>

        <div className="flex flex-col space-y-3 pt-6 border-t">
          <p className="text-gray-600">Security</p>
          <div className="flex space-x-2">
            <input 
              type="password" 
              placeholder="New Password"
              className="flex-grow p-2 border rounded-lg shadow-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button 
              onClick={updatePassword}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition"
            >
              Update
            </button>
          </div>
        </div>
      </div>
      <button 
        onClick={() => setIsAuthenticated(false)} 
        className="text-sm text-gray-500 hover:text-red-500 transition underline"
      >
        Logout Admin
      </button>
    </div>
  );
};

export default AdminPanel;
