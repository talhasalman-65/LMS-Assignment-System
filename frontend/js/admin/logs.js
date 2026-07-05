(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'administrator') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  initLayout('administrator', 'System Logs');
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header"><h1>System Logs</h1></div>
    <div class="filter-bar">
      <input type="text" class="search-input" id="search" placeholder="Search action..." />
      <select class="form-select" id="entity-filter">
        <option value="">All Entities</option>
        <option value="users">Users</option>
        <option value="assignments">Assignments</option>
        <option value="submissions">Submissions</option>
        <option value="settings">Settings</option>
      </select>
    </div>
    <div class="card">
      <div class="card-body" id="log-list"><div class="skeleton skeleton-text"></div></div>
      <div class="pagination" id="pagination"></div>
    </div>
  `;

  let page = 1, filters = {};
  async function load() {
    const el = document.getElementById('log-list');
    el.innerHTML = '<div class="skeleton skeleton-text"></div>';
    try {
      const res = await apiRequest('/logs', { params: { ...filters, page, limit: 20 } });
      const logs = res.logs || [];
      if (logs.length === 0) {
        el.innerHTML = '<div class="empty-state"><p>No logs found</p></div>';
      } else {
        el.innerHTML = `<table><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th></tr></thead>
          <tbody>${logs.map(l => `<tr>
            <td style="white-space:nowrap">${formatDate(l.created_at)}</td>
            <td>${escapeHtml(l.actor_name || 'System')}</td>
            <td>${escapeHtml(l.action)}</td>
            <td>${l.entity_type ? `${l.entity_type} #${l.entity_id}` : '-'}</td>
          </tr>`).join('')}</tbody></table>`;
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

  document.getElementById('search').addEventListener('input', debounce(e => { filters.action = e.target.value; page = 1; load(); }, 300));
  document.getElementById('entity-filter').addEventListener('change', e => { filters.entityType = e.target.value; page = 1; load(); });
  load();
})();
