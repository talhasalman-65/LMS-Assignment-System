(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'teacher') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  initLayout('teacher', 'Reports');
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header"><h1>Reports</h1></div>
    <div class="tab-bar" id="tab-bar">
      <div class="tab-item active" data-tab="overview">Overview</div>
      <div class="tab-item" data-tab="performance">Performance</div>
      <div class="tab-item" data-tab="missing">Missing</div>
    </div>
    <div id="tab-overview" class="tab-content active">
      <div class="card">
        <div class="card-body" id="overview-content"><div class="skeleton skeleton-text"></div></div>
      </div>
    </div>
    <div id="tab-performance" class="tab-content">
      <div class="card">
        <div class="card-body" id="performance-content"><div class="skeleton skeleton-text"></div></div>
      </div>
    </div>
    <div id="tab-missing" class="tab-content">
      <div class="card">
        <div class="card-body" id="missing-content"><div class="skeleton skeleton-text"></div></div>
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

  const stats = await apiRequest('/reports/teacher/stats');
  document.getElementById('overview-content').innerHTML = `
    <div class="stat-grid" style="grid-template-columns:repeat(2,1fr)">
      <div class="stat-card"><div class="stat-info"><div class="stat-label">Total Assignments</div><div class="stat-value">${stats.total_assignments}</div></div></div>
      <div class="stat-card"><div class="stat-info"><div class="stat-label">Total Submissions</div><div class="stat-value">${stats.total_submissions}</div></div></div>
      <div class="stat-card"><div class="stat-info"><div class="stat-label">Pending Reviews</div><div class="stat-value">${stats.pending_reviews}</div></div></div>
      <div class="stat-card"><div class="stat-info"><div class="stat-label">Late Submissions</div><div class="stat-value">${stats.late_submissions}</div></div></div>
    </div>
  `;

  const assignRes = await apiRequest('/assignments', { params: { limit: 50 } });
  const assignments = assignRes.assignments || [];

  document.getElementById('performance-content').innerHTML = assignments.length === 0
    ? '<div class="empty-state"><p>No assignments yet</p></div>'
    : `<div><label>Select Assignment:</label>
      <select class="form-select" id="perf-select">
        <option value="">Select...</option>
        ${assignments.map(a => `<option value="${a.id}">${escapeHtml(a.title)}</option>`).join('')}
      </select>
      <div id="perf-data" style="margin-top:16px"></div>
    </div>`;

  document.getElementById('perf-select').addEventListener('change', async (e) => {
    const id = e.target.value;
    if (!id) return;
    const el = document.getElementById('perf-data');
    el.innerHTML = '<div class="skeleton skeleton-text"></div>';
    try {
      const data = await apiRequest(`/reports/teacher/performance/${id}`);
      if (data.length === 0) { el.innerHTML = '<div class="empty-state"><p>No data</p></div>'; return; }
      el.innerHTML = `<table><thead><tr><th>Student</th><th>Attempts</th><th>Status</th><th>Marks</th><th>Grade</th><th>Late</th></tr></thead>
        <tbody>${data.map(d => `<tr>
          <td>${escapeHtml(d.full_name)}</td>
          <td>${d.attempts || 0}</td>
          <td>${getStatusBadge(d.status || 'not_submitted')}</td>
          <td>${d.marks !== null ? d.marks : '-'}</td>
          <td>${d.grade || '-'}</td>
          <td>${d.is_late ? 'Yes' : 'No'}</td>
        </tr>`).join('')}</tbody></table>`;
    } catch (err) { handleApiError(err); }
  });

  document.getElementById('missing-content').innerHTML = assignments.length === 0
    ? '<div class="empty-state"><p>No assignments</p></div>'
    : `<div><label>Select Assignment:</label>
      <select class="form-select" id="miss-select">
        <option value="">Select...</option>
        ${assignments.map(a => `<option value="${a.id}">${escapeHtml(a.title)}</option>`).join('')}
      </select>
      <div id="miss-data" style="margin-top:16px"></div>
    </div>`;

  document.getElementById('miss-select').addEventListener('change', async (e) => {
    const id = e.target.value;
    if (!id) return;
    const el = document.getElementById('miss-data');
    el.innerHTML = '<div class="skeleton skeleton-text"></div>';
    try {
      const data = await apiRequest(`/reports/teacher/missing/${id}`);
      if (data.length === 0) { el.innerHTML = '<div class="empty-state"><p>All students have submitted</p></div>'; return; }
      el.innerHTML = `<table><thead><tr><th>Name</th><th>Roll No</th><th>Email</th></tr></thead>
        <tbody>${data.map(d => `<tr><td>${escapeHtml(d.full_name)}</td><td>${escapeHtml(d.roll_number || '-')}</td><td>${escapeHtml(d.email)}</td></tr>`).join('')}</tbody></table>`;
    } catch (err) { handleApiError(err); }
  });
})();
