import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Lock, Mail, ArrowRight, User } from 'lucide-react';
import { supabase } from '../api/supabase';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      setError(error.message);
    } else {
      localStorage.setItem('pendingVerificationEmail', email);
      navigate('/verify-email');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
       <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="text-center mb-8">
             <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="text-white" size={24} />
             </div>
             <h1 className="text-2xl font-bold mb-2">Create Account</h1>
             <p className="text-textMuted">Start generating documentation in seconds</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg p-3 mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Full Name</label>
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                   <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:border-primary outline-none transition-colors"
                      required
                   />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Email</label>
                <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                   <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:border-primary outline-none transition-colors"
                      required
                   />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Password</label>
                <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                   <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:border-primary outline-none transition-colors"
                      required
                   />
                </div>
             </div>

             <button 
               type="submit"
               disabled={loading}
               className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
             >
                Create Account <ArrowRight size={18} />
             </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
             <p className="text-textMuted text-sm">
                Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
             </p>
          </div>
       </div>
    </div>
  );
};

export default Signup;