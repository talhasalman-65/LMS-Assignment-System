(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'student') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  initLayout('student', 'Grades & Feedback');
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header"><h1>Grades & Feedback</h1></div>
    <div class="card">
      <div class="card-body" id="grades-list"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div></div>
    </div>
  `;

  try {
    const res = await apiRequest('/submissions', { params: { status: 'graded', limit: 50 } });
    const subs = res.submissions || [];
    const el = document.getElementById('grades-list');
    if (subs.length === 0) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">⭐</div><h3>No grades yet</h3><p>Your graded submissions will appear here</p></div>';
    } else {
      el.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px">' +
        subs.map(s => `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid var(--border);border-radius:var(--radius)">
          <div style="flex:1">
            <div style="font-weight:500">${escapeHtml(s.assignment_title)}</div>
            <div style="font-size:0.8rem;color:var(--text-light)">${formatDate(s.submitted_at)}</div>
            ${s.feedback ? `<div style="font-size:0.8rem;color:var(--text-light);margin-top:4px">Feedback: ${escapeHtml(s.feedback)}</div>` : ''}
          </div>
          <div style="text-align:right">
            <div style="font-size:1.2rem;font-weight:700;color:var(--primary)">${s.marks || '-'}</div>
            ${s.grade ? `<div class="badge badge-graded">${s.grade}</div>` : ''}
          </div>
        </div>`).join('') + '</div>';
    }
  } catch (err) { handleApiError(err); }
})();
