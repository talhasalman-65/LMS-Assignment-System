const LAYOUT = {
  student: {
    title: 'Student Dashboard',
    navItems: [
      { icon: '📊', label: 'Dashboard', href: '/pages/student/dashboard.html' },
      { icon: '📝', label: 'Assignments', href: '/pages/student/assignments.html' },
      { icon: '📤', label: 'My Submissions', href: '/pages/student/submissions.html' },
      { icon: '⭐', label: 'Grades & Feedback', href: '/pages/student/grades.html' },
      { icon: '👤', label: 'Profile', href: '/pages/student/profile.html' },
    ],
  },
  teacher: {
    title: 'Teacher Dashboard',
    navItems: [
      { icon: '📊', label: 'Dashboard', href: '/pages/teacher/dashboard.html' },
      { icon: '➕', label: 'Create Assignment', href: '/pages/teacher/create-assignment.html' },
      { icon: '📝', label: 'Assignments', href: '/pages/teacher/assignments.html' },
      { icon: '📥', label: 'Submissions', href: '/pages/teacher/submissions.html' },
      { icon: '✅', label: 'Grade Center', href: '/pages/teacher/grade-center.html' },
      { icon: '📈', label: 'Reports', href: '/pages/teacher/reports.html' },
      { icon: '👤', label: 'Profile', href: '/pages/teacher/profile.html' },
    ],
  },
  administrator: {
    title: 'Admin Dashboard',
    navItems: [
      { icon: '📊', label: 'Dashboard', href: '/pages/admin/dashboard.html' },
      { icon: '👥', label: 'Users', href: '/pages/admin/users.html' },
      { icon: '📝', label: 'Assignments', href: '/pages/admin/assignments.html' },
      { icon: '📈', label: 'Reports', href: '/pages/admin/reports.html' },
      { icon: '⚙️', label: 'System Settings', href: '/pages/admin/settings.html' },
      { icon: '📋', label: 'Logs', href: '/pages/admin/logs.html' },
      { icon: '👤', label: 'Profile', href: '/pages/admin/profile.html' },
    ],
  },
};

function renderSidebar(role, currentPath) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const layout = LAYOUT[role];
  if (!layout) return;

  const navItems = layout.navItems.map(item => {
    const active = item.href === currentPath ? 'active' : '';
    return `<a href="${item.href}" class="nav-item ${active}">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </a>`;
  }).join('');

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <span class="logo-icon">📚</span>
      <h2>SmartAssign</h2>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-title">Main Menu</div>
        ${navItems}
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="avatar" id="sidebar-user-avatar">?</div>
        <div class="user-details">
          <div class="user-name" id="sidebar-user-name">Loading...</div>
          <div class="user-role" id="sidebar-user-role">${role}</div>
        </div>
      </div>
    </div>
  `;
}

function renderHeader(currentPath, pageTitle) {
  const header = document.getElementById('top-header');
  if (!header) return;

  const pathParts = currentPath.replace('/pages/', '').replace('.html', '').split('/');
  let breadcrumbHtml = '<a href="dashboard.html">Home</a>';
  pathParts.forEach((part, i) => {
    breadcrumbHtml += '<span class="separator">/</span>';
    const label = part.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (i === pathParts.length - 1) {
      breadcrumbHtml += `<span>${label}</span>`;
    } else {
      breadcrumbHtml += `<a href="${part}.html">${label}</a>`;
    }
  });

  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px">
      <button id="sidebar-toggle" class="mobile-toggle" aria-label="Toggle sidebar">☰</button>
      <div class="breadcrumbs" id="breadcrumbs">${breadcrumbHtml}</div>
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <span style="font-size:0.9rem;font-weight:500;color:var(--text)">${pageTitle || ''}</span>
      <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">🌙</button>
      <button id="logout-btn" class="btn btn-outline btn-sm">Logout</button>
    </div>
  `;
}

function initLayout(role, pageTitle) {
  const currentPath = window.location.pathname;

  if (!document.getElementById('sidebar')) {
    const layout = document.createElement('div');
    layout.className = 'app-layout';
    layout.innerHTML = `
      <aside class="sidebar" id="sidebar"></aside>
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <div class="main-content">
        <header class="top-header" id="top-header"></header>
        <div class="page-content" id="page-content"></div>
      </div>
    `;
    document.body.prepend(layout);
  }

  renderSidebar(role, currentPath);
  renderHeader(currentPath, pageTitle);

  initSidebar();
  initTheme();
  initLogout();
  loadUserInfo();
}
