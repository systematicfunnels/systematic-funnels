import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, CheckCircle, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { supabase } from '../api/supabase';
import { QRCodeSVG } from 'qrcode.react';

const MfaSetup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    const checkMfaStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (data?.currentLevel === 'aal2') {
          setMfaEnabled(true);
          setMessage('Multi-factor authentication is already enabled.');
        }
      }
    };
    checkMfaStatus();
  }, []);

  const generateMfa = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      if (data?.totp) {
        setSecret(data.totp.secret);
        setQrCode(data.totp.qr_code);
        setMessage('Scan the QR code with your authenticator app and enter the code below.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activateMfa = async (challengeId: string) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: challengeId,
        code: verificationCode,
      });

      if (error) throw error;

      setMessage('MFA has been successfully enabled!');
      setMfaEnabled(true);
      setQrCode(null);
      setSecret(null);
      setVerificationCode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const disableMfa = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not logged in.');

      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;

      const totpFactor = factors.all.find(factor => factor.factor_type === 'totp' && factor.status === 'verified');

      if (!totpFactor) throw new Error('No active TOTP factor found.');

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id,
      });

      if (error) throw error;

      setMessage('MFA has been successfully disabled.');
      setMfaEnabled(false);
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
          <h1 className="text-2xl font-bold mb-2">Multi-Factor Authentication</h1>
          <p className="text-textMuted">
            {mfaEnabled ? 'Your account is secured with MFA.' : 'Add an extra layer of security to your account.'}
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

        {!mfaEnabled && !qrCode && (
          <button
            onClick={generateMfa}
            disabled={loading}
            className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Enable MFA
                <KeyRound size={18} />
              </>
            )}
          </button>
        )}

        {qrCode && secret && (
          <div className="text-center mt-6">
            <p className="text-textMuted mb-4">Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).</p>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={qrCode} size={256} level="H" />
            </div>
            <p className="text-textMuted mb-4">Or manually enter the secret key: <strong>{secret}</strong></p>
            <form onSubmit={(e) => { e.preventDefault(); activateMfa(secret); }} className="space-y-4">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-textMuted mb-2">Verification Code</label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:border-primary outline-none transition-colors text-center"
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
                    Verify and Enable
                    <CheckCircle size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {mfaEnabled && (
          <button
            onClick={disableMfa}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Disable MFA
                <AlertCircle size={18} />
              </>
            )}
          </button>
        )}

        <p className="text-center text-textMuted text-sm mt-6">
          <button onClick={() => navigate('/settings')} className="text-primary hover:underline font-medium">Back to Settings</button>
        </p>
      </div>
    </div>
  );
};

export default MfaSetup;
