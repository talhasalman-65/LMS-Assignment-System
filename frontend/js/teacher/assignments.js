(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'teacher') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  const viewId = new URLSearchParams(window.location.search).get('id');

  if (viewId) {
    initLayout('teacher', 'Assignment Details');
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="skeleton skeleton-card" style="height:400px"></div>';

    try {
      const a = await apiRequest(`/assignments/${viewId}`);
      content.innerHTML = `
        <div class="page-header">
          <h1>${escapeHtml(a.title)}</h1>
          <div class="actions-row" id="assignment-actions" data-id="${a.id}">
            <a href="/pages/teacher/create-assignment.html?edit=${a.id}" class="btn btn-primary btn-sm">Edit</a>
            <a href="/pages/teacher/submissions.html?assignmentId=${a.id}" class="btn btn-outline btn-sm">View Submissions</a>
            <button class="btn btn-outline btn-sm" data-action="archive">Archive</button>
            <button class="btn btn-danger btn-sm" data-action="delete">Delete</button>
          </div>
        </div>

        <div class="card" style="margin-bottom:20px">
          <div class="card-header"><h3>Details</h3></div>
          <div class="card-body">
            <div class="detail-grid">
              <div class="detail-item"><div class="detail-label">Status</div><div class="detail-value">${getStatusBadge(a.status)}</div></div>
              <div class="detail-item"><div class="detail-label">Due Date</div><div class="detail-value">${formatDate(a.due_date)}</div></div>
              <div class="detail-item"><div class="detail-label">Max Marks</div><div class="detail-value">${a.max_marks}</div></div>
              <div class="detail-item"><div class="detail-label">Type</div><div class="detail-value">${a.assignment_type}</div></div>
              <div class="detail-item"><div class="detail-label">Attempts</div><div class="detail-value">${a.max_attempts}</div></div>
            </div>
            ${a.description ? `<div style="margin-bottom:8px"><strong>Description:</strong><p style="color:var(--text-light);margin-top:4px">${escapeHtml(a.description)}</p></div>` : ''}
            ${a.instructions ? `<div><strong>Instructions:</strong><p style="color:var(--text-light);margin-top:4px">${escapeHtml(a.instructions)}</p></div>` : ''}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>Targets</h3></div>
          <div class="card-body">
            ${a.targets && a.targets.length > 0
              ? a.targets.map(t => `<span class="badge badge-active" style="margin:2px">${t.targetType}: ${t.targetId}</span>`).join(' ')
              : '<span class="text-muted">No targets set</span>'}
          </div>
        </div>
      `;

      document.getElementById('assignment-actions').addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = parseInt(e.currentTarget.dataset.id);
        const action = btn.dataset.action;

        if (action === 'archive') {
          try { await apiRequest(`/assignments/${id}/archive`, { method: 'POST' }); showToast('Archived', 'success'); location.reload(); }
          catch (err) { showToast(err.message, 'error'); }
        } else if (action === 'delete') {
          if (!confirm('Delete this assignment?')) return;
          try { await apiRequest(`/assignments/${id}`, { method: 'DELETE' }); showToast('Deleted', 'success'); window.location.href = '/pages/teacher/assignments.html'; }
          catch (err) { showToast(err.message, 'error'); }
        }
      });
    } catch (err) { handleApiError(err); }
    return;
  }

  initLayout('teacher', 'Assignments');
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <h1>Assignments</h1>
      <a href="/pages/teacher/create-assignment.html" class="btn btn-primary btn-sm">+ Create</a>
    </div>
    <div class="filter-bar">
      <input type="text" class="search-input" id="search" placeholder="Search..." />
      <select class="form-select" id="status-filter">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="due_soon">Due Soon</option>
        <option value="expired">Expired</option>
        <option value="archived">Archived</option>
      </select>
    </div>
    <div class="card">
      <div class="card-body" id="assignment-list"><div class="skeleton skeleton-text"></div></div>
      <div class="pagination" id="pagination"></div>
    </div>
  `;

  let page = 1, filters = {};
  async function load() {
    const el = document.getElementById('assignment-list');
    el.innerHTML = '<div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div>';
    try {
      const res = await apiRequest('/assignments', { params: { ...filters, page, limit: 10 } });
      const items = res.assignments || [];
      if (items.length === 0) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><h3>No assignments</h3><p>Create your first assignment</p></div>';
      } else {
        el.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px">' +
          items.map(a => `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid var(--border);border-radius:var(--radius)">
            <div>
              <div style="font-weight:500">${escapeHtml(a.title)}</div>
              <div style="font-size:0.8rem;color:var(--text-light)">Due: ${formatDate(a.due_date)} | ${a.max_marks} marks</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              ${getStatusBadge(a.is_archived ? 'archived' : (a.status || 'active'))}
              <a href="/pages/teacher/assignments.html?id=${a.id}" class="btn btn-outline btn-sm">View</a>
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
  load();
})();
