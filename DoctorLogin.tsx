import { useState, FormEvent } from 'react';
import { HeartPulse, ArrowLeft } from 'lucide-react';
import { apiUrl } from '../config/api';

export default function DoctorLogin({ onLogin, setLoginType }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl('/api/auth/doctor/login'), {
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
      console.error('Doctor login error', error);
      alert('Failed to connect to the server.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 to-cyan-100">
        <button onClick={() => setLoginType(null)} className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
            <ArrowLeft size={20} /> Back to Role Selection
        </button>
      <div className="w-full max-w-md p-8 space-y-6 bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 animate-fade-in">
        <div className="text-center text-gray-800">
            <HeartPulse className="w-16 h-16 mx-auto mb-4 text-teal-500" />
            <h2 className="text-3xl font-bold">Doctor Login</h2>
            <p className="text-gray-600 mt-2">Access your patient and records dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 mt-1 bg-white bg-opacity-80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mt-1 bg-white bg-opacity-80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-green-500 to-teal-600 rounded-lg hover:from-green-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}