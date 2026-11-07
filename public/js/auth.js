/**
 * Authentication Pages Controller (Login & Register)
 */
document.addEventListener('DOMContentLoaded', () => {
  // If user already has a valid token, redirect directly to dashboard
  const token = localStorage.getItem('token');
  if (token) {
    API.getMe()
      .then(() => {
        window.location.replace('/index.html');
      })
      .catch(() => {
        // Token invalid or expired, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  }

  // Handle Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const submitBtn = document.getElementById('btnLoginSubmit');
    const generalAlert = document.getElementById('authAlert');
    const btnFillDemo = document.getElementById('btnFillDemo');

    // Quick fill demo credentials
    if (btnFillDemo) {
      btnFillDemo.addEventListener('click', () => {
        emailInput.value = 'demo@example.com';
        passwordInput.value = 'Password123!';
        clearErrors();
        emailInput.focus();
      });
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      let hasError = false;
      if (!email) {
        showFieldError('loginEmailError', 'Please enter your email address.');
        emailInput.classList.add('input-error');
        hasError = true;
      }
      if (!password) {
        showFieldError('loginPasswordError', 'Please enter your password.');
        passwordInput.classList.add('input-error');
        hasError = true;
      }

      if (hasError) return;

      const originalBtnText = submitBtn.textContent;
      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        const res = await API.login({ email, password });
        API.setSession(res.token, res.user);

        // Redirect to dashboard
        window.location.replace('/index.html');
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;

        if (err.errors && err.errors.length > 0) {
          err.errors.forEach(e => {
            if (e.field === 'email') showFieldError('loginEmailError', e.message);
            if (e.field === 'password') showFieldError('loginPasswordError', e.message);
          });
        } else {
          showGeneralAlert(err.message || 'Login failed. Please check your credentials.');
        }
      }
    });
  }

  // Handle Register Form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const nameInput = document.getElementById('registerName');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const submitBtn = document.getElementById('btnRegisterSubmit');

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      let hasError = false;
      if (!name || name.length < 2) {
        showFieldError('registerNameError', 'Name must be at least 2 characters.');
        nameInput.classList.add('input-error');
        hasError = true;
      }
      if (!email) {
        showFieldError('registerEmailError', 'Email address is required.');
        emailInput.classList.add('input-error');
        hasError = true;
      }
      if (!password || password.length < 6) {
        showFieldError('registerPasswordError', 'Password must be at least 6 characters.');
        passwordInput.classList.add('input-error');
        hasError = true;
      }

      if (hasError) return;

      const originalBtnText = submitBtn.textContent;
      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        const res = await API.register({ name, email, password });
        API.setSession(res.token, res.user);

        // Redirect to dashboard
        window.location.replace('/index.html');
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;

        if (err.errors && err.errors.length > 0) {
          err.errors.forEach(e => {
            if (e.field === 'name') showFieldError('registerNameError', e.message);
            if (e.field === 'email') showFieldError('registerEmailError', e.message);
            if (e.field === 'password') showFieldError('registerPasswordError', e.message);
          });
        } else {
          showGeneralAlert(err.message || 'Registration failed. Please try again.');
        }
      }
    });
  }

  // Error Helper Functions
  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-group input').forEach(el => el.classList.remove('input-error'));
    const alert = document.getElementById('authAlert');
    if (alert) {
      alert.textContent = '';
      alert.classList.add('hidden');
    }
  }

  function showFieldError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
  }

  function showGeneralAlert(message) {
    const alert = document.getElementById('authAlert');
    if (alert) {
      alert.textContent = message;
      alert.classList.remove('hidden');
    }
  }
});
