(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'teacher') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  initLayout('teacher', 'Dashboard');

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <h1>Dashboard</h1>
      <div class="actions-row">
        <a href="/pages/teacher/create-assignment.html" class="btn btn-primary btn-sm">+ Create Assignment</a>
        <a href="/pages/teacher/submissions.html" class="btn btn-outline btn-sm">Review Submissions</a>
      </div>
    </div>
    <div class="stat-grid" id="stats-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div class="card">
        <div class="card-header"><h3>Recent Submissions</h3></div>
        <div class="card-body" id="recent-submissions"><div class="skeleton skeleton-text"></div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Activity Feed</h3></div>
        <div class="card-body" id="activity-feed"><div class="skeleton skeleton-text"></div></div>
      </div>
    </div>
  `;

  try {
    const stats = await apiRequest('/reports/teacher/stats');
    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon primary"><img src="/logos/assignment.png" alt="Assignments" class="stat-icon-img"></div>
        <div class="stat-info"><div class="stat-label">Assignments</div><div class="stat-value">${stats.total_assignments}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info"><img src="/logos/inbox.png" alt="Total Submissions" class="stat-icon-img"></div>
        <div class="stat-info"><div class="stat-label">Total Submissions</div><div class="stat-value">${stats.total_submissions}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><img src="/logos/pending.png" alt="Pending Review" class="stat-icon-img"></div>
        <div class="stat-info"><div class="stat-label">Pending Review</div><div class="stat-value">${stats.pending_reviews}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><img src="/logos/checkmark.png" alt="Graded" class="stat-icon-img"></div>
        <div class="stat-info"><div class="stat-label">Graded</div><div class="stat-value">${stats.graded_submissions}</div></div>
      </div>
    `;

    const [subsRes, activityRes] = await Promise.all([
      apiRequest('/submissions', { params: { limit: 5 } }),
      apiRequest('/users/activity'),
    ]);

    const subs = subsRes.submissions || [];
    document.getElementById('recent-submissions').innerHTML = subs.length === 0
      ? '<div class="empty-state"><p>No submissions yet</p></div>'
      : '<div style="display:flex;flex-direction:column;gap:6px">' +
        subs.map(s => `<div style="display:flex;justify-content:space-between;padding:8px;border:1px solid var(--border);border-radius:var(--radius)">
          <div style="font-size:0.85rem">${escapeHtml(s.student_name)} - ${escapeHtml(s.assignment_title)}</div>
          <div>${getStatusBadge(s.status)}</div>
        </div>`).join('') + '</div>';

    const activity = activityRes || [];
    document.getElementById('activity-feed').innerHTML = activity.length === 0
      ? '<div class="empty-state"><p>No activity yet</p></div>'
      : '<div style="display:flex;flex-direction:column;gap:6px">' +
        activity.slice(0, 10).map(a => `<div style="display:flex;justify-content:space-between;font-size:0.85rem;padding:4px 0">
          <span>${escapeHtml(a.description || a.activity_type)}</span>
          <span style="color:var(--text-light)">${formatDate(a.created_at)}</span>
        </div>`).join('') + '</div>';
  } catch (err) { handleApiError(err); }
})();
