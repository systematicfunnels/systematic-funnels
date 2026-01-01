import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MailCheck, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../api/supabase';

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [loadingResend, setLoadingResend] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      setStatus('verifying');
      const params = new URLSearchParams(location.hash.substring(1));
      const type = params.get('type');
      const token = params.get('token');
      const email = params.get('email') || localStorage.getItem('pendingVerificationEmail');

      if (type === 'signup' && token && email) {
        const { error } = await supabase.auth.verifyOtp({ 
          type: 'signup', 
          token,
          email 
        });
        if (error) {
          setMessage(error.message);
          setStatus('error');
        } else {
          setMessage('Your email has been successfully verified! You can now log in.');
          setStatus('success');
          setTimeout(() => navigate('/login'), 3000);
        }
      } else {
        setMessage('Invalid verification link or missing token.');
        setStatus('error');
      }
    };

    if (location.hash) {
      verifyEmail();
    } else {
      setStatus('idle');
      setMessage('Please check your email for a verification link.');
    }
  }, [location.hash, navigate]);

  const handleResendVerification = async () => {
    setLoadingResend(true);
    setMessage(null);
    const email = localStorage.getItem('pendingVerificationEmail'); // Assuming you store this after signup

    if (email) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Verification email resent! Please check your inbox.');
      }
    } else {
      setMessage('No email found to resend verification. Please sign up again.');
    }
    setLoadingResend(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
            {status === 'verifying' && <Loader2 className="text-white animate-spin" size={24} />}
            {status === 'success' && <MailCheck className="text-white" size={24} />}
            {status === 'error' && <AlertCircle className="text-white" size={24} />}
            {status === 'idle' && <MailCheck className="text-white" size={24} />}
          </div>
          <h1 className="text-2xl font-bold mb-2">Email Verification</h1>
          <p className="text-textMuted">
            {status === 'verifying' && 'Verifying your email address...'}
            {status === 'idle' && 'A verification link has been sent to your email address. Please check your inbox and spam folder.'}
            {message}
          </p>
        </div>

        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">
            {message}
          </div>
        )}
        {status === 'success' && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg p-3 mb-4">
            {message}
          </div>
        )}

        {(status === 'idle' || status === 'error') && (
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-textMuted text-sm mb-4">
              Didn't receive the email?
            </p>
            <button
              onClick={handleResendVerification}
              disabled={loadingResend}
              className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingResend ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <MailCheck size={18} />
              )}
              Resend Verification Email
            </button>
            <p className="text-textMuted text-sm mt-4">
              Remembered your password? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
