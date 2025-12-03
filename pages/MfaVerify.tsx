import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../api/supabase';

const MfaVerify: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const challengeId = localStorage.getItem('mfaChallengeId'); // Retrieve challenge ID from local storage

    if (!challengeId) {
      setError('MFA challenge ID not found. Please try logging in again.');
      setLoading(false);
      return;
    }

    try {
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: challengeId,
        code: verificationCode,
      });

      if (verifyError) throw verifyError;

      setMessage('MFA verified successfully! Redirecting...');
      localStorage.removeItem('mfaChallengeId');
      navigate('/dashboard'); // Redirect to dashboard after successful MFA
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verify Multi-Factor Authentication</h1>
          <p className="text-textMuted">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg p-3 mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-textMuted mb-2">Verification Code</label>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="••••••"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:border-primary outline-none transition-colors text-center"
              maxLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Verify Code
                <CheckCircle size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MfaVerify;
