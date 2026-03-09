const authSection = document.getElementById('auth');
const appSection = document.getElementById('app');
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const generateForm = document.getElementById('generateForm');
const qrResult = document.getElementById('qrResult');
const refreshDashboard = document.getElementById('refreshDashboard');
const dashboard = document.getElementById('dashboard');

let token = localStorage.getItem('token');

function showApp() {
  authSection.style.display = 'none';
  appSection.style.display = 'block';
  refreshDashboard.click();
}

if (token) {
  showApp();
}

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const res = await fetch('/auth/signup', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password})
  });
  alert(await res.text());
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password})
  });
  const data = await res.json();
  if (data.token) {
    token = data.token;
    localStorage.setItem('token', token);
    showApp();
  } else {
    alert(data);
  }
});

logoutBtn.addEventListener('click', () => {
  token = null;
  localStorage.removeItem('token');
  appSection.style.display = 'none';
  authSection.style.display = 'block';
});

generateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = document.getElementById('qrText').value;
  const type = document.getElementById('qrType').value;
  const expireAt = document.getElementById('qrExpire').value;
  const password = document.getElementById('qrPassword').value;
  const oneTime = document.getElementById('qrOneTime').checked;
  const body = {text, type};
  if (expireAt) body.expireAt = expireAt;
  if (password) body.password = password;
  if (oneTime) body.oneTime = true;

  const res = await fetch('/qr/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  qrResult.innerHTML = `<p>Redirect: <a href="${data.redirect}" target="_blank">${data.redirect}</a></p>`;
  if (data.qr) {
    qrResult.innerHTML += `<img src="${data.qr}" alt="QR"/>`;
  }
  refreshDashboard.click();
});

refreshDashboard.addEventListener('click', async () => {
  const res = await fetch('/qr/dashboard', {
    headers: {Authorization: 'Bearer ' + token}
  });
  const list = await res.json();
  dashboard.innerHTML = '';
  list.forEach(qr => {
    const div = document.createElement('div');
    div.innerHTML = `
      <p><strong>${qr.type}</strong>: <a href="${qr.text}" target="_blank">${qr.text}</a></p>
      <p>Redirect link: <a href="/r/${qr._id}" target="_blank">/r/${qr._id}</a></p>
      <p>Scans: ${qr.scans} ${qr.expireAt ? '| expires: ' + new Date(qr.expireAt).toLocaleString() : ''}</p>
      <hr>
    `;
    dashboard.appendChild(div);
  });
});