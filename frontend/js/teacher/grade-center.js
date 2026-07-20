(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'teacher') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  const submissionId = new URLSearchParams(window.location.search).get('submissionId');

  if (submissionId) {
    initLayout('teacher', 'Grade Submission');
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="skeleton skeleton-card" style="height:400px"></div>';

    try {
      const sub = await apiRequest(`/submissions/${submissionId}`);
      const assignment = await apiRequest(`/assignments/${sub.assignment_id}`);

      content.innerHTML = `
        <div class="page-header">
          <h1>Grade Submission</h1>
          <a href="/pages/teacher/submissions.html" class="btn btn-outline btn-sm">Back to Submissions</a>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
          <div class="card">
            <div class="card-header"><h3>Submission Info</h3></div>
            <div class="card-body">
              <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Student</div><div class="detail-value">${escapeHtml(sub.student_name)}</div></div>
                <div class="detail-item"><div class="detail-label">Assignment</div><div class="detail-value">${escapeHtml(sub.assignment_title)}</div></div>
                <div class="detail-item"><div class="detail-label">Submitted</div><div class="detail-value">${formatDate(sub.submitted_at)}</div></div>
                <div class="detail-item"><div class="detail-label">Status</div><div class="detail-value">${getStatusBadge(sub.status)}</div></div>
                <div class="detail-item"><div class="detail-label">Version</div><div class="detail-value">${sub.version}</div></div>
                <div class="detail-item"><div class="detail-label">Late</div><div class="detail-value">${sub.is_late ? 'Yes' : 'No'}</div></div>
              </div>

              ${sub.files && sub.files.length > 0 ? `
                <div style="margin-top:16px">
                  <strong>Submitted Files:</strong>
                  <ul class="file-list" style="margin-top:8px">
                    ${sub.files.map(f => {
                      const fileUrl = '/api/files/submission/' + f.id;
                      return `
                      <li class="file-item">
                        <img src="/logos/file.png" class="file-icon" alt="File">
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

          <div class="card">
            <div class="card-header"><h3>Grade & Feedback</h3></div>
            <div class="card-body">
              <form id="grade-form">
                <div class="form-group">
                  <label class="form-label">Marks (Max: ${assignment.max_marks})</label>
                  <input type="number" class="form-input" id="marks" min="0" max="${assignment.max_marks}" step="0.5" value="${sub.marks || ''}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Feedback</label>
                  <textarea class="form-textarea" id="feedback" rows="4">${sub.feedback || ''}</textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">Review Notes (internal)</label>
                  <textarea class="form-textarea" id="reviewNotes" rows="3"></textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">Action</label>
                  <select class="form-select" id="gradeAction">
                    <option value="graded">Grade & Finalize</option>
                    <option value="returned_for_revision">Return for Revision</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary">Submit Grade</button>
                ${sub.status === 'under_review' ? `<button type="button" class="btn btn-success" id="finalize-btn" style="margin-left:8px">Finalize Only</button>` : ''}
              </form>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:20px">
          <div class="card-header"><h3>Submission History</h3></div>
          <div class="card-body" id="history-content">
            <div class="skeleton skeleton-text"></div>
          </div>
        </div>
      `;

      document.getElementById('grade-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const marks = parseFloat(document.getElementById('marks').value);
        const feedback = document.getElementById('feedback').value;
        const reviewNotes = document.getElementById('reviewNotes').value;
        const status = document.getElementById('gradeAction').value;

        if (marks > assignment.max_marks) { showToast(`Marks cannot exceed ${assignment.max_marks}`, 'warning'); return; }

        try {
          await apiRequest(`/submissions/${submissionId}/grade`, {
            method: 'POST',
            body: { marks, feedback, reviewNotes, status },
          });
          showToast('Grade submitted', 'success');
          setTimeout(() => window.location.reload(), 1000);
        } catch (err) { showToast(err.message, 'error'); }
      });

      const finalizeBtn = document.getElementById('finalize-btn');
      if (finalizeBtn) {
        finalizeBtn.addEventListener('click', async () => {
          try {
            await apiRequest(`/submissions/${submissionId}/finalize`, { method: 'POST' });
            showToast('Grade finalized', 'success');
            location.reload();
          } catch (err) { showToast(err.message, 'error'); }
        });
      }

      try {
        const historyRes = await apiRequest('/submissions', { params: { assignmentId: sub.assignment_id, studentId: sub.student_id, limit: 10 } });
        const history = historyRes.submissions || [];
        document.getElementById('history-content').innerHTML = history.length === 0
          ? '<div class="empty-state"><p>No history</p></div>'
          : '<div style="display:flex;flex-direction:column;gap:6px">' +
            history.map(h => `<div style="display:flex;justify-content:space-between;padding:8px;border:1px solid var(--border);border-radius:var(--radius);font-size:0.85rem">
              <span>Version ${h.version}</span>
              <span>${getStatusBadge(h.status)}</span>
              <span>${formatDate(h.submitted_at)}</span>
            </div>`).join('') + '</div>';
      } catch {}
    } catch (err) { handleApiError(err); }
    return;
  }

  initLayout('teacher', 'Grade Center');
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header"><h1>Grade Center</h1></div>
    <div class="card">
      <div class="card-body" id="grade-list"><div class="skeleton skeleton-text"></div></div>
    </div>
  `;

  try {
    const res = await apiRequest('/submissions', { params: { limit: 50 } });
    const subs = res.submissions || [];
    const el = document.getElementById('grade-list');
    if (subs.length === 0) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon"><img src="/logos/checkmark.png" alt="No submissions" class="empty-icon-img"></div><h3>No submissions to grade</h3></div>';
    } else {
      el.innerHTML = `<table>
        <thead><tr>
          <th>Student</th><th>Assignment</th><th>Submitted</th><th>Status</th><th>Marks</th><th>Actions</th>
        </tr></thead>
        <tbody>${subs.map(s => `<tr>
          <td>${escapeHtml(s.student_name)}</td>
          <td>${escapeHtml(s.assignment_title)}</td>
          <td>${formatDate(s.submitted_at)}</td>
          <td>${getStatusBadge(s.status)}</td>
          <td>${s.marks !== null ? `${s.marks}/${s.max_marks}` : '-'}</td>
          <td><a href="/pages/teacher/grade-center.html?submissionId=${s.id}" class="btn btn-outline btn-sm">Grade</a></td>
        </tr>`).join('')}</tbody>
      </table>`;
    }
  } catch (err) { handleApiError(err); }
})();
