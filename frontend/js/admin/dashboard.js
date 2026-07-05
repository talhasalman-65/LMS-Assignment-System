(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'administrator') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  initLayout('administrator', 'Dashboard');

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <h1>Admin Dashboard</h1>
      <div class="actions-row">
        <a href="/pages/admin/users.html" class="btn btn-primary btn-sm">+ Create User</a>
        <a href="/pages/admin/reports.html" class="btn btn-outline btn-sm">View Reports</a>
      </div>
    </div>
    <div class="stat-grid" id="stats-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div class="card">
        <div class="card-header"><h3>Recent Activity</h3></div>
        <div class="card-body" id="activity-list"><div class="skeleton skeleton-text"></div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Quick Actions</h3></div>
        <div class="card-body">
          <div style="display:flex;flex-direction:column;gap:8px">
            <a href="/pages/admin/users.html" class="btn btn-outline" style="justify-content:center">Manage Users</a>
            <a href="/pages/admin/settings.html" class="btn btn-outline" style="justify-content:center">System Settings</a>
            <a href="/pages/admin/logs.html" class="btn btn-outline" style="justify-content:center">View Logs</a>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    const stats = await apiRequest('/reports/admin/stats');
    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon primary">👥</div>
        <div class="stat-info"><div class="stat-label">Total Users</div><div class="stat-value">${stats.total_students + stats.total_teachers + stats.total_admins}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info">🎓</div>
        <div class="stat-info"><div class="stat-label">Students</div><div class="stat-value">${stats.total_students}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">👨‍🏫</div>
        <div class="stat-info"><div class="stat-label">Teachers</div><div class="stat-value">${stats.total_teachers}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">📝</div>
        <div class="stat-info"><div class="stat-label">Assignments</div><div class="stat-value">${stats.total_assignments}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info">📥</div>
        <div class="stat-info"><div class="stat-label">Submissions</div><div class="stat-value">${stats.total_submissions}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon danger">⏳</div>
        <div class="stat-info"><div class="stat-label">Pending</div><div class="stat-value">${stats.pending_submissions}</div></div>
      </div>
    `;

    const logsRes = await apiRequest('/logs', { params: { limit: 10 } });
    const logs = logsRes.logs || [];
    document.getElementById('activity-list').innerHTML = logs.length === 0
      ? '<div class="empty-state"><p>No activity</p></div>'
      : '<div style="display:flex;flex-direction:column;gap:4px">' +
        logs.map(l => `<div style="display:flex;justify-content:space-between;font-size:0.8rem;padding:6px 0;border-bottom:1px solid var(--border)">
          <span>${escapeHtml(l.action)} ${l.entity_type ? `(${l.entity_type})` : ''}</span>
          <span style="color:var(--text-light)">${formatDate(l.created_at)}</span>
        </div>`).join('') + '</div>';
  } catch (err) { handleApiError(err); }
})();
