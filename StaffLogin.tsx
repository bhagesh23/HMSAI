import { useState, FormEvent } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';
import { apiUrl } from '../config/api';

export default function StaffLogin({ onLogin, setLoginPortal }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl('/api/auth/staff/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        alert(data.message);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert('Failed to connect to the server.');
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen bg-login">
      <div className="absolute inset-0 bg-black bg-opacity-60"></div> {/* Dark Overlay */}
      
      <button onClick={() => setLoginPortal(null)} className="absolute top-8 left-8 flex items-center gap-2 text-gray-300 hover:text-white transition-colors z-10">
        <ArrowLeft size={20} /> Back to Portal Selection
      </button>

      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 border-opacity-20">
        <div className="text-center text-white">
          <LogIn className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold">Staff Portal Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full p-3 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <button type="submit" className="w-full p-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Sign In
            </button>
        </form>
      </div>
    </div>
  );
}