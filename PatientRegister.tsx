import { useState, ChangeEvent, FormEvent } from 'react';
import { UserPlus, ArrowLeft } from 'lucide-react';

export default function PatientRegister({ setAuthMode, setLoginPortal }: { setAuthMode: (_mode: string) => void; setLoginPortal: (_p: string | null) => void }) {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData(prev => ({...prev, [name]: value}));
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/patient/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        alert('Registration successful! Please log in.');
        setAuthMode('login');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Patient register error', error);
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
            <UserPlus className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <h2 className="text-2xl font-bold">Create Patient Account</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input name="firstName" onChange={handleInputChange} placeholder="First Name" className="p-3 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
                <input name="lastName" onChange={handleInputChange} placeholder="Last Name" className="p-3 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
            </div>
            <input name="email" type="email" onChange={handleInputChange} placeholder="Email Address" className="w-full p-3 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
            <input name="password" type="password" onChange={handleInputChange} placeholder="Password" className="w-full p-3 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
            <button
              type="submit"
              className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-green-500 to-teal-600 rounded-lg hover:from-green-600 hover:to-teal-700"
            >
              Register
            </button>
            <div className="text-center">
                <p className="text-sm text-gray-300">
                Already have an account?{' '}
                <button type="button" onClick={() => setAuthMode('login')} className="font-medium text-green-400 hover:underline">
                    Sign In
                </button>
                </p>
          </div>
        </form>
      </div>
    </div>
  );
}