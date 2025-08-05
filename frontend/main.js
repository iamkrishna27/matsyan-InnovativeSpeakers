import { login, register } from './auth.js';

document.getElementById('login-btn')?.addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const user = await login(email, password);
  if (user) {
    // ✅ Redirect to index.html after successful login
    window.location.href = 'index.html';

  }
});

document.getElementById('register-btn')?.addEventListener('click', async () => {
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  const user = await register(email, password);
  if (user) {
    // ✅ Optional: Redirect to login.html or directly to index.html
    window.location.href = 'login.html';
    alert('register successfully, please login');
  }
});
