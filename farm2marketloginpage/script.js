/**
 * Farm2Market Authentication Engine
 * Pure Vanilla JavaScript (ECMAScript 2022)
 * Strictly No Frameworks / No Libraries
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. STATE & CONSTANTS
  // ==========================================================================
  const STATE = {
    authMode: 'signin', // 'signin' | 'signup'
    currentRole: 'farmer', // 'farmer' | 'operator' | 'admin'
    farmerAuthStep: 'mobile', // 'mobile' | 'otp' | 'register'
    mobileNumber: '',
    maskedMobile: '',
    resendTimerInterval: null,
    resendSecondsLeft: 30,
    activeToken: null,
    currentUser: null,
  };

  // API Endpoints Base
  const API = {
    FARMER_SEND_OTP: '/api/v1/auth/farmer/send-otp',
    FARMER_VERIFY_OTP: '/api/v1/auth/farmer/verify-otp',
    FARMER_REGISTER: '/api/v1/auth/farmer/register',
    OPERATOR_LOGIN: '/api/v1/auth/operator/login',
    OPERATOR_REGISTER: '/api/v1/auth/operator/register',
    OPERATOR_RESEND_VERIFICATION: '/api/v1/auth/operator/resend-verification',
    OPERATOR_VERIFY_EMAIL: '/api/v1/auth/operator/verify-email',
    ADMIN_LOGIN: '/api/v1/auth/admin/login',
    ADMIN_REGISTER: '/api/v1/auth/admin/register',
  };

  // ==========================================================================
  // 2. DOM ELEMENT REFERENCES
  // ==========================================================================
  const DOM = {
    // Auth Mode Switcher (Sign In vs Sign Up)
    authTabSignin: document.getElementById('auth-tab-signin'),
    authTabSignup: document.getElementById('auth-tab-signup'),
    roleSectionLabel: document.getElementById('role-section-label'),

    // Role Buttons
    roleBtns: document.querySelectorAll('.role-pill'),
    
    // Views
    viewFarmerLogin: document.getElementById('view-farmer-login'),
    viewFarmerSignup: document.getElementById('view-farmer-signup'),
    viewOperatorLogin: document.getElementById('view-operator-login'),
    viewOperatorSignup: document.getElementById('view-operator-signup'),
    viewAdminLogin: document.getElementById('view-admin-login'),
    viewAdminSignup: document.getElementById('view-admin-signup'),
    viewSuccess: document.getElementById('view-authenticated-success'),
    
    // Status Banner
    statusBanner: document.getElementById('status-banner'),
    statusMessage: document.getElementById('status-message'),
    statusIcon: document.getElementById('status-icon'),
    statusCloseBtn: document.getElementById('status-close-btn'),

    // Farmer Mobile Form
    formFarmerMobile: document.getElementById('form-farmer-mobile'),
    farmerMobileInput: document.getElementById('farmer-mobile-input'),
    farmerMobileError: document.getElementById('farmer-mobile-error'),
    btnFarmerSendOtp: document.getElementById('btn-farmer-send-otp'),
    linkToFarmerSignup: document.getElementById('link-to-farmer-signup'),

    // Farmer OTP Form
    formFarmerOtp: document.getElementById('form-farmer-otp'),
    otpTargetDisplay: document.getElementById('otp-target-display'),
    demoOtpHelper: document.getElementById('demo-otp-helper'),
    demoOtpVal: document.getElementById('demo-otp-val'),
    btnAutoFillOtp: document.getElementById('btn-auto-fill-otp'),
    btnChangeMobile: document.getElementById('btn-change-mobile'),
    otpInputs: document.querySelectorAll('.otp-digit'),
    farmerOtpError: document.getElementById('farmer-otp-error'),
    resendTimerText: document.getElementById('resend-timer-text'),
    otpTimerCount: document.getElementById('otp-timer-count'),
    btnResendOtp: document.getElementById('btn-resend-otp'),
    btnFarmerVerifyOtp: document.getElementById('btn-farmer-verify-otp'),
    unregisteredAlertBox: document.getElementById('unregistered-alert-box'),
    btnCreateUnregAccount: document.getElementById('btn-create-unregistered-account'),

    // Farmer Registration Form
    formFarmerRegister: document.getElementById('form-farmer-register'),
    btnBackToFarmerLogin: document.getElementById('btn-back-to-farmer-login'),
    linkBackToLogin: document.getElementById('link-back-to-login'),
    regMobile: document.getElementById('reg-mobile'),
    regName: document.getElementById('reg-name'),
    regEmail: document.getElementById('reg-email'),
    regVillage: document.getElementById('reg-village'),
    regMandal: document.getElementById('reg-mandal'),
    regDistrict: document.getElementById('reg-district'),
    regState: document.getElementById('reg-state'),
    regPincode: document.getElementById('reg-pincode'),
    regLandArea: document.getElementById('reg-land-area'),
    regCrop: document.getElementById('reg-crop'),
    btnSubmitFarmerReg: document.getElementById('btn-submit-farmer-reg'),

    // Operator Login Form
    formOperatorLogin: document.getElementById('form-operator-login'),
    operatorEmailInput: document.getElementById('operator-email-input'),
    operatorPasswordInput: document.getElementById('operator-password-input'),
    operatorEmailError: document.getElementById('operator-email-error'),
    operatorPasswordError: document.getElementById('operator-password-error'),
    operatorUnverifiedBox: document.getElementById('operator-unverified-box'),
    operatorUnverifiedMsg: document.getElementById('operator-unverified-msg'),
    btnResendOperatorVerif: document.getElementById('btn-resend-operator-verification'),
    btnQuickVerifyOperator: document.getElementById('btn-quick-verify-operator'),
    btnOperatorLogin: document.getElementById('btn-operator-login'),
    linkToOperatorSignup: document.getElementById('link-to-operator-signup'),

    // Operator Signup Form
    formOperatorRegister: document.getElementById('form-operator-register'),
    btnBackToOperatorLogin: document.getElementById('btn-back-to-operator-login'),
    linkBackToOperatorLogin: document.getElementById('link-back-to-operator-login'),
    regOpName: document.getElementById('reg-op-name'),
    regOpEmail: document.getElementById('reg-op-email'),
    regOpCentre: document.getElementById('reg-op-centre'),
    regOpMandiCode: document.getElementById('reg-op-mandi-code'),
    regOpPassword: document.getElementById('reg-op-password'),
    regOpNameError: document.getElementById('reg-op-name-error'),
    regOpEmailError: document.getElementById('reg-op-email-error'),
    regOpCentreError: document.getElementById('reg-op-centre-error'),
    regOpMandiCodeError: document.getElementById('reg-op-mandi-code-error'),
    regOpPasswordError: document.getElementById('reg-op-password-error'),
    btnSubmitOperatorReg: document.getElementById('btn-submit-operator-reg'),

    // Admin Login Form
    formAdminLogin: document.getElementById('form-admin-login'),
    adminEmailInput: document.getElementById('admin-email-input'),
    adminPasswordInput: document.getElementById('admin-password-input'),
    adminEmailError: document.getElementById('admin-email-error'),
    adminPasswordError: document.getElementById('admin-password-error'),
    btnAdminLogin: document.getElementById('btn-admin-login'),
    linkToAdminSignup: document.getElementById('link-to-admin-signup'),

    // Admin Signup Form
    formAdminRegister: document.getElementById('form-admin-register'),
    btnBackToAdminLogin: document.getElementById('btn-back-to-admin-login'),
    linkBackToAdminLogin: document.getElementById('link-back-to-admin-login'),
    regAdminName: document.getElementById('reg-admin-name'),
    regAdminDept: document.getElementById('reg-admin-dept'),
    regAdminEmail: document.getElementById('reg-admin-email'),
    regAdminPassword: document.getElementById('reg-admin-password'),
    regAdminNameError: document.getElementById('reg-admin-name-error'),
    regAdminDeptError: document.getElementById('reg-admin-dept-error'),
    regAdminEmailError: document.getElementById('reg-admin-email-error'),
    regAdminPasswordError: document.getElementById('reg-admin-password-error'),
    btnSubmitAdminReg: document.getElementById('btn-submit-admin-reg'),

    // Password Visibility Toggles
    togglePasswordBtns: document.querySelectorAll('.toggle-password-btn'),

    // Success Screen
    successHeading: document.getElementById('success-user-greeting'),
    successBadge: document.getElementById('success-role-badge'),
    successDetails: document.getElementById('success-user-details'),
    btnContinueDashboard: document.getElementById('btn-continue-dashboard'),
    btnAuthSignout: document.getElementById('btn-auth-signout'),
  };

  // ==========================================================================
  // 3. UI UTILITIES & HELPERS
  // ==========================================================================

  /**
   * Display contextual status banner
   */
  function showStatus(message, type = 'info') {
    if (!DOM.statusBanner) return;

    DOM.statusBanner.classList.remove('hidden', 'error', 'success', 'warning');
    DOM.statusBanner.classList.add(type);
    DOM.statusMessage.textContent = message;

    const icons = {
      success: '✅',
      error: '⚠️',
      warning: '🔔',
      info: 'ℹ️',
    };
    DOM.statusIcon.textContent = icons[type] || 'ℹ️';

    // Auto-scroll slightly if needed
    DOM.statusBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideStatus() {
    if (DOM.statusBanner) {
      DOM.statusBanner.classList.add('hidden');
    }
  }

  /**
   * Toggle button loading spinner
   */
  function setButtonLoading(button, isLoading, customText = null) {
    if (!button) return;
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.btn-spinner');

    if (isLoading) {
      button.disabled = true;
      if (spinner) spinner.classList.remove('hidden');
      if (customText && btnText) btnText.textContent = customText;
    } else {
      button.disabled = false;
      if (spinner) spinner.classList.add('hidden');
      if (customText && btnText) btnText.textContent = customText;
    }
  }

  /**
   * Show field-level validation error
   */
  function setFieldError(errorElement, inputElement, message) {
    if (errorElement) errorElement.textContent = message || '';
    if (inputElement) {
      if (message) {
        inputElement.classList.add('is-invalid');
      } else {
        inputElement.classList.remove('is-invalid');
      }
    }
  }

  /**
   * Clear all field errors in a given form
   */
  function clearFormErrors(form) {
    if (!form) return;
    const errors = form.querySelectorAll('.field-error');
    errors.forEach(el => el.textContent = '');
    const inputs = form.querySelectorAll('.is-invalid');
    inputs.forEach(el => el.classList.remove('is-invalid'));
  }

  // ==========================================================================
  // 4. AUTH MODE & ROLE SWITCHING CONTROLLER
  // ==========================================================================
  function setAuthMode(mode) {
    STATE.authMode = mode;
    updateActiveView();
  }

  function setActiveRole(role) {
    STATE.currentRole = role;
    updateActiveView();
  }

  function updateActiveView() {
    hideStatus();

    // 1. Update Auth Mode Tabs (Sign In vs Sign Up)
    if (DOM.authTabSignin && DOM.authTabSignup) {
      const isSignIn = STATE.authMode === 'signin';
      DOM.authTabSignin.classList.toggle('active', isSignIn);
      DOM.authTabSignin.setAttribute('aria-selected', isSignIn ? 'true' : 'false');

      DOM.authTabSignup.classList.toggle('active', !isSignIn);
      DOM.authTabSignup.setAttribute('aria-selected', !isSignIn ? 'true' : 'false');
    }

    // 2. Update Role Section Heading Label
    if (DOM.roleSectionLabel) {
      DOM.roleSectionLabel.textContent = STATE.authMode === 'signin' ? 'Sign in as' : 'Register as';
    }

    // 3. Update Role Pill Buttons
    DOM.roleBtns.forEach(btn => {
      const isMatch = btn.dataset.role === STATE.currentRole;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
    });

    // 4. Hide all view containers
    if (DOM.viewFarmerLogin) DOM.viewFarmerLogin.classList.add('hidden');
    if (DOM.viewFarmerSignup) DOM.viewFarmerSignup.classList.add('hidden');
    if (DOM.viewOperatorLogin) DOM.viewOperatorLogin.classList.add('hidden');
    if (DOM.viewOperatorSignup) DOM.viewOperatorSignup.classList.add('hidden');
    if (DOM.viewAdminLogin) DOM.viewAdminLogin.classList.add('hidden');
    if (DOM.viewAdminSignup) DOM.viewAdminSignup.classList.add('hidden');
    if (DOM.viewSuccess) DOM.viewSuccess.classList.add('hidden');

    // 5. Activate the view corresponding to current (authMode, currentRole)
    if (STATE.authMode === 'signin') {
      if (STATE.currentRole === 'farmer') {
        DOM.viewFarmerLogin.classList.remove('hidden');
        if (STATE.farmerAuthStep === 'otp') {
          DOM.formFarmerMobile.classList.add('hidden');
          DOM.formFarmerOtp.classList.remove('hidden');
        } else {
          DOM.formFarmerMobile.classList.remove('hidden');
          DOM.formFarmerOtp.classList.add('hidden');
          DOM.farmerMobileInput.focus();
        }
      } else if (STATE.currentRole === 'operator') {
        DOM.viewOperatorLogin.classList.remove('hidden');
        updatePasswordStrengthUI('operator', DOM.operatorPasswordInput.value);
        DOM.operatorEmailInput.focus();
      } else if (STATE.currentRole === 'admin') {
        DOM.viewAdminLogin.classList.remove('hidden');
        updatePasswordStrengthUI('admin', DOM.adminPasswordInput.value);
        DOM.adminEmailInput.focus();
      }
    } else {
      // SIGN UP / REGISTRATION MODE
      if (STATE.currentRole === 'farmer') {
        DOM.viewFarmerSignup.classList.remove('hidden');
        if (!DOM.regMobile.value && STATE.mobileNumber) {
          DOM.regMobile.value = STATE.mobileNumber;
        }
        DOM.regName.focus();
      } else if (STATE.currentRole === 'operator') {
        DOM.viewOperatorSignup.classList.remove('hidden');
        updatePasswordStrengthUI('reg-operator', DOM.regOpPassword.value);
        DOM.regOpName.focus();
      } else if (STATE.currentRole === 'admin') {
        DOM.viewAdminSignup.classList.remove('hidden');
        updatePasswordStrengthUI('reg-admin', DOM.regAdminPassword.value);
        DOM.regAdminName.focus();
      }
    }
  }

  // ==========================================================================
  // 5. OTP BOXES INTERACTIVITY ENGINE
  // ==========================================================================
  function initOtpInputBehaviors() {
    const inputs = Array.from(DOM.otpInputs);

    inputs.forEach((input, index) => {
      // 1. Input event (Digit typed)
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        // Keep only single numeric digit
        if (!/^\d$/.test(val)) {
          e.target.value = '';
          input.classList.remove('filled');
          return;
        }

        input.classList.add('filled');
        setFieldError(DOM.farmerOtpError, null, '');

        // Move to next input
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        } else {
          // All digits entered - auto-verify convenience
          const fullOtp = getEnteredOtp();
          if (fullOtp.length === 6) {
            DOM.btnFarmerVerifyOtp.focus();
          }
        }
      });

      // 2. Keydown event (Backspace, Arrow keys)
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
          if (!input.value && index > 0) {
            inputs[index - 1].focus();
            inputs[index - 1].value = '';
            inputs[index - 1].classList.remove('filled');
          } else {
            input.value = '';
            input.classList.remove('filled');
          }
        } else if (e.key === 'ArrowLeft' && index > 0) {
          inputs[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });

      // 3. Paste event (e.g. full 6-digit OTP copied)
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData).getData('text');
        const digits = pastedData.replace(/\D/g, '').slice(0, 6);

        if (digits.length > 0) {
          digits.split('').forEach((d, i) => {
            if (inputs[i]) {
              inputs[i].value = d;
              inputs[i].classList.add('filled');
            }
          });

          const nextIndex = Math.min(digits.length, inputs.length - 1);
          inputs[nextIndex].focus();

          if (digits.length === 6) {
            setFieldError(DOM.farmerOtpError, null, '');
            DOM.btnFarmerVerifyOtp.focus();
          }
        }
      });

      // 4. Focus auto-select
      input.addEventListener('focus', () => {
        input.select();
      });
    });
  }

  function getEnteredOtp() {
    return Array.from(DOM.otpInputs).map(inp => inp.value).join('');
  }

  function clearOtpInputs() {
    DOM.otpInputs.forEach(inp => {
      inp.value = '';
      inp.classList.remove('filled');
    });
    if (DOM.otpInputs[0]) DOM.otpInputs[0].focus();
  }

  function fillOtpCode(code) {
    const chars = String(code).split('');
    DOM.otpInputs.forEach((inp, idx) => {
      if (chars[idx]) {
        inp.value = chars[idx];
        inp.classList.add('filled');
      } else {
        inp.value = '';
        inp.classList.remove('filled');
      }
    });
    setFieldError(DOM.farmerOtpError, null, '');
    DOM.btnFarmerVerifyOtp.focus();
  }

  // ==========================================================================
  // 6. TIMER MANAGEMENT (30s Resend Cooldown)
  // ==========================================================================
  function startResendCountdown(duration = 30) {
    clearInterval(STATE.resendTimerInterval);
    STATE.resendSecondsLeft = duration;

    DOM.resendTimerText.classList.remove('hidden');
    DOM.btnResendOtp.classList.add('hidden');
    DOM.otpTimerCount.textContent = STATE.resendSecondsLeft;

    STATE.resendTimerInterval = setInterval(() => {
      STATE.resendSecondsLeft -= 1;
      DOM.otpTimerCount.textContent = STATE.resendSecondsLeft;

      if (STATE.resendSecondsLeft <= 0) {
        clearInterval(STATE.resendTimerInterval);
        DOM.resendTimerText.classList.add('hidden');
        DOM.btnResendOtp.classList.remove('hidden');
      }
    }, 1000);
  }

  // ==========================================================================
  // 7. FARMER AUTHENTICATION FLOWS (REAL FETCH)
  // ==========================================================================

  // Step 1: Send OTP to Mobile
  async function handleFarmerSendOtp(e) {
    e.preventDefault();
    hideStatus();
    clearFormErrors(DOM.formFarmerMobile);

    const rawMobile = DOM.farmerMobileInput.value.trim();

    // Validation: 10 digit Indian number starting with 6-9
    if (!rawMobile) {
      setFieldError(DOM.farmerMobileError, DOM.farmerMobileInput, 'Please enter your 10-digit mobile number.');
      DOM.farmerMobileInput.focus();
      return;
    }

    if (!/^[6-9]\d{9}$/.test(rawMobile)) {
      setFieldError(DOM.farmerMobileError, DOM.farmerMobileInput, 'Invalid mobile number. Must be 10 digits starting with 6, 7, 8, or 9.');
      DOM.farmerMobileInput.focus();
      return;
    }

    setButtonLoading(DOM.btnFarmerSendOtp, true, 'Sending OTP...');

    try {
      const response = await fetch(API.FARMER_SEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: rawMobile }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to dispatch OTP. Please try again.');
      }

      // Success: Advance to OTP View
      STATE.mobileNumber = data.mobile || rawMobile;
      STATE.maskedMobile = data.masked_mobile || `+91 ******${rawMobile.slice(6)}`;
      STATE.farmerAuthStep = 'otp';

      DOM.otpTargetDisplay.textContent = STATE.maskedMobile;

      // Show test demo OTP helper for effortless instant verification
      if (data.demo_otp) {
        DOM.demoOtpHelper.classList.remove('hidden');
        DOM.demoOtpVal.textContent = data.demo_otp;
        DOM.btnAutoFillOtp.onclick = () => fillOtpCode(data.demo_otp);
      } else {
        DOM.demoOtpHelper.classList.add('hidden');
      }

      // Transition views
      DOM.formFarmerMobile.classList.add('hidden');
      DOM.formFarmerOtp.classList.remove('hidden');
      DOM.unregisteredAlertBox.classList.add('hidden');
      clearOtpInputs();

      // Start 30s timer
      startResendCountdown(data.resend_cooldown_seconds || 30);
      showStatus(`OTP sent successfully to ${STATE.maskedMobile}`, 'success');

    } catch (err) {
      showStatus(err.message || 'Network communication error.', 'error');
      setFieldError(DOM.farmerMobileError, DOM.farmerMobileInput, err.message);
    } finally {
      setButtonLoading(DOM.btnFarmerSendOtp, false, 'Send OTP');
    }
  }

  // Step 2: Verify Entered OTP
  async function handleFarmerVerifyOtp(e) {
    e.preventDefault();
    hideStatus();
    setFieldError(DOM.farmerOtpError, null, '');

    const otp = getEnteredOtp();

    if (otp.length !== 6) {
      setFieldError(DOM.farmerOtpError, null, 'Please enter all 6 digits of the received OTP.');
      return;
    }

    setButtonLoading(DOM.btnFarmerVerifyOtp, true, 'Verifying...');

    try {
      const response = await fetch(API.FARMER_VERIFY_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: STATE.mobileNumber,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok && data.status === 'error') {
        throw new Error(data.message || 'Verification failed.');
      }

      // Check if mobile is unregistered
      if (data.status === 'unregistered' || data.requires_registration) {
        DOM.unregisteredAlertBox.classList.remove('hidden');
        showStatus('Mobile number is not registered in the agricultural database.', 'warning');
        return;
      }

      // Successful Farmer Authentication
      STATE.activeToken = data.token;
      STATE.currentUser = data.user;

      showAuthenticatedScreen({
        greeting: `Welcome, ${data.user.name || 'Kisan'}!`,
        roleBadge: 'Verified Farmer • Digital Mandi Pass',
        details: [
          { label: 'Mobile Number', value: `+91 ${data.user.mobile}` },
          { label: 'Village / Mandal', value: `${data.user.village || 'N/A'}, ${data.user.mandal || 'N/A'}` },
          { label: 'District / State', value: `${data.user.district || 'N/A'}, ${data.user.state || 'N/A'}` },
          { label: 'Land Area', value: data.user.land_area || 'Registered Parcel' },
          { label: 'Primary Crop', value: data.user.primary_crop || 'Multi-Crop' },
        ],
        redirectUrl: data.redirect_url,
      });

    } catch (err) {
      showStatus(err.message || 'OTP verification error.', 'error');
      setFieldError(DOM.farmerOtpError, null, err.message);
    } finally {
      setButtonLoading(DOM.btnFarmerVerifyOtp, false, 'Verify & Continue');
    }
  }

  // Step 3: Resend OTP Action
  async function handleFarmerResendOtp() {
    hideStatus();
    DOM.btnResendOtp.disabled = true;
    DOM.btnResendOtp.textContent = 'Sending...';

    try {
      const response = await fetch(API.FARMER_SEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: STATE.mobileNumber }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to resend OTP.');
      }

      if (data.demo_otp) {
        DOM.demoOtpVal.textContent = data.demo_otp;
        DOM.btnAutoFillOtp.onclick = () => fillOtpCode(data.demo_otp);
      }

      clearOtpInputs();
      startResendCountdown(30);
      showStatus('A new 6-digit OTP has been dispatched to your mobile.', 'success');

    } catch (err) {
      showStatus(err.message || 'Failed to resend OTP.', 'error');
      DOM.btnResendOtp.disabled = false;
      DOM.btnResendOtp.textContent = 'Resend OTP';
    }
  }

  // Step 4: Farmer Registration Form Submission
  async function handleFarmerRegister(e) {
    e.preventDefault();
    hideStatus();
    clearFormErrors(DOM.formFarmerRegister);

    const payload = {
      mobile: DOM.regMobile.value.trim(),
      name: DOM.regName.value.trim(),
      email: DOM.regEmail.value.trim(),
      village: DOM.regVillage.value.trim(),
      mandal: DOM.regMandal.value.trim(),
      district: DOM.regDistrict.value.trim(),
      state: DOM.regState.value,
      pincode: DOM.regPincode.value.trim(),
      land_area: DOM.regLandArea.value.trim(),
      primary_crop: DOM.regCrop.value.trim(),
    };

    // Client validation
    let hasError = false;

    if (!payload.mobile || !/^[6-9]\d{9}$/.test(payload.mobile)) {
      setFieldError(document.getElementById('reg-mobile-error'), DOM.regMobile, 'Valid 10-digit mobile required');
      hasError = true;
    }
    if (!payload.name) {
      setFieldError(document.getElementById('reg-name-error'), DOM.regName, 'Full name is required');
      hasError = true;
    }
    if (!payload.village) {
      setFieldError(document.getElementById('reg-village-error'), DOM.regVillage, 'Village name required');
      hasError = true;
    }
    if (!payload.mandal) {
      setFieldError(document.getElementById('reg-mandal-error'), DOM.regMandal, 'Mandal/Taluk required');
      hasError = true;
    }
    if (!payload.district) {
      setFieldError(document.getElementById('reg-district-error'), DOM.regDistrict, 'District required');
      hasError = true;
    }
    if (!payload.state) {
      setFieldError(document.getElementById('reg-state-error'), DOM.regState, 'Please select your State');
      hasError = true;
    }
    if (!payload.pincode || !/^\d{6}$/.test(payload.pincode)) {
      setFieldError(document.getElementById('reg-pincode-error'), DOM.regPincode, 'Valid 6-digit PIN required');
      hasError = true;
    }
    if (!payload.land_area) {
      setFieldError(document.getElementById('reg-land-area-error'), DOM.regLandArea, 'Land area required');
      hasError = true;
    }
    if (!payload.primary_crop) {
      setFieldError(document.getElementById('reg-crop-error'), DOM.regCrop, 'Primary crop required');
      hasError = true;
    }

    if (hasError) {
      showStatus('Please fill in all mandatory registration fields.', 'error');
      return;
    }

    setButtonLoading(DOM.btnSubmitFarmerReg, true, 'Registering Farmer...');

    try {
      const response = await fetch(API.FARMER_REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Registration failed.');
      }

      STATE.activeToken = data.token;
      STATE.currentUser = data.user;

      showAuthenticatedScreen({
        greeting: `Welcome, ${data.user.name}!`,
        roleBadge: 'Newly Registered Farmer • Kisan ID Active',
        details: [
          { label: 'Mobile Number', value: `+91 ${data.user.mobile}` },
          { label: 'Location', value: `${data.user.village}, ${data.user.district}, ${data.user.state}` },
          { label: 'Pincode', value: data.user.pincode },
          { label: 'Farm Land Area', value: data.user.land_area },
          { label: 'Primary Crop', value: data.user.primary_crop },
        ],
        redirectUrl: data.redirect_url,
      });

    } catch (err) {
      showStatus(err.message || 'Registration request failed.', 'error');
    } finally {
      setButtonLoading(DOM.btnSubmitFarmerReg, false, 'Complete Registration & Enter');
    }
  }

  // Switch to Registration Flow
  function openFarmerRegistration(presetMobile = '') {
    hideStatus();
    if (presetMobile || STATE.mobileNumber) {
      DOM.regMobile.value = presetMobile || STATE.mobileNumber;
    }
    clearFormErrors(DOM.formFarmerRegister);
    setAuthMode('signup');
    setActiveRole('farmer');
  }

  function backToFarmerLogin() {
    hideStatus();
    STATE.farmerAuthStep = 'mobile';
    setAuthMode('signin');
    setActiveRole('farmer');
  }

  // ==========================================================================
  // 8. OPERATOR AUTHENTICATION (LOGIN, SMTP VERIF, & REGISTRATION)
  // ==========================================================================
  async function handleOperatorLogin(e) {
    e.preventDefault();
    hideStatus();
    clearFormErrors(DOM.formOperatorLogin);
    DOM.operatorUnverifiedBox.classList.add('hidden');

    const email = DOM.operatorEmailInput.value.trim();
    const password = DOM.operatorPasswordInput.value;

    let hasError = false;
    if (!email) {
      setFieldError(DOM.operatorEmailError, DOM.operatorEmailInput, 'Please enter your operator email address.');
      hasError = true;
    }
    if (!password) {
      setFieldError(DOM.operatorPasswordError, DOM.operatorPasswordInput, 'Please enter your password.');
      hasError = true;
    }

    if (hasError) return;

    setButtonLoading(DOM.btnOperatorLogin, true, 'Authenticating...');

    try {
      const response = await fetch(API.OPERATOR_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Check for Unverified SMTP Email state (403 or unverified status)
      if (response.status === 403 || data.status === 'unverified') {
        DOM.operatorUnverifiedBox.classList.remove('hidden');
        DOM.operatorUnverifiedMsg.textContent = data.message || 'Please verify your email before logging in.';
        showStatus('Operator account requires verified SMTP email credentials.', 'warning');
        return;
      }

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Invalid operator email or password.');
      }

      // Successful Operator Login
      STATE.activeToken = data.token;
      STATE.currentUser = data.user;

      showAuthenticatedScreen({
        greeting: `Welcome, ${data.user.name || 'Operator'}!`,
        roleBadge: 'Mandi Procurement Operator',
        details: [
          { label: 'Official Email', value: data.user.email },
          { label: 'Procurement Centre', value: data.user.centre_name || 'APMC Yard #04' },
          { label: 'Mandi Code', value: data.user.mandi_code || 'APMC-KA-58002' },
          { label: 'Status', value: 'SMTP Verified • Active Session' },
        ],
        redirectUrl: data.redirect_url,
      });

    } catch (err) {
      showStatus(err.message || 'Operator login error.', 'error');
      setFieldError(DOM.operatorPasswordError, DOM.operatorPasswordInput, err.message);
    } finally {
      setButtonLoading(DOM.btnOperatorLogin, false, 'Login');
    }
  }

  // Operator Registration Handler
  async function handleOperatorRegister(e) {
    e.preventDefault();
    hideStatus();
    clearFormErrors(DOM.formOperatorRegister);

    const name = DOM.regOpName.value.trim();
    const email = DOM.regOpEmail.value.trim();
    const centre_name = DOM.regOpCentre.value.trim();
    const mandi_code = DOM.regOpMandiCode.value.trim();
    const password = DOM.regOpPassword.value;

    let hasError = false;
    if (!name) {
      setFieldError(DOM.regOpNameError, DOM.regOpName, 'Operator full name required');
      hasError = true;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setFieldError(DOM.regOpEmailError, DOM.regOpEmail, 'Valid official email required');
      hasError = true;
    }
    if (!centre_name) {
      setFieldError(DOM.regOpCentreError, DOM.regOpCentre, 'Procurement centre required');
      hasError = true;
    }
    if (!mandi_code) {
      setFieldError(DOM.regOpMandiCodeError, DOM.regOpMandiCode, 'Mandi code required');
      hasError = true;
    }
    if (!password || password.length < 8) {
      setFieldError(DOM.regOpPasswordError, DOM.regOpPassword, 'Password must be at least 8 characters');
      hasError = true;
    }

    if (hasError) {
      showStatus('Please complete all required operator details.', 'error');
      return;
    }

    setButtonLoading(DOM.btnSubmitOperatorReg, true, 'Registering Operator...');

    try {
      const response = await fetch(API.OPERATOR_REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, centre_name, mandi_code, password }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Operator registration failed.');
      }

      STATE.activeToken = data.token;
      STATE.currentUser = data.user;

      showAuthenticatedScreen({
        greeting: `Welcome, ${data.user.name}!`,
        roleBadge: 'Mandi Procurement Operator • Account Registered',
        details: [
          { label: 'Official Email', value: data.user.email },
          { label: 'Procurement Centre', value: data.user.centre_name },
          { label: 'Mandi Code', value: data.user.mandi_code },
          { label: 'Account Status', value: 'Provisioned & Ready' },
        ],
        redirectUrl: data.redirect_url,
      });

    } catch (err) {
      showStatus(err.message || 'Operator registration failed.', 'error');
      setFieldError(DOM.regOpEmailError, DOM.regOpEmail, err.message);
    } finally {
      setButtonLoading(DOM.btnSubmitOperatorReg, false, 'Complete Operator Registration');
    }
  }

  // Resend Operator SMTP Verification Email
  async function handleResendOperatorVerification() {
    const email = DOM.operatorEmailInput.value.trim();
    if (!email) {
      showStatus('Please specify an email address to resend verification.', 'error');
      return;
    }

    setButtonLoading(DOM.btnResendOperatorVerif, true, 'Sending Email...');

    try {
      const response = await fetch(API.OPERATOR_RESEND_VERIFICATION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to dispatch verification email.');
      }

      showStatus(data.message || 'Verification email dispatched to inbox.', 'success');

    } catch (err) {
      showStatus(err.message || 'Failed to resend email.', 'error');
    } finally {
      setButtonLoading(DOM.btnResendOperatorVerif, false, 'Resend Verification Email');
    }
  }

  // Quick SMTP Verification simulation
  async function handleQuickVerifyOperator() {
    const email = DOM.operatorEmailInput.value.trim();
    if (!email) return;

    try {
      const response = await fetch(API.OPERATOR_VERIFY_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      showStatus('Email verified via simulated SMTP activation! You may now login.', 'success');
      DOM.operatorUnverifiedBox.classList.add('hidden');
    } catch (err) {
      showStatus('Failed to verify email.', 'error');
    }
  }

  // ==========================================================================
  // 9. ADMIN AUTHENTICATION (LOGIN & ENROLLMENT)
  // ==========================================================================
  async function handleAdminLogin(e) {
    e.preventDefault();
    hideStatus();
    clearFormErrors(DOM.formAdminLogin);

    const email = DOM.adminEmailInput.value.trim();
    const password = DOM.adminPasswordInput.value;

    let hasError = false;
    if (!email) {
      setFieldError(DOM.adminEmailError, DOM.adminEmailInput, 'Administrative email required.');
      hasError = true;
    }
    if (!password) {
      setFieldError(DOM.adminPasswordError, DOM.adminPasswordInput, 'Administrative password required.');
      hasError = true;
    }

    if (hasError) return;

    setButtonLoading(DOM.btnAdminLogin, true, 'Verifying Credentials...');

    try {
      const response = await fetch(API.ADMIN_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Administrative authentication rejected.');
      }

      // Successful Admin Authentication
      STATE.activeToken = data.token;
      STATE.currentUser = data.user;

      showAuthenticatedScreen({
        greeting: `Welcome, ${data.user.name || 'Administrator'}!`,
        roleBadge: data.user.access_level || 'State Agricultural Administrator',
        details: [
          { label: 'Admin Email', value: data.user.email },
          { label: 'Privilege Level', value: 'Full Governance & Mandi Control' },
          { label: 'Security Gateway', value: '256-Bit SSL Encrypted Session' },
        ],
        redirectUrl: data.redirect_url,
      });

    } catch (err) {
      showStatus(err.message || 'Admin authentication error.', 'error');
      setFieldError(DOM.adminPasswordError, DOM.adminPasswordInput, err.message);
    } finally {
      setButtonLoading(DOM.btnAdminLogin, false, 'Secure Login');
    }
  }

  // Admin Registration Handler
  async function handleAdminRegister(e) {
    e.preventDefault();
    hideStatus();
    clearFormErrors(DOM.formAdminRegister);

    const name = DOM.regAdminName.value.trim();
    const department = DOM.regAdminDept.value.trim();
    const email = DOM.regAdminEmail.value.trim();
    const password = DOM.regAdminPassword.value;

    let hasError = false;
    if (!name) {
      setFieldError(DOM.regAdminNameError, DOM.regAdminName, 'Officer name is required');
      hasError = true;
    }
    if (!department) {
      setFieldError(DOM.regAdminDeptError, DOM.regAdminDept, 'Department / wing is required');
      hasError = true;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setFieldError(DOM.regAdminEmailError, DOM.regAdminEmail, 'Valid ministry email is required');
      hasError = true;
    }
    if (!password || password.length < 8) {
      setFieldError(DOM.regAdminPasswordError, DOM.regAdminPassword, 'Passphrase must be at least 8 characters');
      hasError = true;
    }

    if (hasError) {
      showStatus('Please fill in all authorized admin credentials.', 'error');
      return;
    }

    setButtonLoading(DOM.btnSubmitAdminReg, true, 'Processing Clearance...');

    try {
      const response = await fetch(API.ADMIN_REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, department, email, password }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Admin enrollment clearance failed.');
      }

      STATE.activeToken = data.token;
      STATE.currentUser = data.user;

      showAuthenticatedScreen({
        greeting: `Welcome, ${data.user.name}!`,
        roleBadge: data.user.access_level || 'State Agricultural Administrator',
        details: [
          { label: 'Officer Email', value: data.user.email },
          { label: 'Department', value: data.user.department },
          { label: 'Clearance', value: 'Authorized Master Officer Session' },
        ],
        redirectUrl: data.redirect_url,
      });

    } catch (err) {
      showStatus(err.message || 'Admin registration error.', 'error');
      setFieldError(DOM.regAdminEmailError, DOM.regAdminEmail, err.message);
    } finally {
      setButtonLoading(DOM.btnSubmitAdminReg, false, 'Submit Clearance Request');
    }
  }

  // ==========================================================================
  // 10. SUCCESS / AUTHENTICATED STATE RENDERER
  // ==========================================================================
  function showAuthenticatedScreen({ greeting, roleBadge, details, redirectUrl }) {
    DOM.viewFarmerLogin.classList.add('hidden');
    DOM.viewFarmerSignup.classList.add('hidden');
    DOM.viewOperatorLogin.classList.add('hidden');
    DOM.viewAdminLogin.classList.add('hidden');
    DOM.viewSuccess.classList.remove('hidden');

    DOM.successHeading.textContent = greeting;
    DOM.successBadge.textContent = roleBadge;

    // Render detail rows
    DOM.successDetails.innerHTML = '';
    details.forEach(item => {
      const row = document.createElement('div');
      row.className = 'summary-row';
      row.innerHTML = `
        <span class="summary-label">${item.label}:</span>
        <span class="summary-value">${item.value}</span>
      `;
      DOM.successDetails.appendChild(row);
    });

    DOM.btnContinueDashboard.onclick = () => {
      showStatus(`Accessing dedicated ${STATE.currentRole} portal... (${redirectUrl})`, 'success');
    };
  }

  function handleSignOut() {
    STATE.activeToken = null;
    STATE.currentUser = null;
    DOM.viewSuccess.classList.add('hidden');
    setActiveRole(STATE.currentRole || 'farmer');
    showStatus('Signed out successfully.', 'info');
  }

  // ==========================================================================
  // 11. PASSWORD VISIBILITY TOGGLE (EYE ICONS & ACCESSIBILITY)
  // ==========================================================================
  function initPasswordToggles() {
    DOM.togglePasswordBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.dataset.target;
        const targetInput = document.getElementById(targetId);
        if (!targetInput) return;

        const eyeShow = btn.querySelector('.eye-show');
        const eyeHide = btn.querySelector('.eye-hide');

        if (targetInput.type === 'password') {
          targetInput.type = 'text';
          btn.setAttribute('aria-label', 'Hide password');
          btn.setAttribute('title', 'Hide password');
          btn.classList.add('is-active');
          if (eyeShow) eyeShow.classList.add('hidden');
          if (eyeHide) eyeHide.classList.remove('hidden');
        } else {
          targetInput.type = 'password';
          btn.setAttribute('aria-label', 'Show password');
          btn.setAttribute('title', 'Show password');
          btn.classList.remove('is-active');
          if (eyeShow) eyeShow.classList.remove('hidden');
          if (eyeHide) eyeHide.classList.add('hidden');
        }
        targetInput.focus();
      });
    });
  }

  // ==========================================================================
  // 11b. REAL-TIME PASSWORD STRENGTH EVALUATION
  // ==========================================================================
  function evaluatePasswordStrength(password) {
    if (!password) {
      return {
        score: 0,
        label: '',
        levelClass: '',
        rules: {
          length: false,
          case: false,
          number: false,
          special: false,
        },
      };
    }

    const rules = {
      length: password.length >= 8,
      case: /[a-z]/.test(password) && /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    let metCount = 0;
    if (rules.length) metCount++;
    if (rules.case) metCount++;
    if (rules.number) metCount++;
    if (rules.special) metCount++;

    // Extra weight for 12+ characters
    if (password.length >= 12 && metCount >= 3) {
      metCount++;
    }

    let score = 1;
    let label = 'Weak';
    let levelClass = 'weak';

    if (password.length < 6) {
      score = 1;
      label = 'Too Short';
      levelClass = 'weak';
    } else if (metCount <= 1) {
      score = 1;
      label = 'Weak';
      levelClass = 'weak';
    } else if (metCount === 2) {
      score = 2;
      label = 'Fair';
      levelClass = 'fair';
    } else if (metCount === 3) {
      score = 3;
      label = 'Strong';
      levelClass = 'strong';
    } else {
      score = 4;
      label = 'Very Strong';
      levelClass = 'very-strong';
    }

    return { score, label, levelClass, rules };
  }

  function updatePasswordStrengthUI(prefix, password) {
    const container = document.getElementById(`${prefix}-password-strength`);
    const textEl = document.getElementById(`${prefix}-strength-text`);
    const ruleLength = document.getElementById(`${prefix}-rule-length`);
    const ruleCase = document.getElementById(`${prefix}-rule-case`);
    const ruleNumber = document.getElementById(`${prefix}-rule-number`);
    const ruleSpecial = document.getElementById(`${prefix}-rule-special`);

    if (!container || !textEl) return;

    if (!password || password.length === 0) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');

    const { score, label, levelClass, rules } = evaluatePasswordStrength(password);

    // Update Label and badge style
    textEl.textContent = label;
    textEl.className = `strength-level-text ${levelClass}`;

    // Update Segmented Meter
    const meter = container.querySelector('.strength-meter');
    if (meter) {
      meter.setAttribute('data-level', String(score));
    }

    // Helper for criteria items
    const updateCriterion = (el, isMet) => {
      if (!el) return;
      el.classList.toggle('met', isMet);
      const icon = el.querySelector('.criteria-icon');
      if (icon) {
        icon.textContent = isMet ? '✓' : '○';
      }
    };

    updateCriterion(ruleLength, rules.length);
    updateCriterion(ruleCase, rules.case);
    updateCriterion(ruleNumber, rules.number);
    updateCriterion(ruleSpecial, rules.special);
  }

  // ==========================================================================
  // 12. EVENT LISTENERS INITIALIZATION
  // ==========================================================================
  function initEventListeners() {
    // Primary Auth Mode Selection (Sign In vs Sign Up)
    if (DOM.authTabSignin) {
      DOM.authTabSignin.addEventListener('click', () => setAuthMode('signin'));
    }
    if (DOM.authTabSignup) {
      DOM.authTabSignup.addEventListener('click', () => setAuthMode('signup'));
    }

    // Role selection
    DOM.roleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        setActiveRole(role);
      });
    });

    // Farmer Form Events
    DOM.formFarmerMobile.addEventListener('submit', handleFarmerSendOtp);
    DOM.formFarmerOtp.addEventListener('submit', handleFarmerVerifyOtp);
    DOM.btnResendOtp.addEventListener('click', handleFarmerResendOtp);
    DOM.btnChangeMobile.addEventListener('click', () => {
      DOM.formFarmerOtp.classList.add('hidden');
      DOM.formFarmerMobile.classList.remove('hidden');
      STATE.farmerAuthStep = 'mobile';
      DOM.farmerMobileInput.focus();
    });

    DOM.linkToFarmerSignup.addEventListener('click', () => openFarmerRegistration(DOM.farmerMobileInput.value));
    DOM.btnCreateUnregAccount.addEventListener('click', () => openFarmerRegistration(STATE.mobileNumber));
    DOM.btnBackToFarmerLogin.addEventListener('click', backToFarmerLogin);
    DOM.linkBackToLogin.addEventListener('click', backToFarmerLogin);
    DOM.formFarmerRegister.addEventListener('submit', handleFarmerRegister);

    // Operator Login & Signup Events
    DOM.formOperatorLogin.addEventListener('submit', handleOperatorLogin);
    DOM.btnResendOperatorVerif.addEventListener('click', handleResendOperatorVerification);
    DOM.btnQuickVerifyOperator.addEventListener('click', handleQuickVerifyOperator);
    DOM.operatorPasswordInput.addEventListener('input', (e) => {
      updatePasswordStrengthUI('operator', e.target.value);
      setFieldError(DOM.operatorPasswordError, DOM.operatorPasswordInput, '');
    });

    if (DOM.linkToOperatorSignup) {
      DOM.linkToOperatorSignup.addEventListener('click', () => {
        setAuthMode('signup');
        setActiveRole('operator');
      });
    }
    if (DOM.linkBackToOperatorLogin) {
      DOM.linkBackToOperatorLogin.addEventListener('click', () => {
        setAuthMode('signin');
        setActiveRole('operator');
      });
    }
    if (DOM.btnBackToOperatorLogin) {
      DOM.btnBackToOperatorLogin.addEventListener('click', () => {
        setAuthMode('signin');
        setActiveRole('operator');
      });
    }
    if (DOM.formOperatorRegister) {
      DOM.formOperatorRegister.addEventListener('submit', handleOperatorRegister);
    }
    if (DOM.regOpPassword) {
      DOM.regOpPassword.addEventListener('input', (e) => {
        updatePasswordStrengthUI('reg-operator', e.target.value);
        setFieldError(DOM.regOpPasswordError, DOM.regOpPassword, '');
      });
    }

    // Admin Login & Enrollment Events
    DOM.formAdminLogin.addEventListener('submit', handleAdminLogin);
    DOM.adminPasswordInput.addEventListener('input', (e) => {
      updatePasswordStrengthUI('admin', e.target.value);
      setFieldError(DOM.adminPasswordError, DOM.adminPasswordInput, '');
    });

    if (DOM.linkToAdminSignup) {
      DOM.linkToAdminSignup.addEventListener('click', () => {
        setAuthMode('signup');
        setActiveRole('admin');
      });
    }
    if (DOM.linkBackToAdminLogin) {
      DOM.linkBackToAdminLogin.addEventListener('click', () => {
        setAuthMode('signin');
        setActiveRole('admin');
      });
    }
    if (DOM.btnBackToAdminLogin) {
      DOM.btnBackToAdminLogin.addEventListener('click', () => {
        setAuthMode('signin');
        setActiveRole('admin');
      });
    }
    if (DOM.formAdminRegister) {
      DOM.formAdminRegister.addEventListener('submit', handleAdminRegister);
    }
    if (DOM.regAdminPassword) {
      DOM.regAdminPassword.addEventListener('input', (e) => {
        updatePasswordStrengthUI('reg-admin', e.target.value);
        setFieldError(DOM.regAdminPasswordError, DOM.regAdminPassword, '');
      });
    }

    // Sign out & Banner close
    DOM.btnAuthSignout.addEventListener('click', handleSignOut);
    DOM.statusCloseBtn.addEventListener('click', hideStatus);

    // Initialize OTP inputs keyboard & paste handlers
    initOtpInputBehaviors();

    // Password visibility toggles
    initPasswordToggles();

    // Number input sanitizer for mobile
    DOM.farmerMobileInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
      setFieldError(DOM.farmerMobileError, DOM.farmerMobileInput, '');
    });

    DOM.regMobile.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
      setFieldError(document.getElementById('reg-mobile-error'), DOM.regMobile, '');
    });

    DOM.regPincode.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    });
  }

  // ==========================================================================
  // 13. BOOTSTRAP APPLICATION
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    setAuthMode('signin');
    setActiveRole('farmer');
    console.log('🌾 Farm2Market Unified Authentication Portal Initialized.');
  });

})();
