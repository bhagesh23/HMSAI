import { useState, FormEvent } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';
import { apiUrl } from '../../config/api';

export default function PatientLogin({ onLogin, setAuthMode, setLoginPortal }: { onLogin: (_user: any) => void; setAuthMode: (_mode: string) => void; setLoginPortal: (_p: string | null) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
  const response = await fetch(apiUrl('/api/auth/patient/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        onLogin({ id: data.patientId, email: email });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Patient login error', error);
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
            <LogIn className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h2 className="text-3xl font-bold">Patient Portal Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 mt-1 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mt-1 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-green-500 to-teal-600 rounded-lg hover:from-green-600 hover:to-teal-700"
            >
              Sign In
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-300">
              Don't have an account?{' '}
              <button type="button" onClick={() => setAuthMode('register')} className="font-medium text-green-400 hover:underline">
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}