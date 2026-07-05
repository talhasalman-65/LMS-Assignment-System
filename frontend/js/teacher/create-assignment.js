(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'teacher') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  const editId = new URLSearchParams(window.location.search).get('edit');
  initLayout('teacher', editId ? 'Edit Assignment' : 'Create Assignment');

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header"><h1>${editId ? 'Edit Assignment' : 'Create New Assignment'}</h1></div>
    <div class="card" style="max-width:800px">
      <div class="card-body">
        <form id="assignment-form">
          <div class="form-group">
            <label class="form-label">Title *</label>
            <input type="text" class="form-input" id="title" required maxlength="255">
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" id="description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Instructions</label>
            <textarea class="form-textarea" id="instructions" rows="4"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Assignment Type</label>
              <select class="form-select" id="assignmentType">
                <option value="homework">Homework</option>
                <option value="classwork">Classwork</option>
                <option value="project">Project</option>
                <option value="quiz">Quiz</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Due Date *</label>
              <input type="datetime-local" class="form-input" id="dueDate" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Maximum Marks *</label>
              <input type="number" class="form-input" id="maxMarks" required min="1" max="1000" value="100">
            </div>
            <div class="form-group">
              <label class="form-label">Max Attempts</label>
              <input type="number" class="form-input" id="maxAttempts" min="1" max="10" value="3">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Target Class</label>
            <select class="form-select" id="targetClass">
              <option value="">Select class (optional)</option>
            </select>
            <div style="font-size:0.8rem;color:var(--text-light);margin-top:4px">Select a class or leave empty to assign to specific students</div>
          </div>
          <div class="form-group">
            <label class="form-label">Target Students</label>
            <select class="form-select" id="targetStudents" multiple style="min-height:100px">
            </select>
            <div style="font-size:0.8rem;color:var(--text-light);margin-top:4px">Hold Ctrl/Cmd to select multiple students</div>
          </div>
          <div class="form-group">
            <label class="form-label">Attachments (optional)</label>
            <input type="file" class="form-input" id="attachments" accept=".pdf,.docx,.zip" multiple>
            <div style="font-size:0.8rem;color:var(--text-light);margin-top:4px">Allowed: PDF, DOCX, ZIP. Max 5MB each.</div>
          </div>
          <button type="submit" class="btn btn-primary btn-lg">${editId ? 'Update' : 'Create'} Assignment</button>
        </form>
      </div>
    </div>
  `;

  const [classes, students] = await Promise.all([
    apiRequest('/classes'),
    apiRequest('/users', { params: { role: 'student', limit: 100 } }),
  ]);

  const classSelect = document.getElementById('targetClass');
  classes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id; opt.textContent = c.name;
    classSelect.appendChild(opt);
  });

  const studentSelect = document.getElementById('targetStudents');
  (students.users || []).forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id; opt.textContent = `${s.full_name} (${s.roll_number || 'N/A'})`;
    studentSelect.appendChild(opt);
  });

  if (editId) {
    try {
      const assignment = await apiRequest(`/assignments/${editId}`);
      document.getElementById('title').value = assignment.title || '';
      document.getElementById('description').value = assignment.description || '';
      document.getElementById('instructions').value = assignment.instructions || '';
      document.getElementById('assignmentType').value = assignment.assignment_type || 'homework';
      document.getElementById('dueDate').value = assignment.due_date ? assignment.due_date.slice(0,16) : '';
      document.getElementById('maxMarks').value = assignment.max_marks || 100;
      document.getElementById('maxAttempts').value = assignment.max_attempts || 3;

      if (assignment.targets && assignment.targets.length > 0) {
        const classTarget = assignment.targets.find(t => t.targetType === 'class');
        if (classTarget) classSelect.value = classTarget.targetId;
        assignment.targets.filter(t => t.targetType === 'student').forEach(t => {
          const opt = studentSelect.querySelector(`option[value="${t.targetId}"]`);
          if (opt) opt.selected = true;
        });
      }
    } catch (err) { showToast('Failed to load assignment', 'error'); }
  }

  document.getElementById('assignment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const targets = [];
    const classId = document.getElementById('targetClass').value;
    if (classId) targets.push({ targetType: 'class', targetId: parseInt(classId) });

    const selectedStudents = Array.from(document.getElementById('targetStudents').selectedOptions).map(o => parseInt(o.value));
    selectedStudents.forEach(sid => targets.push({ targetType: 'student', targetId: sid }));

    if (targets.length === 0) { showToast('Select at least one class or student', 'warning'); return; }

    const data = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      instructions: document.getElementById('instructions').value,
      assignmentType: document.getElementById('assignmentType').value,
      dueDate: new Date(document.getElementById('dueDate').value).toISOString(),
      maxMarks: parseFloat(document.getElementById('maxMarks').value),
      maxAttempts: parseInt(document.getElementById('maxAttempts').value),
      targets,
    };

    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'targets') formData.append(k, JSON.stringify(v));
      else formData.append(k, v);
    });

    const files = document.getElementById('attachments').files;
    for (const file of files) formData.append('attachments', file);

    try {
      if (editId) {
        await apiRequest(`/assignments/${editId}`, { method: 'PUT', body: data });
        showToast('Assignment updated', 'success');
      } else {
        await apiRequest('/assignments', { method: 'POST', formData });
        showToast('Assignment created', 'success');
      }
      setTimeout(() => window.location.href = '/pages/teacher/assignments.html', 1000);
    } catch (err) { showToast(err.message, 'error'); }
  });
})();
