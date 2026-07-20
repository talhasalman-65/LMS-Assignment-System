(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try {
    user = await getMe();
    if (user.role !== 'student') { window.location.href = '/'; return; }
  } catch { window.location.href = '/'; return; }

  const params = new URLSearchParams(window.location.search);
  const viewId = params.get('id');

  if (viewId) {
    initLayout('student', 'Assignment Details');
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="skeleton skeleton-card" style="height:400px"></div>';

    try {
      const assignment = await apiRequest(`/assignments/${viewId}`);
      const submissions = await apiRequest(`/submissions/${viewId}/history`);
      const latestSub = submissions.length > 0 ? submissions[submissions.length - 1] : null;

      content.innerHTML = `
        <div class="page-header">
          <h1>${escapeHtml(assignment.title)}</h1>
          <div>
            ${getStatusBadge(assignment.status)}
            ${assignment.status !== 'Expired' && assignment.status !== 'Archived' ? `<a href="#submit" class="btn btn-primary btn-sm" onclick="document.getElementById('submit-section').scrollIntoView()">Submit</a>` : ''}
          </div>
        </div>

        <div class="card" style="margin-bottom:20px">
          <div class="card-header"><h3>Assignment Details</h3></div>
          <div class="card-body">
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">Due Date</div>
                <div class="detail-value">${formatDate(assignment.due_date)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Max Marks</div>
                <div class="detail-value">${assignment.max_marks}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Type</div>
                <div class="detail-value">${assignment.assignment_type}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Max Attempts</div>
                <div class="detail-value">${assignment.max_attempts}</div>
              </div>
            </div>

            ${assignment.description ? `<div style="margin-bottom:16px"><strong>Description:</strong><p style="margin-top:4px;color:var(--text-light)">${escapeHtml(assignment.description)}</p></div>` : ''}
            ${assignment.instructions ? `<div style="margin-bottom:16px"><strong>Instructions:</strong><p style="margin-top:4px;color:var(--text-light)">${escapeHtml(assignment.instructions)}</p></div>` : ''}

            ${assignment.attachments && assignment.attachments.length > 0 ? `
              <div>
                <strong>Attachments:</strong>
                <ul class="file-list" style="margin-top:8px">
                  ${assignment.attachments.map(f => {
                    const fileUrl = '/api/files/attachment/' + f.id;
                    return `
                    <li class="file-item">
                      <img src="/logos/attachment.png" class="file-icon" alt="Attachment">
                      <div class="file-info">
                        <a href="${fileUrl}" target="_blank" class="file-name">${escapeHtml(f.fileName)}</a>
                        <div class="file-size">${formatFileSize(f.fileSize)}</div>
                      </div>
                    </li>`;
                  }).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="card" style="margin-bottom:20px" id="submit-section">
          <div class="card-header"><h3>Your Submissions (${submissions.length}/${assignment.max_attempts})</h3></div>
          <div class="card-body">
              ${submissions.length === 0 ? '<div class="empty-state"><div class="empty-icon"><img src="/logos/submission.png" alt="No submissions" class="empty-icon-img"></div><h3>No submissions yet</h3><p>Submit your work for this assignment</p></div>' : `
              <div style="display:flex;flex-direction:column;gap:8px">
                ${submissions.map(s => `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid var(--border);border-radius:var(--radius)">
                    <div>
                      <div style="font-weight:500">Version ${s.version} ${getLateBadge(s.is_late)}</div>
                      <div style="font-size:0.85rem;color:var(--text-light)">${formatDate(s.submitted_at)}</div>
                      ${s.files && s.files.length > 0 ? `<div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">
                        ${s.files.map(f => {
                          const fileUrl = '/api/files/submission/' + f.id;
                          return `<a href="${fileUrl}" target="_blank" style="font-size:0.8rem;color:var(--primary)">${escapeHtml(f.fileName)}</a>`;
                        }).join('')}
                      </div>` : ''}
                    </div>
                    <div style="display:flex;align-items:center;gap:8px">
                      ${getStatusBadge(s.status)}
                    </div>
                  </div>
                `).join('')}
              </div>
            `}

            ${(assignment.status === 'Active' || assignment.status === 'Due Soon') && submissions.length < assignment.max_attempts ? `
              <hr style="border-color:var(--border);margin:20px 0">
              <h4 style="margin-bottom:12px">Submit Assignment</h4>
              <form id="submit-form">
                <div class="form-group">
                  <label class="form-label">Upload Files (PDF, DOCX, ZIP)</label>
                  <input type="file" class="form-input" id="file-input" accept=".pdf,.docx,.zip" multiple required>
                  <div style="font-size:0.8rem;color:var(--text-light);margin-top:4px">Max 5MB per file, up to 5 files</div>
                </div>
                <button type="submit" class="btn btn-primary">Submit Assignment</button>
              </form>
            ` : ''}
          </div>
        </div>

        ${latestSub && latestSub.status === 'graded' ? `
          <div class="card">
            <div class="card-header"><h3>Grade & Feedback</h3></div>
            <div class="card-body">
              <div class="grade-display">
                <div class="grade-label">Marks</div>
                <div class="grade-value">${escapeHtml(latestSub.marks || '-')} / ${assignment.max_marks}</div>
                ${latestSub.grade ? `<div class="grade-letter" style="color:var(--primary)">${latestSub.grade}</div>` : ''}
              </div>
              ${latestSub.feedback ? `<div style="margin-top:16px;padding:12px;background:var(--bg);border-radius:var(--radius)">
                <strong>Feedback:</strong>
                <p style="margin-top:4px;color:var(--text-light)">${escapeHtml(latestSub.feedback)}</p>
              </div>` : ''}
            </div>
          </div>
        ` : ''}
      `;

      const form = document.getElementById('submit-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const files = document.getElementById('file-input').files;
          if (files.length === 0) { showToast('Please select files', 'warning'); return; }

          const formData = new FormData();
          for (const file of files) { formData.append('files', file); }

          try {
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Submitting...';

            await apiRequest(`/submissions/${viewId}/submit`, { method: 'POST', formData });

            showToast('Assignment submitted successfully', 'success');
            setTimeout(() => window.location.reload(), 1000);
          } catch (err) {
            showToast(err.message, 'error');
            btn.disabled = false;
            btn.textContent = 'Submit Assignment';
          }
        });
      }
    } catch (err) {
      handleApiError(err);
    }
    return;
  }

  initLayout('student', 'Assignments');
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <h1>Assignments</h1>
    </div>
    <div class="filter-bar">
      <input type="text" class="search-input" id="search" placeholder="Search assignments..." />
      <select class="form-select" id="status-filter">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="due_soon">Due Soon</option>
        <option value="expired">Expired</option>
      </select>
      <select class="form-select" id="type-filter">
        <option value="">All Types</option>
        <option value="homework">Homework</option>
        <option value="classwork">Classwork</option>
        <option value="project">Project</option>
      </select>
    </div>
    <div class="card">
      <div class="card-body" id="assignment-list">
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
      </div>
      <div class="pagination" id="pagination"></div>
    </div>
  `;

  let currentPage = 1;
  let currentFilters = {};

  async function loadAssignments() {
    const list = document.getElementById('assignment-list');
    list.innerHTML = '<div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div>';

    try {
      const allAssignments = await apiRequest('/assignments', { params: { studentId: user.id, ...currentFilters, page: currentPage, limit: 10 } });
      const assignments = allAssignments.assignments || [];

      if (assignments.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-icon"><img src="/logos/assignment.png" alt="No assignments" class="empty-icon-img"></div><h3>No assignments found</h3><p>There are no assignments matching your criteria</p></div>';
      } else {
        list.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px">' +
          assignments.map(a => {
            const subStatus = a.submission_status || 'not_submitted';
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid var(--border);border-radius:var(--radius)">
              <div style="flex:1">
                <div style="font-weight:500">${escapeHtml(a.title)}</div>
                <div style="display:flex;gap:12px;font-size:0.8rem;color:var(--text-light);margin-top:4px">
                  <span>Due: ${formatDate(a.due_date)}</span>
                  <span>Marks: ${a.max_marks}</span>
                  ${getLateBadge(a.is_late)}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                ${getStatusBadge(a.status)}
                <a href="/pages/student/assignments.html?id=${a.id}" class="btn btn-outline btn-sm">View</a>
              </div>
            </div>`;
          }).join('') + '</div>';
      }

      const pag = document.getElementById('pagination');
      if (allAssignments.pagination) {
        const { totalPages, page, total } = allAssignments.pagination;
        if (totalPages > 1) {
          pag.innerHTML = `
            <button onclick="window.goToPage(${page - 1})" ${page <= 1 ? 'disabled' : ''}>Previous</button>
            <span class="page-info">Page ${page} of ${totalPages} (${total} total)</span>
            <button onclick="window.goToPage(${page + 1})" ${page >= totalPages ? 'disabled' : ''}>Next</button>
          `;
        } else {
          pag.innerHTML = '';
        }
      }
    } catch (err) {
      handleApiError(err);
    }
  }

  window.goToPage = (p) => { currentPage = p; loadAssignments(); };

  document.getElementById('search').addEventListener('input', debounce((e) => {
    currentFilters.search = e.target.value;
    currentPage = 1;
    loadAssignments();
  }, 300));

  document.getElementById('status-filter').addEventListener('change', (e) => {
    currentFilters.status = e.target.value;
    currentPage = 1;
    loadAssignments();
  });

  document.getElementById('type-filter').addEventListener('change', (e) => {
    currentFilters.type = e.target.value;
    currentPage = 1;
    loadAssignments();
  });

  loadAssignments();
})();
