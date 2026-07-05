(function() {
  if (isAuthenticated()) {
    redirectToDashboard();
    return;
  }

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    errorEl.classList.remove('show');
    errorEl.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Signing in...';

    try {
      const result = await login(email, password);
      setTokens(result.accessToken, result.refreshToken);
      redirectToDashboard();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add('show');
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
})();
