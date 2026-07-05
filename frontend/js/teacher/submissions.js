(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'teacher') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  const params = new URLSearchParams(window.location.search);
  const assignmentId = params.get('assignmentId');

  initLayout('teacher', 'Submissions');
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header"><h1>Submissions</h1></div>
    <div class="filter-bar">
      <input type="text" class="search-input" id="search" placeholder="Search student..." />
      <select class="form-select" id="status-filter">
        <option value="">All Status</option>
        <option value="submitted">Submitted</option>
        <option value="under_review">Under Review</option>
        <option value="graded">Graded</option>
        <option value="returned_for_revision">Returned</option>
        <option value="rejected">Rejected</option>
      </select>
      <select class="form-select" id="late-filter">
        <option value="">All</option>
        <option value="true">Late Only</option>
        <option value="false">On Time</option>
      </select>
    </div>
    <div class="card">
      <div class="card-body" id="submission-list"><div class="skeleton skeleton-text"></div></div>
      <div class="pagination" id="pagination"></div>
    </div>
  `;

  let page = 1, filters = {};
  if (assignmentId) filters.assignmentId = assignmentId;

  async function load() {
    const el = document.getElementById('submission-list');
    el.innerHTML = '<div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div>';
    try {
      const res = await apiRequest('/submissions', { params: { ...filters, page, limit: 10 } });
      const subs = res.submissions || [];
      if (subs.length === 0) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">📥</div><h3>No submissions</h3></div>';
      } else {
        el.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px">' +
          subs.map(s => `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid var(--border);border-radius:var(--radius)">
            <div style="flex:1">
              <div style="font-weight:500">${escapeHtml(s.student_name)}</div>
              <div style="font-size:0.85rem;color:var(--text-light)">${escapeHtml(s.assignment_title)}</div>
              <div style="font-size:0.8rem;color:var(--text-light)">${formatDate(s.submitted_at)}</div>
              ${s.files && s.files.length > 0 ? `<div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">
                ${s.files.map(f => {
                  const fileUrl = '/uploads/' + (f.filePath || '').split(/[/\\]/).pop();
                  return `<a href="${fileUrl}" target="_blank" class="file-name" style="font-size:0.8rem">${escapeHtml(f.fileName)}</a>`;
                }).join('')}
              </div>` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              ${getLateBadge(s.is_late)}
              ${getStatusBadge(s.status)}
              <a href="/pages/teacher/grade-center.html?submissionId=${s.id}" class="btn btn-outline btn-sm">Grade</a>
            </div>
          </div>`).join('') + '</div>';
      }
      const pag = document.getElementById('pagination');
      if (res.pagination?.totalPages > 1) {
        pag.innerHTML = `<button data-page="${res.pagination.page - 1}" ${res.pagination.page <= 1 ? 'disabled' : ''}>Previous</button>
          <span class="page-info">Page ${res.pagination.page} of ${res.pagination.totalPages}</span>
          <button data-page="${res.pagination.page + 1}" ${res.pagination.page >= res.pagination.totalPages ? 'disabled' : ''}>Next</button>`;
        pag.onclick = (e) => {
          const btn = e.target.closest('[data-page]');
          if (btn && !btn.disabled) { page = parseInt(btn.dataset.page); load(); }
        };
      } else { pag.innerHTML = ''; }
    } catch (err) { handleApiError(err); }
  }

  document.getElementById('search').addEventListener('input', debounce(e => { filters.search = e.target.value; page = 1; load(); }, 300));
  document.getElementById('status-filter').addEventListener('change', e => { filters.status = e.target.value; page = 1; load(); });
  document.getElementById('late-filter').addEventListener('change', e => { filters.isLate = e.target.value; page = 1; load(); });
  load();
})();
