/**
 * Farm2Market Unified Login Page
 * React component port of farm2marketloginpage (vanilla HTML/CSS/JS)
 * Connects to existing FastAPI backend auth endpoints
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../portals/admin/stores/authStore';
import './LoginPage.css';

// ─── Types ───────────────────────────────────────────────────────────────────
type AuthMode = 'signin' | 'signup';
type Role = 'farmer' | 'operator' | 'admin';
type FarmerStep = 'mobile' | 'otp';
type StatusType = 'success' | 'error' | 'warning' | 'info';

interface StatusState {
  message: string;
  type: StatusType;
  visible: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  levelClass: string;
  rules: { length: boolean; case: boolean; number: boolean; special: boolean };
}

// ─── Constants ───────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_FARMER_API_URL || 'http://localhost:8000/api/v1';

const API = {
  FARMER_SEND_OTP: `${API_BASE}/auth/farmer/send-otp`,
  FARMER_VERIFY_OTP: `${API_BASE}/auth/farmer/verify-otp`,
  FARMER_REGISTER: `${API_BASE}/auth/farmer/register`,
  OPERATOR_LOGIN: `${API_BASE}/auth/operator/login`,
  OPERATOR_SEND_VERIFICATION: `${API_BASE}/auth/operator/send-verification`,
  OPERATOR_VERIFY_EMAIL: `${API_BASE}/auth/operator/verify-email`,
  OPERATOR_REGISTER: `${API_BASE}/auth/operator/register`,
  ADMIN_LOGIN: `${API_BASE}/auth/admin/login`,
  ADMIN_REGISTER: `${API_BASE}/auth/admin/register`,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: '', levelClass: '', rules: { length: false, case: false, number: false, special: false } };
  }
  const rules = {
    length: password.length >= 8,
    case: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  let metCount = Object.values(rules).filter(Boolean).length;
  if (password.length >= 12 && metCount >= 3) metCount++;

  if (password.length < 6) return { score: 1, label: 'Too Short', levelClass: 'weak', rules };
  if (metCount <= 1) return { score: 1, label: 'Weak', levelClass: 'weak', rules };
  if (metCount === 2) return { score: 2, label: 'Fair', levelClass: 'fair', rules };
  if (metCount === 3) return { score: 3, label: 'Strong', levelClass: 'strong', rules };
  return { score: 4, label: 'Very Strong', levelClass: 'very-strong', rules };
}

async function apiFetch(url: string, opts: RequestInit = {}): Promise<any> {
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.message || `Request failed (${res.status})`);
  }
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT: LoginPage
// ═══════════════════════════════════════════════════════════════════════════════
export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  // ─── Top-level state ───────────────────────────────────────────────────────
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [role, setRole] = useState<Role>('farmer');
  const [status, setStatus] = useState<StatusState>({ message: '', type: 'info', visible: false });

  // ─── Farmer state ──────────────────────────────────────────────────────────
  const [farmerStep, setFarmerStep] = useState<FarmerStep>('mobile');
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [showUnregistered, setShowUnregistered] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Farmer loading
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Farmer registration
  const [regMobile, setRegMobile] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regVillage, setRegVillage] = useState('');
  const [regMandal, setRegMandal] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regState, setRegState] = useState('');
  const [regPincode, setRegPincode] = useState('');
  const [regLandArea, setRegLandArea] = useState('');
  const [regCrop, setRegCrop] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  // ─── Operator state ────────────────────────────────────────────────────────
  const [opEmail, setOpEmail] = useState('');
  const [opPassword, setOpPassword] = useState('');
  const [opEmailError, setOpEmailError] = useState('');
  const [opPasswordError, setOpPasswordError] = useState('');
  const [opLoading, setOpLoading] = useState(false);
  const [opShowUnverified, setOpShowUnverified] = useState(false);
  const [opUnverifiedMsg, setOpUnverifiedMsg] = useState('');
  const [opResending, setOpResending] = useState(false);
  const [opStep, setOpStep] = useState<'login' | 'verify'>('login');
  const [opOtp, setOpOtp] = useState('');

  // Operator registration
  const [regOpName, setRegOpName] = useState('');
  const [regOpEmail, setRegOpEmail] = useState('');
  const [regOpCentre, setRegOpCentre] = useState('');
  const [regOpMandiCode, setRegOpMandiCode] = useState('');
  const [regOpPassword, setRegOpPassword] = useState('');
  const [opRegSubmitting, setOpRegSubmitting] = useState(false);

  // ─── Admin state ───────────────────────────────────────────────────────────
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminEmailError, setAdminEmailError] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminStep, setAdminStep] = useState<'login' | 'verify'>('login');
  const [adminOtp, setAdminOtp] = useState('');

  // Admin registration
  const [regAdminName, setRegAdminName] = useState('');
  const [regAdminDept, setRegAdminDept] = useState('');
  const [regAdminEmail, setRegAdminEmail] = useState('');
  const [regAdminPassword, setRegAdminPassword] = useState('');
  const [adminRegSubmitting, setAdminRegSubmitting] = useState(false);

  // ─── Password visibility ──────────────────────────────────────────────────
  const [showOpPassword, setShowOpPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showRegOpPassword, setShowRegOpPassword] = useState(false);
  const [showRegAdminPassword, setShowRegAdminPassword] = useState(false);

  // ─── Success state ────────────────────────────────────────────────────────
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    greeting: string;
    roleBadge: string;
    details: { label: string; value: string }[];
    redirectUrl: string;
  } | null>(null);

  // ─── Status helpers ────────────────────────────────────────────────────────
  const showStatusMsg = useCallback((message: string, type: StatusType) => {
    setStatus({ message, type, visible: true });
  }, []);
  const hideStatus = useCallback(() => setStatus(s => ({ ...s, visible: false })), []);

  // ─── Resend timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setTimeout(() => setResendSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  // ─── Redirect if already logged in ─────────────────────────────────────────
  useEffect(() => {
    const farmerToken = localStorage.getItem('farmerToken');
    const opToken = localStorage.getItem('op_token');
    const opUser = localStorage.getItem('op_user');
    const adminToken = localStorage.getItem('token');
    const adminRole = localStorage.getItem('role');

    // Prevent infinite redirect loops by ensuring all required data is present
    if (farmerToken) { 
      navigate('/farmer/', { replace: true }); 
      return; 
    }
    if (opToken && opUser) { 
      navigate('/operator/', { replace: true }); 
      return; 
    }
    if (adminToken && adminRole?.toUpperCase() === 'ADMIN') { 
      navigate('/admin/dashboard', { replace: true }); 
      return; 
    }
  }, [navigate]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FARMER: Send OTP
  // ═══════════════════════════════════════════════════════════════════════════
  const handleFarmerSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    hideStatus();
    setMobileError('');

    const raw = mobile.trim();
    if (!raw) { setMobileError('Please enter your 10-digit mobile number.'); return; }
    if (!/^[6-9]\d{9}$/.test(raw)) { setMobileError('Invalid mobile number. Must be 10 digits starting with 6-9.'); return; }

    setSendingOtp(true);
    try {
      const data = await apiFetch(API.FARMER_SEND_OTP, {
        method: 'POST',
        body: JSON.stringify({ mobile: raw }),
      });
      setMaskedMobile(`+91 ******${raw.slice(6)}`);
      setFarmerStep('otp');
      setOtpDigits(['', '', '', '', '', '']);
      setShowUnregistered(false);
      setResendSeconds(30);
      showStatusMsg(`OTP sent successfully to +91 ******${raw.slice(6)}`, 'success');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      showStatusMsg(err.message || 'Failed to send OTP.', 'error');
      setMobileError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FARMER: Verify OTP
  // ═══════════════════════════════════════════════════════════════════════════
  const handleFarmerVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    hideStatus();
    setOtpError('');

    const otp = otpDigits.join('');
    if (otp.length !== 6) { setOtpError('Please enter all 6 digits.'); return; }

    setVerifyingOtp(true);
    try {
      const data = await apiFetch(API.FARMER_VERIFY_OTP, {
        method: 'POST',
        body: JSON.stringify({ mobile: mobile.trim(), otp }),
      });

      if (!data.is_registered) {
        // New farmer — store temp token, show registration prompt
        setTempToken(data.access_token);
        setShowUnregistered(true);
        showStatusMsg('Mobile verified! This number is not registered yet.', 'warning');
        return;
      }

      // Existing farmer — store token and redirect
      localStorage.setItem('farmerToken', data.access_token);
      showStatusMsg('Authentication successful!', 'success');
      setTimeout(() => navigate('/farmer/', { replace: true }), 500);
    } catch (err: any) {
      showStatusMsg(err.message || 'OTP verification failed.', 'error');
      setOtpError(err.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FARMER: Resend OTP
  // ═══════════════════════════════════════════════════════════════════════════
  const handleResendOtp = async () => {
    hideStatus();
    try {
      await apiFetch(API.FARMER_SEND_OTP, {
        method: 'POST',
        body: JSON.stringify({ mobile: mobile.trim() }),
      });
      setOtpDigits(['', '', '', '', '', '']);
      setResendSeconds(30);
      showStatusMsg('New OTP sent successfully.', 'success');
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      showStatusMsg(err.message || 'Failed to resend OTP.', 'error');
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FARMER: Registration
  // ═══════════════════════════════════════════════════════════════════════════
  const handleFarmerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    hideStatus();

    // Client validation
    if (!regName || !regVillage || !regMandal || !regDistrict || !regState || !regPincode || !regLandArea || !regCrop) {
      showStatusMsg('Please fill in all mandatory fields.', 'error');
      return;
    }
    if (regPincode && !/^\d{6}$/.test(regPincode)) {
      showStatusMsg('Pincode must be exactly 6 digits.', 'error');
      return;
    }

    setRegSubmitting(true);
    const regMob = regMobile || mobile.trim();

    try {
      const data = await apiFetch(API.FARMER_REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`,
        },
        body: JSON.stringify({
          mobile: regMob,
          name: regName,
          email: regEmail || undefined,
          village: regVillage,
          mandal: regMandal,
          district: regDistrict,
          state: regState,
          pincode: regPincode,
          land_area: parseFloat(regLandArea) || undefined,
          primary_crops: regCrop,
        }),
      });

      localStorage.setItem('farmerToken', data.access_token);
      showStatusMsg('Registration successful!', 'success');
      setTimeout(() => navigate('/farmer/', { replace: true }), 500);
    } catch (err: any) {
      showStatusMsg(err.message || 'Registration failed.', 'error');
    } finally {
      setRegSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // OPERATOR: Login
  // ═══════════════════════════════════════════════════════════════════════════
  const handleOperatorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    hideStatus();
    setOpEmailError('');
    setOpPasswordError('');
    setOpShowUnverified(false);

    if (!opEmail) { setOpEmailError('Please enter your email address.'); return; }
    if (!opPassword) { setOpPasswordError('Please enter your password.'); return; }

    setOpLoading(true);
    try {
      const data = await apiFetch(API.OPERATOR_LOGIN, {
        method: 'POST',
        body: JSON.stringify({ operator_id: opEmail, password: opPassword }),
      });

      if (data.requires_verification) {
        setOpStep('verify');
        showStatusMsg(data.message || 'Verification code sent to your email.', 'info');
        return;
      }

      // Store auth — compatible with existing operator AuthContext
      localStorage.setItem('op_token', data.access_token);
      localStorage.setItem('op_user', JSON.stringify({
        id: data.access_token, // decoded from JWT in the operator portal
        token: data.access_token,
        role: 'OPERATOR',
        email: opEmail,
      }));
      showStatusMsg('Login successful!', 'success');
      setTimeout(() => navigate('/operator/', { replace: true }), 500);
    } catch (err: any) {
      if (err.message === 'unverified_email' || err.message.toLowerCase().includes('unverified')) {
        setOpShowUnverified(true);
        setOpUnverifiedMsg('Please verify your email before logging in.');
        showStatusMsg('Email verification required.', 'warning');
      } else {
        showStatusMsg(err.message || 'Login failed.', 'error');
        setOpPasswordError(err.message);
      }
    } finally {
      setOpLoading(false);
    }
  };

  const handleOperatorVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    hideStatus();
    if (!opOtp) { showStatusMsg('Please enter the verification code.', 'error'); return; }
    setOpLoading(true);
    try {
      // Operator has verify-email endpoint 
      const data = await apiFetch(API.OPERATOR_VERIFY_EMAIL, {
        method: 'POST',
        body: JSON.stringify({ email: opEmail, code: opOtp }),
      });
      // After verification, we need to login again to get the token or the backend could return it
      // Let's assume the backend verifies and we just login again directly.
      showStatusMsg('Email verified! Logging you in...', 'success');
      const loginData = await apiFetch(API.OPERATOR_LOGIN, {
        method: 'POST',
        body: JSON.stringify({ operator_id: opEmail, password: opPassword }),
      });
      
      localStorage.setItem('op_token', loginData.access_token);
      localStorage.setItem('op_user', JSON.stringify({
        id: loginData.access_token,
        token: loginData.access_token,
        role: 'OPERATOR',
        email: opEmail,
      }));
      setTimeout(() => navigate('/operator/', { replace: true }), 500);
    } catch (err: any) {
      showStatusMsg(err.message || 'Verification failed.', 'error');
    } finally {
      setOpLoading(false);
    }
  };


  // ═══════════════════════════════════════════════════════════════════════════
  // OPERATOR: Resend Verification
  // ═══════════════════════════════════════════════════════════════════════════
  const handleResendOperatorVerification = async () => {
    if (!opEmail) { showStatusMsg('Enter email first.', 'error'); return; }
    setOpResending(true);
    try {
      await apiFetch(API.OPERATOR_SEND_VERIFICATION, {
        method: 'POST',
        body: JSON.stringify({ email: opEmail }),
      });
      showStatusMsg('Verification email sent.', 'success');
    } catch (err: any) {
      showStatusMsg(err.message || 'Failed to send verification email.', 'error');
    } finally {
      setOpResending(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // OPERATOR: Registration
  // ═══════════════════════════════════════════════════════════════════════════
  const handleOperatorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    hideStatus();
    if (!regOpName || !regOpEmail || !regOpCentre || !regOpMandiCode || !regOpPassword) {
      showStatusMsg('Please fill all required fields.', 'error');
      return;
    }
    if (regOpPassword.length < 8) {
      showStatusMsg('Password must be at least 8 characters.', 'error');
      return;
    }
    setOpRegSubmitting(true);
    try {
      const data = await apiFetch(API.OPERATOR_REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          name: regOpName,
          email: regOpEmail,
          centre_name: regOpCentre,
          operator_id: regOpMandiCode,
          password: regOpPassword,
        }),
      });
      showStatusMsg('Operator registered successfully! Your account is pending Admin approval.', 'success');
      setAuthMode('signin');
      setRole('operator');
      setOpEmail(regOpEmail);
    } catch (err: any) {
      showStatusMsg(err.message || 'Registration failed.', 'error');
    } finally {
      setOpRegSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN: Login
  // ═══════════════════════════════════════════════════════════════════════════
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    hideStatus();
    setAdminEmailError('');
    setAdminPasswordError('');

    if (!adminEmail) { setAdminEmailError('Email required.'); return; }
    if (!adminPassword) { setAdminPasswordError('Password required.'); return; }

    setAdminLoading(true);
    try {
      const data = await apiFetch(API.ADMIN_LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      if (data.requires_verification) {
        setAdminStep('verify');
        showStatusMsg(data.message || 'Verification code sent to your email.', 'info');
        return;
      }

      // Store auth — compatible with existing admin authStore (Zustand)
      setAuth(data.access_token, data.role);
      showStatusMsg('Admin login successful!', 'success');
      setTimeout(() => navigate('/admin/dashboard', { replace: true }), 500);
    } catch (err: any) {
      showStatusMsg(err.message || 'Admin login failed.', 'error');
      setAdminPasswordError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    hideStatus();
    if (!adminOtp) { showStatusMsg('Please enter the verification code.', 'error'); return; }
    setAdminLoading(true);
    try {
      const data = await apiFetch(`${API_BASE}/auth/admin/verify-login`, {
        method: 'POST',
        body: JSON.stringify({ email: adminEmail, code: adminOtp }),
      });
      setAuth(data.access_token, data.role);
      showStatusMsg('Admin verified and logged in successfully!', 'success');
      setTimeout(() => navigate('/admin/dashboard', { replace: true }), 500);
    } catch (err: any) {
      showStatusMsg(err.message || 'Verification failed.', 'error');
    } finally {
      setAdminLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN: Registration
  // ═══════════════════════════════════════════════════════════════════════════
  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    hideStatus();
    if (!regAdminName || !regAdminDept || !regAdminEmail || !regAdminPassword) {
      showStatusMsg('Please fill all required fields.', 'error');
      return;
    }
    if (regAdminPassword.length < 8) {
      showStatusMsg('Password must be at least 8 characters.', 'error');
      return;
    }
    setAdminRegSubmitting(true);
    try {
      await apiFetch(API.ADMIN_REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          name: regAdminName,
          department: regAdminDept,
          email: regAdminEmail,
          password: regAdminPassword,
        }),
      });
      showStatusMsg('Admin enrollment submitted! Please log in.', 'success');
      setAuthMode('signin');
      setRole('admin');
      setAdminEmail(regAdminEmail);
    } catch (err: any) {
      showStatusMsg(err.message || 'Admin enrollment failed.', 'error');
    } finally {
      setAdminRegSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // OTP Input Handlers
  // ═══════════════════════════════════════════════════════════════════════════
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setOtpError('');
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const newDigits = [...otpDigits];
      newDigits[index - 1] = '';
      setOtpDigits(newDigits);
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...otpDigits];
      pasted.split('').forEach((d, i) => { newDigits[i] = d; });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      otpRefs.current[nextIdx]?.focus();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Password Strength UI
  // ═══════════════════════════════════════════════════════════════════════════
  const renderPasswordStrength = (password: string) => {
    if (!password) return null;
    const { score, label, levelClass, rules } = evaluatePasswordStrength(password);
    return (
      <div className="password-strength-container">
        <div className="strength-header">
          <span className="strength-label-title">Password Strength:</span>
          <span className={`strength-level-text ${levelClass}`}>{label}</span>
        </div>
        <div className="strength-meter" data-level={score}>
          <div className="strength-bar" /><div className="strength-bar" />
          <div className="strength-bar" /><div className="strength-bar" />
        </div>
        <div className="strength-criteria">
          <span className={`criteria-item ${rules.length ? 'met' : ''}`}>
            <span className="criteria-icon">{rules.length ? '✓' : '○'}</span> 8+ chars
          </span>
          <span className={`criteria-item ${rules.case ? 'met' : ''}`}>
            <span className="criteria-icon">{rules.case ? '✓' : '○'}</span> Upper & lower
          </span>
          <span className={`criteria-item ${rules.number ? 'met' : ''}`}>
            <span className="criteria-icon">{rules.number ? '✓' : '○'}</span> Number (0-9)
          </span>
          <span className={`criteria-item ${rules.special ? 'met' : ''}`}>
            <span className="criteria-icon">{rules.special ? '✓' : '○'}</span> Symbol (@#$)
          </span>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Password Toggle Button
  // ═══════════════════════════════════════════════════════════════════════════
  const PasswordToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button type="button" className={`toggle-password-btn ${show ? 'is-active' : ''}`} onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'}>
      {!show ? (
        <svg className="eye-icon" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
      ) : (
        <svg className="eye-icon" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
      )}
    </button>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════════
  const stateOptions = ['Andhra Pradesh','Bihar','Gujarat','Haryana','Karnataka','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal','Other States/UT'];

  const renderStatusBanner = () => {
    if (!status.visible) return null;
    const icons: Record<StatusType, string> = { success: '✅', error: '⚠️', warning: '🔔', info: 'ℹ️' };
    return (
      <div className={`status-banner ${status.type}`} role="alert">
        <span className="status-icon">{icons[status.type]}</span>
        <div className="status-content"><p className="status-message">{status.message}</p></div>
        <button type="button" className="status-close-btn" onClick={hideStatus}>×</button>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEWS
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Farmer Sign In ────────────────────────────────────────────────────────
  const renderFarmerSignIn = () => (
    <div className="auth-view">
      {farmerStep === 'mobile' ? (
        <form className="auth-form" onSubmit={handleFarmerSendOtp} noValidate>
          <div className="form-group">
            <label htmlFor="farmer-mobile-input" className="form-label">Mobile Number <span className="required">*</span></label>
            <div className="input-with-prefix">
              <span className="input-prefix">
                <img src="https://flagcdn.com/w20/in.png" alt="India" className="flag-icon" width="18" height="13" />
                +91
              </span>
              <input type="tel" id="farmer-mobile-input" className={`form-input has-prefix ${mobileError ? 'is-invalid' : ''}`} placeholder="Enter 10-digit mobile number" maxLength={10} inputMode="numeric" value={mobile} onChange={e => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setMobileError(''); }} required />
            </div>
            <span className="field-error">{mobileError}</span>
          </div>
          <button type="submit" className="btn btn-primary" disabled={sendingOtp}>
            <span className="btn-text">{sendingOtp ? 'Sending OTP...' : 'Send OTP'}</span>
            {sendingOtp && <span className="btn-spinner" />}
          </button>
          <div className="auth-footer-links">
            <p className="footer-text">New farmer? <button type="button" className="btn-link" onClick={() => { setRegMobile(mobile); setAuthMode('signup'); }}>Create an account</button></p>
          </div>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleFarmerVerifyOtp} noValidate>
          <div className="otp-instruction-box">
            <div className="otp-header">
              <h3 className="otp-title">Enter OTP</h3>
              <button type="button" className="btn-link text-sm" onClick={() => { setFarmerStep('mobile'); setShowUnregistered(false); }}>Change Number</button>
            </div>
            <p className="otp-subtitle">OTP sent to: <strong>{maskedMobile}</strong></p>
          </div>
          <div className="form-group">
            <div className="otp-inputs-grid" onPaste={handleOtpPaste}>
              {otpDigits.map((d, i) => (
                <input key={i} type="text" className={`otp-digit ${d ? 'filled' : ''}`} maxLength={1} inputMode="numeric" value={d} ref={el => { otpRefs.current[i] = el; }} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} onFocus={e => (e.target as HTMLInputElement).select()} aria-label={`Digit ${i + 1}`} />
              ))}
            </div>
            <span className="field-error">{otpError}</span>
          </div>
          <div className="resend-container">
            {resendSeconds > 0 ? (
              <p className="timer-text">Resend OTP in <span className="timer-number">{resendSeconds}</span> seconds</p>
            ) : (
              <button type="button" className="btn-link" onClick={handleResendOtp}>Resend OTP</button>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={verifyingOtp}>
            <span className="btn-text">{verifyingOtp ? 'Verifying...' : 'Verify & Continue'}</span>
            {verifyingOtp && <span className="btn-spinner" />}
          </button>
          {showUnregistered && (
            <div className="unregistered-prompt">
              <p className="unregistered-text">Mobile number is not registered.</p>
              <button type="button" className="btn btn-secondary" onClick={() => { setRegMobile(mobile); setAuthMode('signup'); }}>Create Farmer Account</button>
            </div>
          )}
        </form>
      )}
    </div>
  );

  // ─── Farmer Sign Up ────────────────────────────────────────────────────────
  const renderFarmerSignUp = () => (
    <div className="auth-view">
      <div className="registration-header">
        <button type="button" className="back-button" onClick={() => { setAuthMode('signin'); setFarmerStep('mobile'); }}>← Back to Login</button>
        <h2 className="view-heading">Farmer Registration</h2>
        <p className="view-subheading">Complete your Kisan profile for digital mandi access & direct payments.</p>
      </div>
      <form className="auth-form multi-field-form" onSubmit={handleFarmerRegister} noValidate>
        <div className="form-row">
          <div className="form-group flex-1">
            <label className="form-label">Mobile Number <span className="required">*</span></label>
            <div className="input-with-prefix">
              <span className="input-prefix">+91</span>
              <input type="tel" className="form-input has-prefix" value={regMobile} onChange={e => setRegMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} required />
            </div>
          </div>
          <div className="form-group flex-1">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="e.g. Ramesh Patel" value={regName} onChange={e => setRegName(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email Address <span className="optional">(Optional)</span></label>
          <input type="email" className="form-input" placeholder="farmer@domain.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group flex-1">
            <label className="form-label">Village <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="Village name" value={regVillage} onChange={e => setRegVillage(e.target.value)} required />
          </div>
          <div className="form-group flex-1">
            <label className="form-label">Mandal / Taluk <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="Taluk / Tehsil" value={regMandal} onChange={e => setRegMandal(e.target.value)} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group flex-1">
            <label className="form-label">District <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="District" value={regDistrict} onChange={e => setRegDistrict(e.target.value)} required />
          </div>
          <div className="form-group flex-1">
            <label className="form-label">State <span className="required">*</span></label>
            <select className="form-select" value={regState} onChange={e => setRegState(e.target.value)} required>
              <option value="" disabled>Select State</option>
              {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group flex-1">
            <label className="form-label">Pincode <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="6-digit PIN" maxLength={6} value={regPincode} onChange={e => setRegPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
          </div>
          <div className="form-group flex-1">
            <label className="form-label">Land Area <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="e.g. 5.5 Acres" value={regLandArea} onChange={e => setRegLandArea(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Primary Crop <span className="required">*</span></label>
          <input type="text" className="form-input" placeholder="e.g. Paddy, Wheat, Cotton" value={regCrop} onChange={e => setRegCrop(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={regSubmitting}>
          <span className="btn-text">{regSubmitting ? 'Registering...' : 'Complete Registration & Enter'}</span>
          {regSubmitting && <span className="btn-spinner" />}
        </button>
        <div className="auth-footer-links">
          <p className="footer-text">Already registered? <button type="button" className="btn-link" onClick={() => { setAuthMode('signin'); setFarmerStep('mobile'); }}>Sign In</button></p>
        </div>
      </form>
    </div>
  );

  // ─── Operator Sign In ──────────────────────────────────────────────────────
  const renderOperatorSignIn = () => (
    <div className="auth-view">
      {opStep === 'login' ? (
        <form className="auth-form" onSubmit={handleOperatorLogin} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address <span className="required">*</span></label>
            <input type="email" className={`form-input ${opEmailError ? 'is-invalid' : ''}`} placeholder="operator@farm2market.gov.in" value={opEmail} onChange={e => { setOpEmail(e.target.value); setOpEmailError(''); }} autoComplete="username" required />
            <span className="field-error">{opEmailError}</span>
          </div>
          <div className="form-group">
            <label className="form-label">Password <span className="required">*</span></label>
            <div className="password-input-wrapper">
              <input type={showOpPassword ? 'text' : 'password'} className={`form-input has-icon-right ${opPasswordError ? 'is-invalid' : ''}`} placeholder="Enter operator password" value={opPassword} onChange={e => { setOpPassword(e.target.value); setOpPasswordError(''); }} autoComplete="current-password" required />
              <PasswordToggle show={showOpPassword} onToggle={() => setShowOpPassword(!showOpPassword)} />
            </div>
            <span className="field-error">{opPasswordError}</span>
            {renderPasswordStrength(opPassword)}
          </div>
          <div className="info-callout">
            <span className="info-icon">🛡️</span>
            <span className="info-text">Procurement Operator accounts require verified SMTP email credentials.</span>
          </div>
          {opShowUnverified && (
            <div className="unverified-box">
              <p className="unverified-msg">{opUnverifiedMsg}</p>
              <div className="unverified-actions">
                <button type="button" className="btn btn-outline-warning" onClick={handleResendOperatorVerification} disabled={opResending}>
                  <span className="btn-text">{opResending ? 'Sending...' : 'Resend Verification Email'}</span>
                  {opResending && <span className="btn-spinner" />}
                </button>
              </div>
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={opLoading}>
            <span className="btn-text">{opLoading ? 'Authenticating...' : 'Login'}</span>
            {opLoading && <span className="btn-spinner" />}
          </button>
          <div className="auth-footer-links">
            <p className="footer-text">New operator? <button type="button" className="btn-link" onClick={() => setAuthMode('signup')}>Register operator account</button></p>
          </div>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleOperatorVerify} noValidate>
          <div className="otp-instruction-box">
            <div className="otp-header">
              <h3 className="otp-title">Email Verification</h3>
              <button type="button" className="btn-link text-sm" onClick={() => setOpStep('login')}>Cancel</button>
            </div>
            <p className="otp-subtitle">A verification code has been sent to your email.</p>
          </div>
          <div className="form-group">
            <label className="form-label">Verification Code <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="Enter 6-digit code" maxLength={6} value={opOtp} onChange={e => setOpOtp(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={opLoading}>
            <span className="btn-text">{opLoading ? 'Verifying...' : 'Verify & Login'}</span>
            {opLoading && <span className="btn-spinner" />}
          </button>
        </form>
      )}
    </div>
  );

  // ─── Operator Sign Up ──────────────────────────────────────────────────────
  const renderOperatorSignUp = () => (
    <div className="auth-view">
      <div className="registration-header">
        <button type="button" className="back-button" onClick={() => setAuthMode('signin')}>← Back to Login</button>
        <h2 className="view-heading">Operator Onboarding</h2>
        <p className="view-subheading">Register procurement center credentials for mandi operations.</p>
      </div>
      <form className="auth-form multi-field-form" onSubmit={handleOperatorRegister} noValidate>
        <div className="form-row">
          <div className="form-group flex-1">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="e.g. Suresh Kumar" value={regOpName} onChange={e => setRegOpName(e.target.value)} required />
          </div>
          <div className="form-group flex-1">
            <label className="form-label">Official Email <span className="required">*</span></label>
            <input type="email" className="form-input" placeholder="suresh@farm2market.gov.in" value={regOpEmail} onChange={e => setRegOpEmail(e.target.value)} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group flex-1">
            <label className="form-label">Procurement Centre <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="APMC Main Mandi Hub #04" value={regOpCentre} onChange={e => setRegOpCentre(e.target.value)} required />
          </div>
          <div className="form-group flex-1">
            <label className="form-label">Mandi Code / ID <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="APMC-KA-58002" value={regOpMandiCode} onChange={e => setRegOpMandiCode(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Account Password <span className="required">*</span></label>
          <div className="password-input-wrapper">
            <input type={showRegOpPassword ? 'text' : 'password'} className="form-input has-icon-right" placeholder="Create secure operator password" value={regOpPassword} onChange={e => setRegOpPassword(e.target.value)} autoComplete="new-password" required />
            <PasswordToggle show={showRegOpPassword} onToggle={() => setShowRegOpPassword(!showRegOpPassword)} />
          </div>
          {renderPasswordStrength(regOpPassword)}
        </div>
        <button type="submit" className="btn btn-primary" disabled={opRegSubmitting}>
          <span className="btn-text">{opRegSubmitting ? 'Registering...' : 'Complete Operator Registration'}</span>
          {opRegSubmitting && <span className="btn-spinner" />}
        </button>
        <div className="auth-footer-links">
          <p className="footer-text">Already have an account? <button type="button" className="btn-link" onClick={() => setAuthMode('signin')}>Sign In</button></p>
        </div>
      </form>
    </div>
  );

  // ─── Admin Sign In ─────────────────────────────────────────────────────────
  const renderAdminSignIn = () => (
    <div className="auth-view">
      {adminStep === 'login' ? (
        <form className="auth-form" onSubmit={handleAdminLogin} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address <span className="required">*</span></label>
            <input type="email" className={`form-input ${adminEmailError ? 'is-invalid' : ''}`} placeholder="admin@farm2market.gov.in" value={adminEmail} onChange={e => { setAdminEmail(e.target.value); setAdminEmailError(''); }} autoComplete="username" required />
            <span className="field-error">{adminEmailError}</span>
          </div>
          <div className="form-group">
            <label className="form-label">Password <span className="required">*</span></label>
            <div className="password-input-wrapper">
              <input type={showAdminPassword ? 'text' : 'password'} className={`form-input has-icon-right ${adminPasswordError ? 'is-invalid' : ''}`} placeholder="Enter administrative password" value={adminPassword} onChange={e => { setAdminPassword(e.target.value); setAdminPasswordError(''); }} autoComplete="current-password" required />
              <PasswordToggle show={showAdminPassword} onToggle={() => setShowAdminPassword(!showAdminPassword)} />
            </div>
            <span className="field-error">{adminPasswordError}</span>
            {renderPasswordStrength(adminPassword)}
          </div>
          <div className="admin-security-badge">
            <span className="badge-lock">🔒</span>
            <span className="badge-text">256-Bit SSL Encrypted Admin Gateway</span>
          </div>
          <button type="submit" className="btn btn-primary btn-admin" disabled={adminLoading}>
            <span className="btn-text">{adminLoading ? 'Verifying...' : 'Secure Login'}</span>
            {adminLoading && <span className="btn-spinner" />}
          </button>
          <div className="auth-footer-links">
            <p className="footer-text">New administrative officer? <button type="button" className="btn-link" onClick={() => setAuthMode('signup')}>Request Authorization</button></p>
          </div>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleAdminVerify} noValidate>
          <div className="otp-instruction-box">
            <div className="otp-header">
              <h3 className="otp-title">Admin Email Verification</h3>
              <button type="button" className="btn-link text-sm" onClick={() => setAdminStep('login')}>Cancel</button>
            </div>
            <p className="otp-subtitle">A verification code has been sent to your administrative email.</p>
          </div>
          <div className="form-group">
            <label className="form-label">Verification Code <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="Enter 6-digit code" maxLength={6} value={adminOtp} onChange={e => setAdminOtp(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-admin" disabled={adminLoading}>
            <span className="btn-text">{adminLoading ? 'Verifying...' : 'Verify & Login'}</span>
            {adminLoading && <span className="btn-spinner" />}
          </button>
        </form>
      )}
    </div>
  );

  // ─── Admin Sign Up ─────────────────────────────────────────────────────────
  const renderAdminSignUp = () => (
    <div className="auth-view">
      <div className="registration-header">
        <button type="button" className="back-button" onClick={() => setAuthMode('signin')}>← Back to Login</button>
        <h2 className="view-heading">Admin Enrollment</h2>
        <p className="view-subheading">Request authorized administrative clearance for State APMC Operations.</p>
      </div>
      <form className="auth-form multi-field-form" onSubmit={handleAdminRegister} noValidate>
        <div className="form-row">
          <div className="form-group flex-1">
            <label className="form-label">Officer Name <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="e.g. Dr. Arvind Swaminathan" value={regAdminName} onChange={e => setRegAdminName(e.target.value)} required />
          </div>
          <div className="form-group flex-1">
            <label className="form-label">Department / Wing <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="State Procurement Directorate" value={regAdminDept} onChange={e => setRegAdminDept(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Official Ministry Email <span className="required">*</span></label>
          <input type="email" className="form-input" placeholder="officer@farm2market.gov.in" value={regAdminEmail} onChange={e => setRegAdminEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Master Passphrase <span className="required">*</span></label>
          <div className="password-input-wrapper">
            <input type={showRegAdminPassword ? 'text' : 'password'} className="form-input has-icon-right" placeholder="Min 8 chars with mixed case and symbols" value={regAdminPassword} onChange={e => setRegAdminPassword(e.target.value)} autoComplete="new-password" required />
            <PasswordToggle show={showRegAdminPassword} onToggle={() => setShowRegAdminPassword(!showRegAdminPassword)} />
          </div>
          {renderPasswordStrength(regAdminPassword)}
        </div>
        <button type="submit" className="btn btn-primary btn-admin" disabled={adminRegSubmitting}>
          <span className="btn-text">{adminRegSubmitting ? 'Processing...' : 'Submit Clearance Request'}</span>
          {adminRegSubmitting && <span className="btn-spinner" />}
        </button>
        <div className="auth-footer-links">
          <p className="footer-text">Already have credentials? <button type="button" className="btn-link" onClick={() => setAuthMode('signin')}>Sign In</button></p>
        </div>
      </form>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // CURRENT VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  const renderCurrentView = () => {
    if (showSuccess && successData) {
      return (
        <div className="auth-view">
          <div className="success-card">
            <div className="success-icon-wrap"><span className="success-check-icon">✓</span></div>
            <h2 className="success-heading">{successData.greeting}</h2>
            <p className="success-badge">{successData.roleBadge}</p>
            <div className="user-details-summary">
              {successData.details.map((d, i) => (
                <div key={i} className="summary-row">
                  <span className="summary-label">{d.label}:</span>
                  <span className="summary-value">{d.value}</span>
                </div>
              ))}
            </div>
            <div className="success-actions">
              <button type="button" className="btn btn-primary" onClick={() => navigate(successData.redirectUrl, { replace: true })}>Proceed to Dashboard →</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowSuccess(false); }}>Sign Out</button>
            </div>
          </div>
        </div>
      );
    }

    if (authMode === 'signin') {
      if (role === 'farmer') return renderFarmerSignIn();
      if (role === 'operator') return renderOperatorSignIn();
      if (role === 'admin') return renderAdminSignIn();
    } else {
      if (role === 'farmer') return renderFarmerSignUp();
      if (role === 'operator') return renderOperatorSignUp();
      if (role === 'admin') return renderAdminSignUp();
    }
    return null;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="f2m-login-root">
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Full-Screen Background */}
      <div className="bg-container" aria-hidden="true">
        <div className="bg-image" />
        <div className="bg-overlay" />
      </div>

      {/* Main Auth Shell */}
      <main className="auth-wrapper">
        <div className="card-container">
          <section className="auth-card">

            {/* Brand Header */}
            <header className="brand-header">
              <div className="brand-badge">
                <span className="govt-icon">🌾</span>
                <span className="govt-label">NATIONAL AGRICULTURAL ACCESS PORTAL</span>
              </div>
              <div className="brand-logo-wrap">
                <h1 className="brand-title">Farm<span className="brand-number">2</span>Market</h1>
              </div>
              <p className="brand-tagline">From Farm to Market, Made Smarter.</p>
            </header>

            {/* Auth Mode Switch */}
            {!showSuccess && (
              <div className="auth-mode-switch-wrapper">
                <div className="auth-mode-switch" role="tablist">
                  <button type="button" className={`auth-mode-tab ${authMode === 'signin' ? 'active' : ''}`} onClick={() => setAuthMode('signin')} role="tab" aria-selected={authMode === 'signin'}>
                    <span className="tab-icon">🔑</span><span className="tab-title">Sign In</span>
                  </button>
                  <button type="button" className={`auth-mode-tab ${authMode === 'signup' ? 'active' : ''}`} onClick={() => setAuthMode('signup')} role="tab" aria-selected={authMode === 'signup'}>
                    <span className="tab-icon">✨</span><span className="tab-title">Sign Up / Register</span>
                  </button>
                </div>
              </div>
            )}

            {/* Role Selection */}
            {!showSuccess && (
              <nav className="role-selector-section" aria-label="Select User Role">
                <label className="role-section-label">{authMode === 'signin' ? 'Sign in as' : 'Register as'}</label>
                <div className="role-pills" role="radiogroup">
                  <button type="button" className={`role-pill ${role === 'farmer' ? 'active' : ''}`} data-role="farmer" onClick={() => setRole('farmer')} role="radio" aria-checked={role === 'farmer'}>
                    <span className="role-icon">🌾</span><span className="role-text">Farmer</span>
                  </button>
                  <button type="button" className={`role-pill ${role === 'operator' ? 'active' : ''}`} data-role="operator" onClick={() => setRole('operator')} role="radio" aria-checked={role === 'operator'}>
                    <span className="role-icon">👨‍💼</span><span className="role-text">Operator</span>
                  </button>
                  <button type="button" className={`role-pill ${role === 'admin' ? 'active' : ''}`} data-role="admin" onClick={() => setRole('admin')} role="radio" aria-checked={role === 'admin'}>
                    <span className="role-icon">📊</span><span className="role-text">Admin</span>
                  </button>
                </div>
              </nav>
            )}

            {/* Dynamic Form */}
            <div className="form-container">
              {renderStatusBanner()}
              {renderCurrentView()}
            </div>

            {/* Footer */}
            <footer className="card-footer">
              <div className="security-meta">
                <span className="meta-dot" />
                <span>Digital Agriculture Infrastructure System</span>
              </div>
              <p className="copyright-meta">© 2026 Farm2Market. Ministry of Agriculture & Farmer Welfare.</p>
            </footer>

          </section>
        </div>
      </main>
    </div>
  );
}
