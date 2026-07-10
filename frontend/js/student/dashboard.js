(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }

  try {
    const user = await getMe();
    if (user.role !== 'student') { window.location.href = '/'; return; }
  } catch { window.location.href = '/'; return; }

  initLayout('student', 'Dashboard');

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <h1>Dashboard</h1>
    </div>

    <div class="stat-grid" id="stats-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px" class="dashboard-grid">
      <div class="card" id="upcoming-card">
        <div class="card-header"><h3>Upcoming Assignments</h3></div>
        <div class="card-body" id="upcoming-list">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>
      <div class="card" id="grades-card">
        <div class="card-header"><h3>Recent Grades</h3></div>
        <div class="card-body" id="grades-list">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>
    </div>
  `;

  try {
    const [assignmentsRes, submissionsRes] = await Promise.all([
      apiRequest('/assignments', { params: { studentId: (await getMe()).id, status: 'active', limit: 5 } }),
      apiRequest('/submissions', { params: { limit: 5 } }),
    ]);

    const upcoming = assignmentsRes.assignments || [];
    const submissions = submissionsRes.submissions || [];

    const stats = {
      upcoming: upcoming.length,
      submitted: submissions.filter(s => s.status !== 'not_submitted').length,
      graded: submissions.filter(s => s.status === 'graded').length,
      late: submissions.filter(s => s.is_late).length,
    };

    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon primary"><img src="/logos/assignment.png" alt="Upcoming" class="stat-icon-img"></div>
        <div class="stat-info">
          <div class="stat-label">Upcoming</div>
          <div class="stat-value">${stats.upcoming}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info"><img src="/logos/submission.png" alt="Submitted" class="stat-icon-img"></div>
        <div class="stat-info">
          <div class="stat-label">Submitted</div>
          <div class="stat-value">${stats.submitted}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><img src="/logos/grades.png" alt="Graded" class="stat-icon-img"></div>
        <div class="stat-info">
          <div class="stat-label">Graded</div>
          <div class="stat-value">${stats.graded}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><img src="/logos/late.png" alt="Late" class="stat-icon-img"></div>
        <div class="stat-info">
          <div class="stat-label">Late</div>
          <div class="stat-value">${stats.late}</div>
        </div>
      </div>
    `;

    const upcomingHtml = upcoming.length === 0
      ? '<div class="empty-state"><p>No upcoming assignments</p></div>'
      : '<div style="display:flex;flex-direction:column;gap:8px">' +
        upcoming.map(a => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius)">
            <div>
              <div style="font-weight:500;font-size:0.9rem">${escapeHtml(a.title)}</div>
              <div style="font-size:0.8rem;color:var(--text-light)">Due: ${formatDate(a.due_date)}</div>
            </div>
            <a href="/pages/student/assignments.html?id=${a.id}" class="btn btn-outline btn-sm">View</a>
          </div>
        `).join('') + '</div>';
    document.getElementById('upcoming-list').innerHTML = upcomingHtml;

    const gradedSubs = submissions.filter(s => s.status === 'graded');
    const gradesHtml = gradedSubs.length === 0
      ? '<div class="empty-state"><p>No grades yet</p></div>'
      : '<div style="display:flex;flex-direction:column;gap:8px">' +
        gradedSubs.map(s => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius)">
            <div>
              <div style="font-weight:500;font-size:0.9rem">${escapeHtml(s.assignment_title)}</div>
              <div style="font-size:0.8rem;color:var(--text-light)">${formatDate(s.submitted_at)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-weight:700;color:var(--primary)">${s.marks || '-'}/${s.max_marks}</span>
              ${s.grade ? `<span class="badge badge-graded">${s.grade}</span>` : ''}
            </div>
          </div>
        `).join('') + '</div>';
    document.getElementById('grades-list').innerHTML = gradesHtml;

  } catch (err) {
    handleApiError(err);
  }
})();
