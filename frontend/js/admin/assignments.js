(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'administrator') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  initLayout('administrator', 'Assignments');
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header"><h1>All Assignments</h1></div>
    <div class="filter-bar">
      <input type="text" class="search-input" id="search" placeholder="Search..." />
      <select class="form-select" id="type-filter">
        <option value="">All Types</option>
        <option value="homework">Homework</option>
        <option value="classwork">Classwork</option>
        <option value="project">Project</option>
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
    el.innerHTML = '<div class="skeleton skeleton-text"></div>';
    try {
      const res = await apiRequest('/assignments', { params: { ...filters, page, limit: 20 } });
      const items = res.assignments || [];
      if (items.length === 0) {
        el.innerHTML = '<div class="empty-state"><p>No assignments</p></div>';
      } else {
        el.innerHTML = `<table><thead><tr><th>Title</th><th>Teacher</th><th>Due Date</th><th>Marks</th><th>Type</th></tr></thead>
          <tbody>${items.map(a => `<tr>
            <td>${escapeHtml(a.title)}</td>
            <td>${escapeHtml(a.teacher_name)}</td>
            <td>${formatDate(a.due_date)}</td>
            <td>${a.max_marks}</td>
            <td>${a.assignment_type}</td>
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

  document.getElementById('search').addEventListener('input', debounce(e => { filters.search = e.target.value; page = 1; load(); }, 300));
  document.getElementById('type-filter').addEventListener('change', e => { filters.type = e.target.value; page = 1; load(); });
  load();
})();
