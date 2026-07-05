(async function() {
  if (!isAuthenticated()) { window.location.href = '/'; return; }
  let user;
  try { user = await getMe(); if (user.role !== 'administrator') { window.location.href = '/'; return; } }
  catch { window.location.href = '/'; return; }

  initLayout('administrator', 'System Settings');
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header"><h1>System Settings</h1></div>
    <div class="card" style="max-width:700px">
      <div class="card-header"><h3>Configuration</h3></div>
      <div class="card-body">
        <form id="settings-form">
          <div id="settings-fields"><div class="skeleton skeleton-text"></div></div>
          <button type="submit" class="btn btn-primary" style="margin-top:16px">Save Settings</button>
        </form>
      </div>
    </div>
  `;

  async function loadSettings() {
    try {
      const settings = await apiRequest('/settings');
      const container = document.getElementById('settings-fields');
      container.innerHTML = settings.map(s => `
        <div class="form-group">
          <label class="form-label">${escapeHtml(s.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))}</label>
          <input type="text" class="form-input setting-input" data-key="${escapeHtml(s.key)}" value="${escapeHtml(s.value)}">
          ${s.description ? `<div style="font-size:0.8rem;color:var(--text-light)">${escapeHtml(s.description)}</div>` : ''}
        </div>
      `).join('');
    } catch (err) { handleApiError(err); }
  }

  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = document.querySelectorAll('.setting-input');
    const settings = Array.from(inputs).map(inp => ({ key: inp.dataset.key, value: inp.value }));

    try {
      await apiRequest('/settings/bulk', { method: 'PUT', body: { settings } });
      showToast('Settings saved', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  });

  loadSettings();
})();
