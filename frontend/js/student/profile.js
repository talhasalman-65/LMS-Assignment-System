(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'student') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  initLayout('student', 'Profile');
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header"><h1>Profile</h1></div>
    <div class="card" style="max-width:600px">
      <div class="card-header"><h3>Personal Information</h3></div>
      <div class="card-body">
        <form id="profile-form">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" id="fullName" value="${escapeHtml(user.full_name)}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" value="${escapeHtml(user.email)}" disabled style="opacity:0.7">
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="text" class="form-input" id="phoneNumber" value="${escapeHtml(user.phone_number || '')}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Roll Number</label>
              <input type="text" class="form-input" value="${escapeHtml(user.roll_number || '')}" disabled style="opacity:0.7">
            </div>
            <div class="form-group">
              <label class="form-label">Registration Number</label>
              <input type="text" class="form-input" value="${escapeHtml(user.registration_number || '')}" disabled style="opacity:0.7">
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Update Profile</button>
        </form>
      </div>
    </div>

    <div class="card" style="max-width:600px;margin-top:20px">
      <div class="card-header"><h3>Change Password</h3></div>
      <div class="card-body">
        <form id="password-form">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <input type="password" class="form-input" id="currentPassword" required>
          </div>
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input type="password" class="form-input" id="newPassword" required minlength="8">
            <div style="font-size:0.8rem;color:var(--text-light);margin-top:4px">Min 8 chars, 1 uppercase, 1 lowercase, 1 number</div>
          </div>
          <button type="submit" class="btn btn-primary">Change Password</button>
        </form>
      </div>
    </div>

    <div class="card" style="max-width:600px;margin-top:20px">
      <div class="card-header"><h3>Recent Activity</h3></div>
      <div class="card-body" id="activity-list"><div class="skeleton skeleton-text"></div></div>
    </div>
  `;

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/users/profile', {
        method: 'PUT',
        body: { fullName: document.getElementById('fullName').value, phoneNumber: document.getElementById('phoneNumber').value }
      });
      showToast('Profile updated', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  });

  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: { currentPassword: document.getElementById('currentPassword').value, password: document.getElementById('newPassword').value }
      });
      showToast('Password changed', 'success');
      e.target.reset();
    } catch (err) { showToast(err.message, 'error'); }
  });

  try {
    const activity = await apiRequest('/users/activity');
    const el = document.getElementById('activity-list');
    if (activity.length === 0) {
      el.innerHTML = '<div class="empty-state"><p>No activity recorded</p></div>';
    } else {
      el.innerHTML = '<div style="display:flex;flex-direction:column;gap:6px">' +
        activity.slice(0, 10).map(a => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:0.85rem">${escapeHtml(a.description || a.activity_type)}</span>
          <span style="font-size:0.8rem;color:var(--text-light)">${formatDate(a.created_at)}</span>
        </div>`).join('') + '</div>';
    }
  } catch {}
})();
