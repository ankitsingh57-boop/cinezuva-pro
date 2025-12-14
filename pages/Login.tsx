import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const success = await login(email, password);
    
    if (success) {
      navigate('/admin');
    } else {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-red/10 blur-[100px] rounded-full"></div>
         <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[80px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#161616] border border-white/5 rounded-2xl shadow-2xl p-8 animate-fade-in-up">
        <div className="flex justify-center mb-8">
           <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center border border-brand-red/20">
              <Lock className="text-brand-red" size={32} />
           </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white text-center mb-2">Admin Access</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">Enter your secure credentials to manage movies.</p>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
            <AlertCircle size={16} /> Invalid email or password.
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-brand-red outline-none transition-colors"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-brand-red outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-brand-red/20 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Login Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></>}
          </button>
        </form>
        
        <div className="mt-8 text-center">
           <p className="text-xs text-gray-600">Secure connection via Supabase</p>
        </div>
      </div>
    </div>
  );
};