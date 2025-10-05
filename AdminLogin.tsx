import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import apiUrl from '../config/api';

export default function AdminLogin({ onLogin, setLoginType }: { onLogin: ( _u:any) => void; setLoginType: ( _v:any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl('/api/auth/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        onLogin(data.userType);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to connect to the server.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-700 via-gray-900 to-black">
      <button onClick={() => setLoginType(null)} className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back to Role Selection
      </button>
      <div className="w-full max-w-md p-8 space-y-6 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 border-opacity-20 animate-fade-in">
        <div className="text-center text-white">
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h2 className="text-3xl font-bold">Admin Login</h2>
            <p className="text-gray-300 mt-2">Access the administrative dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 mt-1 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mt-1 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}