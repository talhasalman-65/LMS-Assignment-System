(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'student') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  initLayout('student', 'My Submissions');
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header"><h1>My Submissions</h1></div>
    <div class="filter-bar">
      <input type="text" class="search-input" id="search" placeholder="Search by assignment..." />
      <select class="form-select" id="status-filter">
        <option value="">All Status</option>
        <option value="submitted">Submitted</option>
        <option value="under_review">Under Review</option>
        <option value="graded">Graded</option>
        <option value="returned_for_revision">Returned</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>
    <div class="card">
      <div class="card-body" id="submission-list"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div></div>
      <div class="pagination" id="pagination"></div>
    </div>
  `;

  let page = 1, filters = {};
  async function load() {
    const el = document.getElementById('submission-list');
    el.innerHTML = '<div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div>';
    try {
      const res = await apiRequest('/submissions', { params: { ...filters, page, limit: 10 } });
      const subs = res.submissions || [];
      if (subs.length === 0) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">📤</div><h3>No submissions yet</h3><p>Submit your assignments to see them here</p></div>';
      } else {
        el.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px">' +
          subs.map(s => `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid var(--border);border-radius:var(--radius)">
            <div style="flex:1">
              <div style="font-weight:500">${escapeHtml(s.assignment_title)}</div>
              <div style="font-size:0.8rem;color:var(--text-light)">Submitted: ${formatDate(s.submitted_at)}</div>
              ${s.files && s.files.length > 0 ? `<div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">
                ${s.files.map(f => {
                  const fileUrl = '/uploads/' + (f.filePath || '').split(/[/\\]/).pop();
                  return `<a href="${fileUrl}" target="_blank" style="font-size:0.8rem;color:var(--primary)">${escapeHtml(f.fileName)}</a>`;
                }).join('')}
              </div>` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              ${getLateBadge(s.is_late)}
              ${getStatusBadge(s.status)}
              ${s.status === 'graded' ? `<a href="/pages/student/grades.html" class="btn btn-outline btn-sm">View Grade</a>` : ''}
            </div>
          </div>`).join('') + '</div>';
      }

      const pag = document.getElementById('pagination');
      if (res.pagination && res.pagination.totalPages > 1) {
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
  load();
})();
