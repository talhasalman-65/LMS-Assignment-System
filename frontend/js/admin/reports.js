(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'administrator') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  initLayout('administrator', 'Reports');
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header"><h1>Reports</h1></div>
    <div class="tab-bar" id="tab-bar">
      <div class="tab-item active" data-tab="overview">Overview</div>
      <div class="tab-item" data-tab="teachers">Teacher Activity</div>
      <div class="tab-item" data-tab="growth">User Growth</div>
    </div>
    <div id="tab-overview" class="tab-content active">
      <div class="card">
        <div class="card-body" id="overview-content"><div class="skeleton skeleton-text"></div></div>
      </div>
    </div>
    <div id="tab-teachers" class="tab-content">
      <div class="card">
        <div class="card-body" id="teachers-content"><div class="skeleton skeleton-text"></div></div>
      </div>
    </div>
    <div id="tab-growth" class="tab-content">
      <div class="card">
        <div class="card-body" id="growth-content"><div class="skeleton skeleton-text"></div></div>
      </div>
    </div>
  `;

  document.getElementById('tab-bar').addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (!tab) return;
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });

  try {
    const stats = await apiRequest('/reports/admin/stats');
    document.getElementById('overview-content').innerHTML = `
      <div class="stat-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card"><div class="stat-info"><div class="stat-label">Students</div><div class="stat-value">${stats.total_students}</div></div></div>
        <div class="stat-card"><div class="stat-info"><div class="stat-label">Teachers</div><div class="stat-value">${stats.total_teachers}</div></div></div>
        <div class="stat-card"><div class="stat-info"><div class="stat-label">Assignments</div><div class="stat-value">${stats.total_assignments}</div></div></div>
        <div class="stat-card"><div class="stat-info"><div class="stat-label">Submissions</div><div class="stat-value">${stats.total_submissions}</div></div></div>
        <div class="stat-card"><div class="stat-info"><div class="stat-label">Late Submissions</div><div class="stat-value">${stats.late_submissions}</div></div></div>
        <div class="stat-card"><div class="stat-info"><div class="stat-label">Completion Rate</div><div class="stat-value">${stats.completion_rate || 0}%</div></div></div>
      </div>
    `;

    const [teacherActivity, userGrowth] = await Promise.all([
      apiRequest('/reports/admin/teacher-activity'),
      apiRequest('/reports/admin/user-growth'),
    ]);

    document.getElementById('teachers-content').innerHTML = teacherActivity.length === 0
      ? '<div class="empty-state"><p>No teacher activity data</p></div>'
      : `<table><thead><tr><th>Teacher</th><th>Assignments Created</th><th>Submissions Reviewed</th></tr></thead>
        <tbody>${teacherActivity.map(t => `<tr><td>${escapeHtml(t.full_name)}</td><td>${t.assignments_created}</td><td>${t.submissions_reviewed}</td></tr>`).join('')}</tbody></table>`;

    document.getElementById('growth-content').innerHTML = userGrowth.length === 0
      ? '<div class="empty-state"><p>No growth data</p></div>'
      : `<table><thead><tr><th>Date</th><th>Role</th><th>Count</th></tr></thead>
        <tbody>${userGrowth.map(g => `<tr><td>${g.date}</td><td>${g.role}</td><td>${g.count}</td></tr>`).join('')}</tbody></table>`;
  } catch (err) { handleApiError(err); }
})();
