function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) {
    const c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container';
    document.body.appendChild(c);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;
  document.getElementById('toast-container').appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function getStatusBadge(status) {
  const statusClasses = {
    'not_submitted': 'badge-missing',
    'submitted': 'badge-submitted',
    'under_review': 'badge-under_review',
    'graded': 'badge-graded',
    'returned_for_revision': 'badge-returned_for_revision',
    'rejected': 'badge-rejected',
    'active': 'badge-active',
    'due_soon': 'badge-due_soon',
    'expired': 'badge-expired',
    'archived': 'badge-archived',
    'draft': 'badge-draft',
    'completed': 'badge-completed',
    'approved': 'badge-approved',
    'missing': 'badge-missing',
  };

  const labels = {
    'not_submitted': 'Not Submitted',
    'submitted': 'Submitted',
    'under_review': 'Under Review',
    'graded': 'Graded',
    'returned_for_revision': 'Returned',
    'rejected': 'Rejected',
    'active': 'Active',
    'due_soon': 'Due Soon',
    'expired': 'Expired',
    'archived': 'Archived',
    'draft': 'Draft',
    'completed': 'Completed',
    'approved': 'Approved',
    'missing': 'Missing',
  };

  const cls = statusClasses[status] || 'badge-active';
  const label = labels[status] || status;
  return `<span class="badge ${cls}"><span class="badge-dot"></span>${label}</span>`;
}

function getLateBadge(isLate) {
  if (!isLate) return '';
  return '<span class="badge badge-late"><span class="badge-dot"></span>Late</span>';
}

function escapeHtml(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function setLoading(containerId, loading) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (loading) {
    container.innerHTML = '<div class="skeleton skeleton-card" style="margin-bottom:12px"></div>'.repeat(5);
  }
}

function handleApiError(err) {
  console.error(err);
  showToast(err.message || 'An error occurred', 'error');
}

function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('show');
    });
  }

  if (overlay && sidebar) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
}

function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggle.textContent = '☀️';
  }

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      toggle.textContent = '🌙';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      toggle.textContent = '☀️';
    }
  });
}

function initBreadcrumbs(path) {
  const container = document.getElementById('breadcrumbs');
  if (!container) return;
  const parts = path.split('/').filter(Boolean);
  let html = '<a href="dashboard.html">Home</a>';
  parts.forEach((part, i) => {
    html += '<span class="separator">/</span>';
    const label = part.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (i === parts.length - 1) {
      html += `<span>${label}</span>`;
    } else {
      html += `<a href="${part}.html">${label}</a>`;
    }
  });
  container.innerHTML = html;
}

function initLogout() {
  const btn = document.getElementById('logout-btn');
  if (btn) {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await logout();
      } catch {}
      clearTokens();
      window.location.href = '/';
    });
  }
}

async function loadUserInfo() {
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  const avatarEl = document.getElementById('sidebar-user-avatar');
  if (!nameEl) return;

  try {
    const user = await getMe();
    nameEl.textContent = user.fullName || user.full_name;
    roleEl.textContent = user.role;
    if (avatarEl) {
      const initials = (user.fullName || user.full_name || '?').split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2);
      avatarEl.textContent = initials;
    }
  } catch {}
}
