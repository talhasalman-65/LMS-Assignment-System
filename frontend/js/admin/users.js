(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'administrator') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  initLayout('administrator', 'Users');

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <h1>Users</h1>
      <button class="btn btn-primary btn-sm" data-action="open-modal" data-modal="create-user-modal">+ Create User</button>
    </div>
    <div class="filter-bar">
      <input type="text" class="search-input" id="search" placeholder="Search by name or email..." />
      <select class="form-select" id="role-filter">
        <option value="">All Roles</option>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="administrator">Administrator</option>
      </select>
      <select class="form-select" id="status-filter">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="suspended">Suspended</option>
      </select>
    </div>
    <div class="card">
      <div class="card-body" id="user-list"><div class="skeleton skeleton-text"></div></div>
      <div class="pagination" id="pagination"></div>
    </div>

    <div class="modal-overlay" id="create-user-modal">
      <div class="modal">
        <div class="modal-header">
          <h3>Create User</h3>
          <button class="modal-close" data-action="close-modal" data-modal="create-user-modal">&times;</button>
        </div>
        <div class="modal-body">
          <form id="create-user-form">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" class="form-input" id="newName" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input type="email" class="form-input" id="newEmail" required>
            </div>
            <div class="form-group">
              <label class="form-label">Role *</label>
              <select class="form-select" id="newRole" required>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
            <div class="form-group" id="student-fields" style="display:none">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Roll Number</label>
                  <input type="text" class="form-input" id="newRollNumber">
                </div>
                <div class="form-group">
                  <label class="form-label">Registration Number</label>
                  <input type="text" class="form-input" id="newRegNumber">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Class</label>
                  <select class="form-select" id="newClass"></select>
                </div>
                <div class="form-group">
                  <label class="form-label">Section</label>
                  <select class="form-select" id="newSection"></select>
                </div>
              </div>
            </div>
            <div class="form-group" id="teacher-fields" style="display:none">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Employee ID</label>
                  <input type="text" class="form-input" id="newEmployeeId">
                </div>
                <div class="form-group">
                  <label class="form-label">Department</label>
                  <input type="text" class="form-input" id="newDepartment">
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="text" class="form-input" id="newPhone">
            </div>
            <div class="form-group">
              <label class="form-label">Password (default: Password1)</label>
              <input type="password" class="form-input" id="newPassword" placeholder="Leave blank for default">
            </div>
            <button type="submit" class="btn btn-primary">Create User</button>
          </form>
        </div>
      </div>
    </div>

    <div class="modal-overlay" id="edit-user-modal">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit User</h3>
          <button class="modal-close" data-action="close-modal" data-modal="edit-user-modal">&times;</button>
        </div>
        <div class="modal-body">
          <form id="edit-user-form">
            <input type="hidden" id="editUserId">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" id="editName" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" id="editEmail" required>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select" id="editStatus">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="text" class="form-input" id="editPhone">
            </div>
            <button type="submit" class="btn btn-primary">Update User</button>
            <button type="button" class="btn btn-danger" id="delete-user-btn">Delete User</button>
          </form>
        </div>
      </div>
    </div>
  `;

  content.addEventListener('click', (e) => {
    const modalBtn = e.target.closest('[data-action]');
    if (!modalBtn) return;
    const action = modalBtn.dataset.action;
    if (action === 'open-modal') {
      openModal(modalBtn.dataset.modal);
    } else if (action === 'close-modal') {
      closeModal(modalBtn.dataset.modal);
    } else if (action === 'edit-user') {
      editUser(parseInt(modalBtn.dataset.userId));
    } else if (action === 'activate-user') {
      activateUser(parseInt(modalBtn.dataset.userId));
    } else if (action === 'suspend-user') {
      suspendUser(parseInt(modalBtn.dataset.userId));
    } else if (action === 'reset-password') {
      resetPassword(parseInt(modalBtn.dataset.userId));
    }
  });

  const [classes, sections] = await Promise.all([
    apiRequest('/classes'),
    apiRequest('/sections'),
  ]);

  const classSelect = document.getElementById('newClass');
  classes.forEach(c => { const o = document.createElement('option'); o.value = c.id; o.textContent = c.name; classSelect.appendChild(o); });

  const sectionSelect = document.getElementById('newSection');
  sections.forEach(s => { const o = document.createElement('option'); o.value = s.id; o.textContent = s.name; sectionSelect.appendChild(o); });

  document.getElementById('newRole').addEventListener('change', (e) => {
    document.getElementById('student-fields').style.display = e.target.value === 'student' ? 'block' : 'none';
    document.getElementById('teacher-fields').style.display = e.target.value === 'teacher' ? 'block' : 'none';
  });

  let page = 1, filters = {};

  async function load() {
    const el = document.getElementById('user-list');
    el.innerHTML = '<div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div>';
    try {
      const res = await apiRequest('/users', { params: { ...filters, page, limit: 20 } });
      const users = res.users || [];
      if (users.length === 0) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon"><img src="/logos/users.png" alt="No users found" class="empty-icon-img"></div><h3>No users found</h3></div>';
      } else {
        el.innerHTML = `<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${users.map(u => `<tr>
            <td>${escapeHtml(u.full_name)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td><span class="badge badge-active">${u.role}</span></td>
            <td>${getStatusBadge(u.status === 'active' ? 'approved' : u.status === 'suspended' ? 'rejected' : 'draft')}</td>
            <td>
              <button class="btn btn-outline btn-sm" data-action="edit-user" data-user-id="${u.id}">Edit</button>
              ${u.status === 'suspended'
                ? `<button class="btn btn-success btn-sm" data-action="activate-user" data-user-id="${u.id}">Activate</button>`
                : `<button class="btn btn-danger btn-sm" data-action="suspend-user" data-user-id="${u.id}">Suspend</button>`}
              <button class="btn btn-outline btn-sm" data-action="reset-password" data-user-id="${u.id}">Reset Pwd</button>
            </td>
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

  async function editUser(id) {
    try {
      const u = await apiRequest(`/users/${id}`);
      document.getElementById('editUserId').value = u.id;
      document.getElementById('editName').value = u.full_name;
      document.getElementById('editEmail').value = u.email;
      document.getElementById('editStatus').value = u.status;
      document.getElementById('editPhone').value = u.phone_number || '';
      openModal('edit-user-modal');
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function activateUser(id) {
    try { await apiRequest(`/users/${id}/activate`, { method: 'POST' }); showToast('User activated', 'success'); load(); }
    catch (err) { showToast(err.message, 'error'); }
  }

  async function suspendUser(id) {
    try { await apiRequest(`/users/${id}/suspend`, { method: 'POST' }); showToast('User suspended', 'success'); load(); }
    catch (err) { showToast(err.message, 'error'); }
  }

  async function resetPassword(id) {
    const pwd = prompt('Enter new password (min 8 chars, 1 upper, 1 lower, 1 number):', 'Password1');
    if (!pwd) return;
    try { await apiRequest('/auth/reset-password', { method: 'POST', body: { userId: id, password: pwd } }); showToast('Password reset', 'success'); }
    catch (err) { showToast(err.message, 'error'); }
  }

  document.getElementById('search').addEventListener('input', debounce(e => { filters.search = e.target.value; page = 1; load(); }, 300));
  document.getElementById('role-filter').addEventListener('change', e => { filters.role = e.target.value; page = 1; load(); });
  document.getElementById('status-filter').addEventListener('change', e => { filters.status = e.target.value; page = 1; load(); });

  document.getElementById('create-user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      fullName: document.getElementById('newName').value,
      email: document.getElementById('newEmail').value,
      role: document.getElementById('newRole').value,
      phoneNumber: document.getElementById('newPhone').value,
      password: document.getElementById('newPassword').value || undefined,
    };

    if (data.role === 'student') {
      data.rollNumber = document.getElementById('newRollNumber').value;
      data.registrationNumber = document.getElementById('newRegNumber').value;
      data.classId = parseInt(document.getElementById('newClass').value) || undefined;
      data.sectionId = parseInt(document.getElementById('newSection').value) || undefined;
    } else if (data.role === 'teacher') {
      data.employeeId = document.getElementById('newEmployeeId').value;
      data.department = document.getElementById('newDepartment').value;
    }

    try {
      await apiRequest('/users', { method: 'POST', body: data });
      showToast('User created', 'success');
      closeModal('create-user-modal');
      load();
    } catch (err) { showToast(err.message, 'error'); }
  });

  document.getElementById('edit-user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editUserId').value;
    try {
      await apiRequest(`/users/${id}`, {
        method: 'PUT',
        body: {
          fullName: document.getElementById('editName').value,
          email: document.getElementById('editEmail').value,
          status: document.getElementById('editStatus').value,
          phoneNumber: document.getElementById('editPhone').value,
        }
      });
      showToast('User updated', 'success');
      closeModal('edit-user-modal');
      load();
    } catch (err) { showToast(err.message, 'error'); }
  });

  document.getElementById('delete-user-btn').addEventListener('click', async () => {
    if (!confirm('Delete this user?')) return;
    const id = document.getElementById('editUserId').value;
    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' });
      showToast('User deleted', 'success');
      closeModal('edit-user-modal');
      load();
    } catch (err) { showToast(err.message, 'error'); }
  });

  load();
})();
