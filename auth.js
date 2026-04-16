// ============================================================
// auth.js — Shared authentication & UI module
// Handles: Login, Sign Up, Profile, Enrolled Courses panel
// Uses localStorage to persist user session across pages
// ============================================================
 
(function () {
  const STORAGE_KEY = 'lp_user';
 
  function getUser() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
  }
  function saveUser(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  function clearUser() {
    localStorage.removeItem(STORAGE_KEY);
  }
 
  const styles = `
    /* ---- Overlay ---- */
    .auth-overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,.45);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    .auth-overlay.active { display: flex; }
 
    /* ---- Modal base ---- */
    .auth-modal {
      background: #fff;
      border-radius: 16px;
      padding: 40px 36px 32px;
      width: 420px;
      max-width: 95vw;
      position: relative;
      box-shadow: 0 8px 40px rgba(0,0,0,.18);
      animation: modalIn .18s ease;
    }
    @keyframes modalIn { from { transform: translateY(16px); opacity:0; } to { transform: none; opacity:1; } }
 
    .auth-modal h2 {
      font-size: 22px; font-weight: 700;
      color: #0A0A0A; margin-bottom: 6px; text-align: center;
    }
    .auth-modal .auth-sub {
      font-size: 13px; color: #8A8A8A; text-align: center; margin-bottom: 24px;
    }
    .auth-close {
      position: absolute; top: 14px; right: 16px;
      background: none; border: none; font-size: 20px;
      color: #8A8A8A; cursor: pointer; line-height: 1;
    }
    .auth-close:hover { color: #0A0A0A; }
 
    /* ---- Form fields ---- */
    .auth-field { margin-bottom: 16px; }
    .auth-field label {
      display: block; font-size: 13px; font-weight: 500;
      color: #3D3D3D; margin-bottom: 6px;
    }
    .auth-field input {
      width: 100%; box-sizing: border-box;
      padding: 10px 14px; border: 1.5px solid #E0E0E0;
      border-radius: 8px; font-size: 14px; color: #0A0A0A;
      outline: none; transition: border .18s;
    }
    .auth-field input:focus { border-color: #4A3AFF; }
    .auth-field input.error { border-color: #e53935; }
    .auth-error-msg {
      font-size: 12px; color: #e53935; margin-top: 4px; display: none;
    }
    .auth-error-msg.show { display: block; }
 
    /* ---- Submit button ---- */
    .auth-submit {
      width: 100%; padding: 12px;
      background: #4A3AFF; color: #fff;
      border: none; border-radius: 8px;
      font-size: 15px; font-weight: 600;
      cursor: pointer; margin-top: 8px;
      transition: background .15s;
    }
    .auth-submit:hover { background: #3628d4; }
 
    /* ---- Switch link ---- */
    .auth-switch {
      text-align: center; font-size: 13px; color: #8A8A8A; margin-top: 16px;
    }
    .auth-switch a { color: #4A3AFF; cursor: pointer; text-decoration: none; font-weight: 500; }
    .auth-switch a:hover { text-decoration: underline; }
 
    /* ============================================================
       PROFILE MODAL
    ============================================================ */
    .profile-modal-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,.45); z-index: 1000;
      align-items: center; justify-content: center;
    }
    .profile-modal-overlay.active { display: flex; }
 
    .profile-modal {
      background: #fff; border-radius: 16px;
      padding: 36px 36px 28px; width: 480px; max-width: 95vw;
      position: relative; box-shadow: 0 8px 40px rgba(0,0,0,.18);
      animation: modalIn .18s ease;
      max-height: 90vh; overflow-y: auto;
    }
    .profile-modal h2 {
      font-size: 22px; font-weight: 700;
      color: #0A0A0A; text-align: center; margin-bottom: 24px;
    }
    .profile-modal .auth-close {
      position: absolute; top: 14px; right: 16px;
    }
 
    /* Avatar row */
    .profile-avatar-row {
      display: flex; align-items: center; gap: 14px;
      margin-bottom: 24px;
    }
    .profile-avatar-img {
      width: 60px; height: 60px; border-radius: 50%;
      object-fit: cover; background: #EEEDFC;
      border: 2px solid #B7B3F4;
    }
    .profile-avatar-name { font-size: 16px; font-weight: 600; color: #0A0A0A; }
    .profile-status {
      font-size: 12px; color: #E68C00; font-weight: 500;
    }
    .profile-status.complete { color: #27ae60; }
 
    /* Two-column row */
    .profile-row-2 {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }
 
    /* Upload zone */
    .avatar-upload-zone {
      border: 1.5px dashed #B7B3F4; border-radius: 10px;
      padding: 20px; text-align: center; cursor: pointer;
      color: #8A8A8A; font-size: 13px; margin-bottom: 16px;
      transition: border-color .15s;
    }
    .avatar-upload-zone:hover { border-color: #4A3AFF; }
    .avatar-upload-zone span { color: #4A3AFF; text-decoration: underline; cursor: pointer; }
    .avatar-upload-zone .upload-icon { font-size: 22px; margin-bottom: 6px; }
 
    /* Logout button */
    .profile-logout {
      width: 100%; padding: 10px;
      background: none; border: 1.5px solid #e53935;
      border-radius: 8px; color: #e53935;
      font-size: 14px; font-weight: 600; cursor: pointer;
      margin-top: 10px; transition: background .15s;
    }
    .profile-logout:hover { background: #fdecea; }
 
    /* ============================================================
       ENROLLED COURSES SIDEBAR
    ============================================================ */
    .enrolled-sidebar {
      position: fixed; top: 0; right: -520px;
      width: 480px; max-width: 95vw; height: 100vh;
      background: #fff; z-index: 1100;
      box-shadow: -4px 0 30px rgba(0,0,0,.15);
      transition: right .3s cubic-bezier(.4,0,.2,1);
      display: flex; flex-direction: column;
    }
    .enrolled-sidebar.open { right: 0; }
 
    .enrolled-sidebar-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,.3); z-index: 1050;
    }
    .enrolled-sidebar-overlay.active { display: block; }
 
    .enrolled-header {
      padding: 24px 24px 16px;
      border-bottom: 1px solid #F0F0F0;
      display: flex; align-items: center; justify-content: space-between;
    }
    .enrolled-header h2 { font-size: 20px; font-weight: 700; color: #0A0A0A; }
    .enrolled-total {
      font-size: 13px; color: #8A8A8A;
    }
    .enrolled-close {
      background: none; border: none; font-size: 20px;
      color: #8A8A8A; cursor: pointer;
    }
    .enrolled-close:hover { color: #0A0A0A; }
 
    .enrolled-list {
      flex: 1; overflow-y: auto; padding: 16px 24px;
      display: flex; flex-direction: column; gap: 16px;
    }
 
    /* Enrolled course card */
    .enrolled-card {
      border: 1px solid #EBEBEB; border-radius: 12px;
      overflow: hidden; cursor: pointer;
      transition: box-shadow .15s;
    }
    .enrolled-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
 
    .enrolled-card-top {
      display: flex; gap: 0;
    }
    .enrolled-card-img {
      width: 120px; height: 90px; object-fit: cover; flex-shrink: 0;
    }
    .enrolled-card-info {
      padding: 10px 14px; flex: 1;
    }
    .enrolled-card-meta {
      font-size: 11px; color: #8A8A8A; margin-bottom: 4px;
    }
    .enrolled-card-meta strong { color: #3D3D3D; }
    .enrolled-card-rating {
      font-size: 12px; color: #E68C00; font-weight: 600; float: right;
    }
    .enrolled-card-title {
      font-size: 14px; font-weight: 600;
      color: #0A0A0A; margin-bottom: 6px; line-height: 1.3;
    }
    .enrolled-card-schedule {
      font-size: 11px; color: #8A8A8A; line-height: 1.8;
    }
    .enrolled-card-schedule span { display: block; }
 
    .enrolled-card-bottom {
      padding: 8px 14px 12px;
      border-top: 1px solid #F5F5F5;
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
    }
    .enrolled-progress-wrap { flex: 1; }
    .enrolled-progress-label {
      font-size: 11px; color: #8A8A8A; margin-bottom: 4px;
    }
    .enrolled-progress-bar-bg {
      height: 6px; background: #F0F0F0; border-radius: 99px; overflow: hidden;
    }
    .enrolled-progress-bar-fill {
      height: 100%; background: #4A3AFF; border-radius: 99px;
      transition: width .4s;
    }
    .enrolled-view-btn {
      padding: 6px 16px; background: #fff;
      border: 1.5px solid #4A3AFF; border-radius: 8px;
      color: #4A3AFF; font-size: 13px; font-weight: 600;
      cursor: pointer; text-decoration: none; white-space: nowrap;
      transition: background .15s;
    }
    .enrolled-view-btn:hover { background: #EEEDFC; }
 
    .enrolled-empty {
      text-align: center; color: #8A8A8A;
      font-size: 15px; padding: 60px 20px;
    }
    .enrolled-empty-icon { font-size: 40px; margin-bottom: 12px; }
 
    /* ---- Toast ---- */
    .auth-toast {
      position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
      background: #0A0A0A; color: #fff;
      padding: 12px 24px; border-radius: 99px;
      font-size: 14px; font-weight: 500;
      z-index: 9999; opacity: 0;
      transition: opacity .25s; pointer-events: none;
      white-space: nowrap;
    }
    .auth-toast.show { opacity: 1; }
 
    .signup-steps {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }
 
  .signup-steps .step {
    flex: 1;
    height: 6px;
    border-radius: 10px;
    background: #EEEDFC; /* upcoming */
    transition: 0.3s;
  }
 
  /* ✅ completed */
  .signup-steps .step.done {
    background: #4A3AFF;
    opacity: 0.5;
  }
 
  /* 🔵 active */
  .signup-steps .step.active {
    background: #B7B3F4;
    opacity: 1;
  }
 
  /* ⚪ upcoming (default already, but explicit if you want) */
  .signup-steps .step.upcoming {
    background: #EEEDFC;
  }
  
 
  `;
 
  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);
 

  const loginHTML = `
  <div class="auth-overlay" id="login-overlay">
    <div class="auth-modal" id="login-modal">
      <button class="auth-close" id="login-close">&times;</button>
      <h2>Welcome Back</h2>
      <p class="auth-sub">Log in to continue your learning</p>
 
      <div class="auth-field">
        <label for="login-email">Email</label>
        <input type="email" id="login-email" placeholder="email@gmail.com">
        <div class="auth-error-msg" id="login-email-err">Please enter a valid email.</div>
      </div>
      <div class="auth-field">
        <label for="login-password">Password</label>
        <input type="password" id="login-password" placeholder="••••••••">
        <div class="auth-error-msg" id="login-pass-err">Password must be at least 6 characters.</div>
      </div>
      <div class="auth-error-msg" id="login-general-err" style="margin-bottom:8px;"></div>
 
      <button class="auth-submit" id="login-submit">Log In</button>
      <div class="auth-switch">Don't have an account? <a id="switch-to-signup">Sign Up</a></div>
    </div>
  </div>`;
 
  const signupHTML = `
  <div class="auth-overlay" id="signup-overlay">
    <div class="auth-modal" id="signup-modal">
      <button class="auth-close" id="signup-close">&times;</button>
 
      <h2>Create Account</h2>
      <p class="auth-sub">Join and start learning today</p>
 
      <!-- Progress bar -->
      <div class="signup-steps">
        <div class="step"></div>
        <div class="step"></div>
        <div class="step"></div>
      </div>
 
      <!-- STEP 1 -->
      <div class="signup-step" data-step="1">
        <div class="auth-field">
          <label>Email</label>
          <input type="email" id="signup-email" placeholder="email@gmail.com">
        </div>
        <button class="auth-submit" id="to-step-2">Next</button>
      </div>
 
      <!-- STEP 2 -->
      <div class="signup-step" data-step="2" style="display:none;">
        <div class="auth-field">
          <label>Password</label>
          <input type="password" id="signup-password">
        </div>
        <div class="auth-field">
          <label>Confirm Password</label>
          <input type="password" id="signup-confirm-password">
        </div>
        <button class="auth-submit" id="to-step-3">Next</button>
      </div>
 
      <!-- STEP 3 -->
      <div class="signup-step" data-step="3" style="display:none;">
        <div class="auth-field">
          <label>Username</label>
          <input type="text" id="signup-name">
        </div>
 
        <div class="avatar-upload-zone" id="avatar-drop-zone">
          Upload Avatar
          <input type="file" id="avatar-file-input" style="display:none">
        </div>
 
        <button class="auth-submit" id="signup-submit">Sign Up</button>
      </div>
 
      <div class="auth-switch">
        Already have an account? <a id="switch-to-login">Log In</a>
      </div>
    </div>
  </div>`;
 
  const profileHTML = `
  <div class="profile-modal-overlay" id="profile-overlay">
    <div class="profile-modal">
      <button class="auth-close" id="profile-close">&times;</button>
      <h2>Profile</h2>
 
      <div class="profile-avatar-row">
        <img class="profile-avatar-img" id="profile-avatar-preview" src="assets/User.svg" alt="avatar">
        <div>
          <div class="profile-avatar-name" id="profile-display-name">Username</div>
          <div class="profile-status" id="profile-status-label">Incomplete Profile</div>
        </div>
      </div>
 
      <div class="auth-field">
        <label for="profile-name">Full Name</label>
        <input type="text" id="profile-name" placeholder="Username">
        <div class="auth-error-msg" id="profile-name-err">Please enter your full name.</div>
      </div>
 
      <div class="auth-field">
        <label>Email</label>
        <input type="email" id="profile-email" placeholder="email@gmail.com" disabled style="background:#F8F8F8; color:#8A8A8A;">
      </div>
 
      <div class="profile-row-2">
        <div class="auth-field">
          <label for="profile-phone">Mobile Number</label>
          <input type="tel" id="profile-phone" placeholder="+995">
          <div class="auth-error-msg" id="profile-phone-err">Enter a valid number.</div>
        </div>
        <div class="auth-field">
          <label for="profile-age">Age</label>
          <input type="number" id="profile-age" placeholder="29" min="10" max="100">
          <div class="auth-error-msg" id="profile-age-err">Enter a valid age.</div>
        </div>
      </div>
 
      <label style="font-size:13px;font-weight:500;color:#3D3D3D;display:block;margin-bottom:8px;">Upload Avatar</label>
      <div class="avatar-upload-zone" id="avatar-drop-zone">
        <div class="upload-icon">⬆️</div>
        Drag and drop or <span id="avatar-upload-trigger">Upload file</span><br>
        <small>JPG, PNG or WebP</small>
        <input type="file" id="avatar-file-input" accept=".jpg,.jpeg,.png,.webp" style="display:none">
      </div>
 
      <button class="auth-submit" id="profile-save">Update Profile</button>
      <button class="profile-logout" id="profile-logout">Log Out</button>
    </div>
  </div>`;
 
  const enrolledHTML = `
  <div class="enrolled-sidebar-overlay" id="enrolled-overlay"></div>
  <div class="enrolled-sidebar" id="enrolled-sidebar">
    <div class="enrolled-header">
      <div>
        <h2>Enrolled Courses</h2>
        <div class="enrolled-total" id="enrolled-total">Total Enrollments: 0</div>
      </div>
      <button class="enrolled-close" id="enrolled-close">&times;</button>
    </div>
    <div class="enrolled-list" id="enrolled-list"></div>
  </div>`;
 
  const toastHTML = `<div class="auth-toast" id="auth-toast"></div>`;
 
  document.body.insertAdjacentHTML('beforeend', loginHTML + signupHTML + profileHTML + enrolledHTML + toastHTML);
 
  const MOCK_ENROLLED = [
    {
      title: 'Advanced React & TypeScript Development',
      instructor: 'Sarah Johnson',
      rating: 4.9,
      schedule: 'Monday-Wednesday',
      time: 'Evening 6:00 PM – 8:00 PM',
      mode: 'In Person',
      location: 'Tbilisi, Chavchavadze St.30',
      progress: 65,
      img: 'assets/scourse1.png',
      link: 'course.html'
    },
    {
      title: 'UI/UX Design Fundamentals',
      instructor: 'Emily Carter',
      rating: 4.7,
      schedule: 'Tuesday-Thursday',
      time: 'Evening 7:00 PM – 9:00 PM',
      mode: 'Online',
      location: 'Zoom',
      progress: 30,
      img: 'assets/course1.jpg',
      link: 'course.html'
    },
    {
      title: 'Data Science with Python',
      instructor: 'Alex Rivera',
      rating: 4.8,
      schedule: 'Monday-Wednesday-Friday',
      time: 'Morning 10:00 AM – 12:00 PM',
      mode: 'In Person',
      location: 'Tbilisi, Rustaveli Ave.9',
      progress: 10,
      img: 'assets/course1.jpg',
      link: 'course.html'
    }
  ];
 
  function showToast(msg) {
    const t = document.getElementById('auth-toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }
 
  function closeAllModals() {
    document.getElementById('login-overlay').classList.remove('active');
    document.getElementById('signup-overlay').classList.remove('active');
    document.getElementById('profile-overlay').classList.remove('active');
    closeEnrolled();
  }
 
  function openLogin() {
    closeAllModals();
    document.getElementById('login-overlay').classList.add('active');
    document.getElementById('login-email').focus();
  }
  function openSignup() {
    closeAllModals();
    document.getElementById('signup-overlay').classList.add('active');
 
    goToStep(1);
    document.getElementById('signup-email')?.focus();
  }
  function openProfile() {
    populateProfileForm();
    document.getElementById('profile-overlay').classList.add('active');
  }
  function openEnrolled() {
    renderEnrolledList();
    document.getElementById('enrolled-sidebar').classList.add('open');
    document.getElementById('enrolled-overlay').classList.add('active');
  }
  function closeEnrolled() {
    document.getElementById('enrolled-sidebar').classList.remove('open');
    document.getElementById('enrolled-overlay').classList.remove('active');
  }
 
  function isProfileComplete(user) {
    return !!(user.name && user.phone && user.age);
  }
 
  function updateNavbar() {
    const user = getUser();
    const loggedOut = document.getElementById('nav-logged-out');
    const loggedIn = document.getElementById('nav-logged-in');
    if (!loggedOut || !loggedIn) return;
 
    if (user) {
      loggedOut.style.display = 'none';
      loggedIn.style.display = 'flex';
      const dot = loggedIn.querySelector('.status-dot');
      if (dot) dot.style.background = isProfileComplete(user) ? '#27ae60' : '#E68C00';
    } else {
      loggedOut.style.display = '';
      loggedIn.style.display = 'none';
    }
  }
 
    function updateContinueLearning() {
      const user       = getUser();
      const sectionOut = document.querySelector('.continue-learning-logged-out');
      const sectionIn  = document.querySelector('.continue-learning-logged-in');
  
      if (sectionOut) sectionOut.style.display = user ? 'none' : '';
      if (sectionIn)  sectionIn.style.display  = user ? ''     : 'none';
    }
 
 
  function populateProfileForm() {
    const user = getUser();
    if (!user) return;
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-phone').value = user.phone || '';
    document.getElementById('profile-age').value = user.age || '';
    document.getElementById('profile-display-name').textContent = user.name || user.email;
    const statusEl = document.getElementById('profile-status-label');
    const complete = isProfileComplete(user);
    statusEl.textContent = complete ? 'Profile Complete' : 'Incomplete Profile';
    statusEl.className = 'profile-status' + (complete ? ' complete' : '');
    if (user.avatarDataUrl) {
      document.getElementById('profile-avatar-preview').src = user.avatarDataUrl;
    } else {
      document.getElementById('profile-avatar-preview').src = 'assets/User.svg';
    }
  }
 
  function renderEnrolledList() {
    const user = getUser();
    const list = document.getElementById('enrolled-list');
    const total = document.getElementById('enrolled-total');
 
    if (!user) { list.innerHTML = ''; return; }
 
    const courses = MOCK_ENROLLED;
    total.textContent = `Total Enrollments: ${courses.length}`;
 
    list.innerHTML = courses.map(c => `
      <div class="enrolled-card" onclick="window.location.href='${c.link}'">
        <div class="enrolled-card-top">
          <img class="enrolled-card-img" src="${c.img}" alt="${c.title}" onerror="this.src='assets/course1.jpg'">
          <div class="enrolled-card-info">
            <div class="enrolled-card-meta">
              Instructor <strong>${c.instructor}</strong>
              <span class="enrolled-card-rating">★ ${c.rating}</span>
            </div>
            <div class="enrolled-card-title">${c.title}</div>
            <div class="enrolled-card-schedule">
              <span>📅 ${c.schedule}</span>
              <span>🕐 ${c.time}</span>
              <span>📍 ${c.mode} · ${c.location}</span>
            </div>
          </div>
        </div>
        <div class="enrolled-card-bottom">
          <div class="enrolled-progress-wrap">
            <div class="enrolled-progress-label">${c.progress}% Complete</div>
            <div class="enrolled-progress-bar-bg">
              <div class="enrolled-progress-bar-fill" style="width:${c.progress}%"></div>
            </div>
          </div>
          <a href="${c.link}" class="enrolled-view-btn" onclick="event.stopPropagation()">View</a>
        </div>
      </div>
    `).join('');
  }
 
  function showErr(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('show', show);
  }
  function markField(id, error) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('error', error);
  }
  function clearErrors(...ids) {
    ids.forEach(id => { showErr(id, false); });
  }
 
  const API_BASE = 'https://api.redclass.redberryinternship.ge/api';
 
  function getToken() {
    return localStorage.getItem('lp_token');
  }
  function saveToken(token) {
    localStorage.setItem('lp_token', token);
  }
  function clearToken() {
    localStorage.removeItem('lp_token');
  }
 
  document.getElementById('login-submit').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
 
    clearErrors('login-email-err', 'login-pass-err', 'login-general-err');
    let valid = true;
 
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showErr('login-email-err', true); markField('login-email', true); valid = false;
    } else { markField('login-email', false); }
 
    if (pass.length < 6) {
      showErr('login-pass-err', true); markField('login-password', true); valid = false;
    } else { markField('login-password', false); }
 
    if (!valid) return;
 
    const btn = document.getElementById('login-submit');
    btn.disabled = true;
    btn.textContent = 'Logging in…';
 
    const genErr = document.getElementById('login-general-err');
 
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
 
      if (res.ok) {
        if (data.token) saveToken(data.token);
        const user = {
          email: data.user?.email || email,
          name: data.user?.name || data.user?.username || '',
          phone: data.user?.phone || '',
          age: data.user?.age || '',
          avatarDataUrl: data.user?.avatar || null
        };
        saveUser(user);
        closeAllModals();
        updateNavbar();
        updateContinueLearning();
        showToast(`Welcome back, ${user.name || user.email}! 👋`);
      } else {
        genErr.textContent = data.message || 'Invalid email or password.';
        genErr.classList.add('show');
      }
    } catch (err) {
      genErr.textContent = 'Network error. Please try again.';
      genErr.classList.add('show');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Log In';
    }
  });
 

  let _signupAvatarFile = null;
 
  const signupFileInput = document.querySelector('#signup-overlay #avatar-file-input');
  if (signupFileInput) {
    signupFileInput.addEventListener('change', () => {
      if (signupFileInput.files[0]) _signupAvatarFile = signupFileInput.files[0];
    });
    const signupDropZone = document.querySelector('#signup-overlay #avatar-drop-zone');
    if (signupDropZone) {
      signupDropZone.addEventListener('click', () => signupFileInput.click());
      signupDropZone.addEventListener('drop', e => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) _signupAvatarFile = e.dataTransfer.files[0];
      });
      signupDropZone.addEventListener('dragover', e => e.preventDefault());
    }
  }
 
  document.getElementById('signup-submit').addEventListener('click', async () => {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pass = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm-password').value;
 
    clearErrors('signup-name-err', 'signup-email-err', 'signup-pass-err');
    let valid = true;
 
    if (!name) {
      showErr('signup-name-err', true); markField('signup-name', true); valid = false;
    } else { markField('signup-name', false); }
 
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showErr('signup-email-err', true); markField('signup-email', true); valid = false;
    } else { markField('signup-email', false); }
 
    if (pass.length < 6 || pass !== confirm) {
      showErr('signup-pass-err', true); markField('signup-password', true); valid = false;
    } else { markField('signup-password', false); }
 
    if (!valid) return;
 
    const btn = document.getElementById('signup-submit');
    btn.disabled = true;
    btn.textContent = 'Creating account…';
 
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', pass);
      formData.append('password_confirmation', confirm);
      formData.append('username', name);
      if (_signupAvatarFile) formData.append('avatar', _signupAvatarFile);
 
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });
      const data = await res.json();
 
      if (res.ok) {
        if (data.token) saveToken(data.token);
        const user = {
          email: data.user?.email || email,
          name: data.user?.name || data.user?.username || name,
          phone: data.user?.phone || '',
          age: data.user?.age || '',
          avatarDataUrl: data.user?.avatar || null
        };
        saveUser(user);
        _signupAvatarFile = null;
        closeAllModals();
        updateNavbar();
        updateContinueLearning();
        showToast(`Account created! Welcome, ${user.name} 🎉`);
      } else {
        const msg = data.message || Object.values(data.errors || {})[0]?.[0] || 'Registration failed.';
        showToast(msg);
      }
    } catch (err) {
      showToast('Network error. Please try again.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign Up';
    }
  });
 
  
  let currentStep = 1;
 
  function isStepComplete(step) {
    if (step === 1) {
      const email = document.getElementById('signup-email').value.trim();
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
 
    if (step === 2) {
      const pass = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm-password').value;
      return pass.length >= 6 && pass === confirm;
    }
 
    if (step === 3) {
      const name = document.getElementById('signup-name').value.trim();
      return !!name;
    }
 
    return false;
  }
  function goToStep(step) {
    for (let i = 1; i < step; i++) {
      if (!isStepComplete(i)) {
        step = i;
        break;
      }
    }
 
    document.querySelectorAll('.signup-step').forEach(s => {
      s.style.display = s.dataset.step == step ? 'block' : 'none';
    });
 
    document.querySelectorAll('.signup-steps .step').forEach((el, i) => {
      const stepIndex = i + 1;
 
      el.classList.remove('done', 'active', 'upcoming');
 
      if (isStepComplete(stepIndex)) {
        el.classList.add('done');
      } else if (stepIndex === step) {
        el.classList.add('active');
      } else {
        el.classList.add('upcoming');
      }
    });
 
    currentStep = step;
  }
 
    document.getElementById('to-step-2').addEventListener('click', () => {
    goToStep(2);
  });
 
  document.getElementById('to-step-3').addEventListener('click', () => {
    goToStep(3);
  });
  
  document.getElementById('profile-save').addEventListener('click', async () => {
    const user = getUser();
    if (!user) return;
 
    const name = document.getElementById('profile-name').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();
    const age = document.getElementById('profile-age').value.trim();
 
    clearErrors('profile-name-err', 'profile-phone-err', 'profile-age-err');
    let valid = true;
 
    if (!name) {
      showErr('profile-name-err', true); markField('profile-name', true); valid = false;
    } else { markField('profile-name', false); }
 
    if (phone && phone.replace(/\D/g,'').length < 6) {
      showErr('profile-phone-err', true); markField('profile-phone', true); valid = false;
    } else { markField('profile-phone', false); }
 
    if (age && (isNaN(age) || age < 10 || age > 100)) {
      showErr('profile-age-err', true); markField('profile-age', true); valid = false;
    } else { markField('profile-age', false); }
 
    if (!valid) return;
 
    const btn = document.getElementById('profile-save');
    btn.disabled = true;
    btn.textContent = 'Saving…';
 
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('username', name);
      if (phone) formData.append('phone', phone);
      if (age) formData.append('age', age);
      const avatarInput = document.getElementById('avatar-file-input');
      if (avatarInput && avatarInput.files[0]) formData.append('avatar', avatarInput.files[0]);
 
      const res = await fetch(`${API_BASE}/me`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });
 
      if (res.ok) {
        const data = await res.json();
        user.name = data.user?.name || data.user?.username || name;
        user.phone = data.user?.phone || phone;
        user.age = data.user?.age || age;
        if (data.user?.avatar) user.avatarDataUrl = data.user.avatar;
      } else {
        user.name = name; user.phone = phone; user.age = age;
      }
    } catch (err) {
      user.name = name; user.phone = phone; user.age = age;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Update Profile';
    }
 
    saveUser(user);
    populateProfileForm();
    updateNavbar();
    showToast('Profile updated successfully ✓');
  });
 
  document.getElementById('profile-logout').addEventListener('click', async () => {
    const token = getToken();
    if (token) {
      try {
        await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
      } catch (_) { /* ignore network errors on logout */ }
    }
    window.location.reload();
    clearUser();
    clearToken();
    closeAllModals();
    updateNavbar();
    updateContinueLearning();
    showToast('You have been logged out.');
  });
 
  const fileInput = document.getElementById('avatar-file-input');
  document.getElementById('avatar-upload-trigger').addEventListener('click', () => fileInput.click());
  document.getElementById('avatar-drop-zone').addEventListener('click', () => fileInput.click());
 
  document.getElementById('avatar-drop-zone').addEventListener('dragover', e => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#4A3AFF';
  });
  document.getElementById('avatar-drop-zone').addEventListener('dragleave', e => {
    e.currentTarget.style.borderColor = '#B7B3F4';
  });
  document.getElementById('avatar-drop-zone').addEventListener('drop', e => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#B7B3F4';
    const file = e.dataTransfer.files[0];
    if (file) handleAvatarFile(file);
  });
 
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleAvatarFile(fileInput.files[0]);
  });
 
  function handleAvatarFile(file) {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      showToast('Please upload a JPG, PNG, or WebP image.'); return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      document.getElementById('profile-avatar-preview').src = dataUrl;
      const user = getUser();
      if (user) { user.avatarDataUrl = dataUrl; saveUser(user); }
      const navIcon = document.querySelector('.profile-icon img');
      if (navIcon) navIcon.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }
 
  document.getElementById('login-close').addEventListener('click', closeAllModals);
  document.getElementById('signup-close').addEventListener('click', closeAllModals);
  document.getElementById('profile-close').addEventListener('click', closeAllModals);
  document.getElementById('enrolled-close').addEventListener('click', closeEnrolled);
  document.getElementById('enrolled-overlay').addEventListener('click', closeEnrolled);
 
  document.getElementById('login-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAllModals();
  });
  document.getElementById('signup-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAllModals();
  });
  document.getElementById('profile-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAllModals();
  });
 
  document.getElementById('switch-to-signup').addEventListener('click', openSignup);
  document.getElementById('switch-to-login').addEventListener('click', openLogin);
 
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeAllModals(); }
  });
 
  ['login-email','login-password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('login-submit').click();
    });
  });
  ['signup-name','signup-email','signup-password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('signup-submit').click();
    });
  });
 
  function wireNavButtons() {
    document.querySelectorAll('.btn-login, .btn-login-prompt').forEach(btn => {
      btn.addEventListener('click', openLogin);
    });
    document.querySelectorAll('.btn-signup').forEach(btn => {
      btn.addEventListener('click', openSignup);
    });
    document.querySelectorAll('.profile-icon').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); openProfile(); });
    });
    document.querySelectorAll('.enrolled-link, .see-all').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); openEnrolled(); });
    });
    document.querySelectorAll('.course-sign-in').forEach(btn => {
      btn.addEventListener('click', openLogin);
    });
  }
 
  updateNavbar();
  updateContinueLearning();
  wireNavButtons();
 
})();

