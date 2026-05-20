/* ==========================================================================
   CollabEase Modern SPA Frontend Controller
   ========================================================================== */

// ─── STATE MANAGEMENT ───────────────────────────────────────────────────
const state = {
  token: localStorage.getItem('token') || null,
  user: null,
  projects: [],
  currentProject: null,
  currentProjectRole: 'Member',
  tasks: [],
  comments: [],
  activeView: 'dashboard',
  theme: localStorage.getItem('theme') || 'light'
};

const API_BASE = '/api';

// ─── DYNAMIC INITIALIZATION ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRouter();
  initEventListeners();
  
  if (state.token) {
    checkAuthSession();
  } else {
    showAuthScreen();
  }
});

// ─── THEME MANAGER ──────────────────────────────────────────────────────
function initTheme() {
  if (state.theme === 'dark') {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
    updateThemeIcon(true);
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
    updateThemeIcon(false);
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode', !isDark);
  state.theme = isDark ? 'dark' : 'light';
  localStorage.setItem('theme', state.theme);
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  const btn = document.getElementById('theme-icon');
  if (btn) {
    btn.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    lucide.createIcons();
  }
}

// ─── ROUTER ENGINE ──────────────────────────────────────────────────────
function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  // Live date display
  const dateEl = document.getElementById('live-date');
  if (dateEl) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-US', options);
  }
}

function handleRoute() {
  if (!state.token) {
    showAuthScreen();
    return;
  }

  const hash = window.location.hash || '#dashboard';
  const parts = hash.split('/');
  const route = parts[0];

  // Update active sidebar nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  // Load and switch correct view panes
  hideAllViews();

  if (route === '#dashboard') {
    state.activeView = 'dashboard';
    document.getElementById('nav-dashboard').classList.add('active');
    document.getElementById('view-dashboard').classList.remove('hidden');
    document.getElementById('current-page-title').textContent = 'Dashboard';
    loadDashboardData();
  } 
  else if (route === '#projects') {
    state.activeView = 'projects';
    document.getElementById('nav-projects').classList.add('active');
    document.getElementById('view-projects').classList.remove('hidden');
    document.getElementById('current-page-title').textContent = 'Projects';
    loadProjectsData();
  } 
  else if (route === '#my-tasks') {
    state.activeView = 'my-tasks';
    document.getElementById('nav-mytasks').classList.add('active');
    document.getElementById('view-mytasks').classList.remove('hidden');
    document.getElementById('current-page-title').textContent = 'My Tasks';
    loadPersonalTasks();
  } 
  else if (route === '#project-details' && parts[1]) {
    state.activeView = 'project-details';
    document.getElementById('view-project-details').classList.remove('hidden');
    document.getElementById('current-page-title').textContent = 'Project Management';
    loadProjectDetails(parts[1]);
  } 
  else {
    // Default fallback
    window.location.hash = '#dashboard';
  }
}

function hideAllViews() {
  document.getElementById('view-dashboard').classList.add('hidden');
  document.getElementById('view-projects').classList.add('hidden');
  document.getElementById('view-mytasks').classList.add('hidden');
  document.getElementById('view-project-details').classList.add('hidden');
}

// ─── EVENT LISTENERS ────────────────────────────────────────────────────
function initEventListeners() {
  // Theme Toggle Button
  document.getElementById('theme-btn').addEventListener('click', toggleTheme);

  // Authentication Switchers
  document.getElementById('to-signup').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('auth-subtitle').textContent = 'Join the soft-designed project experience';
  });

  document.getElementById('to-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('auth-subtitle').textContent = 'Seamless, soft-styled project collaboration';
  });

  // Auth Form Submissions
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('signup-form').addEventListener('submit', handleSignup);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Mobile Menu Toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  mobileBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  // Close sidebar clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
      if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    }
  });

  // Modals Open & Close
  document.getElementById('btn-new-project').addEventListener('click', () => openModal('modal-project'));
  document.getElementById('btn-close-project-modal').addEventListener('click', () => closeModal('modal-project'));
  document.getElementById('btn-cancel-project').addEventListener('click', () => closeModal('modal-project'));

  document.getElementById('btn-close-task-modal').addEventListener('click', () => closeModal('modal-task'));
  document.getElementById('btn-cancel-task').addEventListener('click', () => closeModal('modal-task'));

  // Form Submissions
  document.getElementById('project-form').addEventListener('submit', handleCreateProject);
  document.getElementById('task-form').addEventListener('submit', handleCreateTask);
  document.getElementById('invite-member-form').addEventListener('submit', handleInviteMember);
  document.getElementById('comment-form').addEventListener('submit', handleAddComment);

  // Tab switching for Project Details
  const tabTasks = document.getElementById('tab-tasks');
  const tabMembers = document.getElementById('tab-members');
  const paneTasks = document.getElementById('pane-tasks');
  const paneMembers = document.getElementById('pane-members');

  tabTasks.addEventListener('click', () => {
    tabTasks.classList.add('active');
    tabMembers.classList.remove('active');
    paneTasks.classList.remove('hidden');
    paneMembers.classList.add('hidden');
  });

  tabMembers.addEventListener('click', () => {
    tabMembers.classList.add('active');
    tabTasks.classList.remove('active');
    paneMembers.classList.remove('hidden');
    paneTasks.classList.add('hidden');
  });

  // Filters for Personal Tasks
  document.getElementById('filter-mytasks-status').addEventListener('change', loadPersonalTasks);
  document.getElementById('filter-mytasks-priority').addEventListener('change', loadPersonalTasks);

  // Search filter for Kanban Board
  document.getElementById('kanban-search').addEventListener('input', filterKanbanTasks);

  // Drawers & Drawer status selector change
  document.getElementById('btn-close-drawer').addEventListener('click', closeDrawer);
  document.getElementById('drawer-task-status-select').addEventListener('change', handleDrawerStatusChange);
}

// ─── AUTHENTICATION FLOWS ──────────────────────────────────────────────
async function checkAuthSession() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (res.ok) {
      state.user = await res.json();
      showMainShell();
    } else {
      handleLogout();
    }
  } catch (err) {
    console.error('Session validation failed:', err);
    handleLogout();
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('token', data.token);
    state.token = data.token;
    state.user = data.user;
    showMainShell();
  } catch (err) {
    alert(err.message);
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    localStorage.setItem('token', data.token);
    state.token = data.token;
    state.user = data.user;
    showMainShell();
  } catch (err) {
    alert(err.message);
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  state.token = null;
  state.user = null;
  state.projects = [];
  state.currentProject = null;
  state.tasks = [];
  
  document.getElementById('main-shell').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  window.location.hash = '';
}

function showAuthScreen() {
  document.getElementById('main-shell').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
}

function showMainShell() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('main-shell').classList.remove('hidden');
  
  // Set User Profile UI Info
  document.getElementById('user-avatar').src = state.user.avatar;
  document.getElementById('user-full-name').textContent = state.user.name;
  document.getElementById('user-email-address').textContent = state.user.email;
  
  lucide.createIcons();
  
  // Trigger initial routing
  handleRoute();
}

// ─── DASHBOARD RENDERING ───────────────────────────────────────────────
async function loadDashboardData() {
  try {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard metrics');

    // Set stat numbers
    document.getElementById('stat-projects').textContent = data.totalProjects;
    
    const pending = data.totalTasks - data.completedTasks;
    document.getElementById('stat-tasks-pending').textContent = pending;
    document.getElementById('stat-tasks-completed').textContent = data.completedTasks;
    document.getElementById('stat-tasks-overdue').textContent = data.overdueTasks;

    // Calculate rates
    const completionRate = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;
    document.getElementById('stat-completion-rate').textContent = `${completionRate}% task completion rate`;
    document.getElementById('ring-percent').textContent = `${completionRate}%`;

    // Render detailed counts
    document.getElementById('count-todo').textContent = data.toDoTasks;
    document.getElementById('count-inprogress').textContent = data.inProgressTasks;
    document.getElementById('count-inreview').textContent = data.inReviewTasks;
    document.getElementById('count-completed').textContent = data.completedTasks;

    // Set SVG progress ring stroke offset
    // Radius = 70. Circumference = 2 * PI * 70 = 439.82
    const circle = document.querySelector('.progress-ring__circle');
    const circumference = 2 * Math.PI * 70;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (completionRate / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // Render Overdue & Urgent Tasks list
    renderUrgentTasksList(data.myTasks);
  } catch (err) {
    console.error(err);
  }
}

function renderUrgentTasksList(tasks) {
  const container = document.getElementById('urgent-tasks-list');
  container.innerHTML = '';

  const now = new Date();
  const urgent = tasks.filter(t => t.status !== 'Completed' && t.dueDate && (new Date(t.dueDate) < now || t.priority === 'High'));

  document.getElementById('urgent-badge').textContent = `${urgent.length} urgent task${urgent.length !== 1 ? 's' : ''}`;

  if (urgent.length === 0) {
    container.innerHTML = `
      <div class="empty-state-placeholder py-3">
        <i data-lucide="smile"></i>
        <p>No critical items needing attention.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Sort: overdue first, then High priority
  urgent.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  urgent.slice(0, 5).forEach(t => {
    const isOverdue = new Date(t.dueDate) < now;
    const formattedDate = new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const div = document.createElement('div');
    div.className = 'urgent-item';
    div.style.borderLeftColor = isOverdue ? 'var(--color-red)' : 'var(--color-orange)';
    div.addEventListener('click', () => openTaskDrawer(t.id));

    div.innerHTML = `
      <div class="urgent-details">
        <span class="urgent-title">${escapeHTML(t.title)}</span>
        <span class="urgent-proj">${escapeHTML(t.projectName)}</span>
      </div>
      <div class="urgent-meta">
        <span class="badge ${t.priority === 'High' ? 'badge-danger-soft' : 'badge-warning-soft'}">${t.priority}</span>
        <span class="urgent-date ${isOverdue ? 'text-danger' : 'text-muted'}">${isOverdue ? 'Overdue: ' : 'Due: '}${formattedDate}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

// ─── PROJECTS GRID RENDERING ───────────────────────────────────────────
async function loadProjectsData() {
  try {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    state.projects = await res.json();
    if (!res.ok) throw new Error('Failed to load projects');

    renderProjectsList();
  } catch (err) {
    console.error(err);
  }
}

function renderProjectsList() {
  const container = document.getElementById('projects-list-container');
  container.innerHTML = '';

  if (state.projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state-placeholder py-3 flex-1">
        <i data-lucide="folder-open"></i>
        <p>No active projects found. Create one to begin collaborating!</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  state.projects.forEach(p => {
    const rate = p.taskCount > 0 ? Math.round((p.completedCount / p.taskCount) * 100) : 0;
    const isOverdue = p.overdueCount > 0;
    
    const card = document.createElement('div');
    card.className = 'project-card';
    card.addEventListener('click', () => {
      window.location.hash = `#project-details/${p.id}`;
    });

    card.innerHTML = `
      <div class="project-card-header">
        <h3>${escapeHTML(p.name)}</h3>
        <span class="role-pill">${p.myRole}</span>
      </div>
      <p class="project-card-body">${escapeHTML(p.description || 'No description provided.')}</p>
      
      <div class="project-card-progress">
        <div class="progress-label-row">
          <span>Task Progress</span>
          <span>${rate}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${rate}%"></div>
        </div>
      </div>
      
      <div class="project-card-footer">
        <div class="project-meta-item">
          <i data-lucide="check-square"></i>
          <span>${p.completedCount}/${p.taskCount} Tasks</span>
        </div>
        
        <div class="project-meta-item ${isOverdue ? 'text-danger' : 'text-muted'}">
          <i data-lucide="calendar"></i>
          <span>${p.overdueCount > 0 ? `${p.overdueCount} Overdue` : 'Due: ' + (p.dueDate || 'No Date')}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  
  lucide.createIcons();
}

async function handleCreateProject(e) {
  e.preventDefault();
  const name = document.getElementById('project-name').value;
  const description = document.getElementById('project-desc').value;
  const dueDate = document.getElementById('project-due').value;

  try {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ name, description, dueDate })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create project');

    closeModal('modal-project');
    document.getElementById('project-form').reset();
    loadProjectsData();
  } catch (err) {
    alert(err.message);
  }
}

// ─── PERSONAL TASKS RENDERING ──────────────────────────────────────────
async function loadPersonalTasks() {
  try {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to load dashboard data');

    const statusFilter = document.getElementById('filter-mytasks-status').value;
    const priorityFilter = document.getElementById('filter-mytasks-priority').value;

    let tasks = data.myTasks || [];

    // Apply Filter logic
    if (statusFilter !== 'All') {
      tasks = tasks.filter(t => t.status === statusFilter);
    }
    if (priorityFilter !== 'All') {
      tasks = tasks.filter(t => t.priority === priorityFilter);
    }

    renderPersonalTasksList(tasks);
  } catch (err) {
    console.error(err);
  }
}

function renderPersonalTasksList(tasks) {
  const container = document.getElementById('my-tasks-list-container');
  container.innerHTML = '';

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state-placeholder py-3">
        <i data-lucide="check-square"></i>
        <p>No tasks matched the filters.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Create table header structure
  const header = document.createElement('div');
  header.className = 'task-row';
  header.style.backgroundColor = 'var(--border-light)';
  header.style.fontWeight = '600';
  header.style.cursor = 'default';
  header.innerHTML = `
    <div>Task Description</div>
    <div>Project</div>
    <div>Priority</div>
    <div>Due Date</div>
    <div>Status</div>
  `;
  container.appendChild(header);

  const now = new Date();

  tasks.forEach(t => {
    const isOverdue = t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < now;
    const formattedDate = t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline';
    
    let prioClass = 'badge-secondary-soft';
    if (t.priority === 'High') prioClass = 'badge-danger-soft';
    else if (t.priority === 'Medium') prioClass = 'badge-warning-soft';
    else if (t.priority === 'Low') prioClass = 'badge-success-soft';

    let statusClass = 'badge-secondary-soft';
    if (t.status === 'Completed') statusClass = 'badge-success-soft';
    else if (t.status === 'In Progress') statusClass = 'badge-warning-soft';
    else if (t.status === 'In Review') statusClass = 'badge-danger-soft';

    const row = document.createElement('div');
    row.className = 'task-row';
    row.addEventListener('click', () => openTaskDrawer(t.id));

    row.innerHTML = `
      <div class="task-row-title-area">
        <span class="task-row-title">${escapeHTML(t.title)}</span>
      </div>
      <div class="task-row-project">${escapeHTML(t.projectName)}</div>
      <div><span class="badge ${prioClass}">${t.priority}</span></div>
      <div class="task-row-date ${isOverdue ? 'text-danger' : ''}">${formattedDate}</div>
      <div><span class="badge ${statusClass}">${t.status}</span></div>
    `;
    container.appendChild(row);
  });
}

// ─── PROJECT DETAILS VIEWS & ROLES ────────────────────────────────────
async function loadProjectDetails(projectId) {
  try {
    // 1. Fetch details
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    state.currentProject = await res.json();
    if (!res.ok) throw new Error('Project not found');

    state.currentProjectRole = state.currentProject.myRole || 'Member';

    // 2. Set Headings
    document.getElementById('project-title-name').textContent = state.currentProject.name;
    document.getElementById('project-title-desc').textContent = state.currentProject.description || 'No description provided.';
    document.getElementById('project-due-date').textContent = state.currentProject.dueDate || 'No Target';
    document.getElementById('project-my-role-badge').textContent = state.currentProjectRole;

    // 3. Enable / Disable Actions based on Role permissions
    const isProjectAdmin = state.currentProjectRole === 'Admin';
    
    // Hide or show Admin actions
    if (isProjectAdmin) {
      document.getElementById('btn-add-task').classList.remove('hidden');
      document.getElementById('invite-member-section').classList.remove('hidden');
    } else {
      document.getElementById('btn-add-task').classList.add('hidden');
      document.getElementById('invite-member-section').classList.add('hidden');
    }

    // 4. Fetch Tasks & Members
    await loadProjectTasks();
    await loadProjectMembers();

    // Injects lists
    document.getElementById('btn-add-task').onclick = () => openCreateTaskModal();
  } catch (err) {
    console.error(err);
    window.location.hash = '#projects';
  }
}

// ─── KANBAN BOARD CONTROLLER ──────────────────────────────────────────
async function loadProjectTasks() {
  try {
    const res = await fetch(`${API_BASE}/projects/${state.currentProject.id}/tasks`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    state.tasks = await res.json();
    if (!res.ok) throw new Error('Could not load project tasks');

    renderKanbanBoard();
  } catch (err) {
    console.error(err);
  }
}

function renderKanbanBoard() {
  const columns = {
    'To Do': document.getElementById('lane-todo'),
    'In Progress': document.getElementById('lane-inprogress'),
    'In Review': document.getElementById('lane-inreview'),
    'Completed': document.getElementById('lane-completed')
  };

  // Reset columns
  Object.keys(columns).forEach(key => {
    columns[key].innerHTML = '';
  });

  let counts = { 'To Do': 0, 'In Progress': 0, 'In Review': 0, 'Completed': 0 };
  const now = new Date();

  state.tasks.forEach(t => {
    counts[t.status] = (counts[t.status] || 0) + 1;
    
    const card = document.createElement('div');
    card.className = 'task-card';
    card.addEventListener('click', () => openTaskDrawer(t.id));

    const isOverdue = t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < now;
    const formattedDate = t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    
    let prioClass = 'badge-secondary-soft';
    if (t.priority === 'High') prioClass = 'badge-danger-soft';
    else if (t.priority === 'Medium') prioClass = 'badge-warning-soft';
    else if (t.priority === 'Low') prioClass = 'badge-success-soft';

    card.innerHTML = `
      <div class="task-card-header">
        <span class="badge ${prioClass}">${t.priority}</span>
        ${t.assigneeAvatar ? `<img src="${t.assigneeAvatar}" class="avatar" style="width:20px;height:20px;" title="${escapeHTML(t.assigneeName)}">` : '<i data-lucide="user" style="width:14px;height:14px;" class="text-muted"></i>'}
      </div>
      <h4>${escapeHTML(t.title)}</h4>
      <div class="task-card-footer">
        <span class="task-card-due ${isOverdue ? 'overdue' : ''}">
          <i data-lucide="clock"></i>
          <span>${formattedDate || 'No Deadline'}</span>
        </span>
      </div>
    `;

    columns[t.status].appendChild(card);
  });

  // Update Lane Counts
  document.getElementById('count-lane-todo').textContent = counts['To Do'];
  document.getElementById('count-lane-inprogress').textContent = counts['In Progress'];
  document.getElementById('count-lane-inreview').textContent = counts['In Review'];
  document.getElementById('count-lane-completed').textContent = counts['Completed'];

  lucide.createIcons();
}

function filterKanbanTasks() {
  const query = document.getElementById('kanban-search').value.toLowerCase();
  document.querySelectorAll('.task-card').forEach(card => {
    const title = card.querySelector('h4').textContent.toLowerCase();
    if (title.includes(query)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

function openCreateTaskModal() {
  // Populate Assignee Select inside Create Task Modal
  const select = document.getElementById('task-assignee');
  select.innerHTML = '<option value="">-- Select Assignee --</option>';
  
  // Find project members already fetched
  const members = state.currentProjectMembers || [];
  members.forEach(m => {
    select.innerHTML += `<option value="${m.userId}">${escapeHTML(m.name)} (${m.role})</option>`;
  });

  openModal('modal-task');
}

async function handleCreateTask(e) {
  e.preventDefault();
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-desc').value;
  const priority = document.getElementById('task-priority').value;
  const dueDate = document.getElementById('task-due').value;
  const assigneeId = document.getElementById('task-assignee').value;

  try {
    const res = await fetch(`${API_BASE}/projects/${state.currentProject.id}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({
        title,
        description,
        priority,
        dueDate,
        assigneeId: assigneeId || null
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create task');

    closeModal('modal-task');
    document.getElementById('task-form').reset();
    await loadProjectTasks();
  } catch (err) {
    alert(err.message);
  }
}

// ─── TEAM MEMBERS MANAGEMENT ──────────────────────────────────────────
async function loadProjectMembers() {
  try {
    const res = await fetch(`${API_BASE}/projects/${state.currentProject.id}/members`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    state.currentProjectMembers = await res.json();
    if (!res.ok) throw new Error('Could not load team members');

    document.getElementById('project-member-count-pill').textContent = `${state.currentProjectMembers.length} Collaborator${state.currentProjectMembers.length !== 1 ? 's' : ''}`;

    renderMembersList();
  } catch (err) {
    console.error(err);
  }
}

function renderMembersList() {
  const tbody = document.getElementById('project-members-table-body');
  tbody.innerHTML = '';

  const isProjectAdmin = state.currentProjectRole === 'Admin';

  state.currentProjectMembers.forEach(m => {
    const tr = document.createElement('tr');
    
    // Display dates nicely
    const dateJoined = new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Role pill selectors or tags
    let actionHTML = '';
    
    if (isProjectAdmin) {
      if (m.userId === state.currentProject.ownerId) {
        actionHTML = `<span class="text-muted text-sm">Project Owner</span>`;
      } else {
        actionHTML = `
          <button class="btn-danger-soft btn-sm" onclick="removeMemberFromProject('${m.userId}')">
            Remove
          </button>
        `;
      }
    } else {
      actionHTML = `<span class="text-muted text-sm">-</span>`;
    }

    tr.innerHTML = `
      <td>
        <div class="member-info-col">
          <img src="${m.avatar}" class="avatar" style="width:32px;height:32px;">
          <div class="member-info-text">
            <span class="member-name-label">${escapeHTML(m.name)}</span>
            <span class="member-email-label">${escapeHTML(m.email)}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="role-pill ${m.role === 'Admin' ? '' : 'bg-slate'}">${m.role}</span>
      </td>
      <td>${dateJoined}</td>
      <td class="text-right">${actionHTML}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function handleInviteMember(e) {
  e.preventDefault();
  const email = document.getElementById('invite-email').value;
  const memberRole = document.getElementById('invite-role').value;

  try {
    const res = await fetch(`${API_BASE}/projects/${state.currentProject.id}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ email, memberRole })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add member');

    document.getElementById('invite-member-form').reset();
    await loadProjectMembers();
  } catch (err) {
    alert(err.message);
  }
}

async function removeMemberFromProject(userId) {
  if (!confirm('Are you sure you want to remove this member from the project? This unassigns all of their tasks.')) return;
  
  try {
    const res = await fetch(`${API_BASE}/projects/${state.currentProject.id}/members/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not remove member');

    await loadProjectMembers();
    await loadProjectTasks();
  } catch (err) {
    alert(err.message);
  }
}

// ─── TASK DRAWER & COMMENTS SYSTEM ──────────────────────────────────
let activeDrawerTaskId = null;

async function openTaskDrawer(taskId) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const task = await res.json();
    if (!res.ok) throw new Error('Task not found');

    activeDrawerTaskId = taskId;

    // Set task values
    document.getElementById('drawer-task-title').textContent = task.title;
    document.getElementById('drawer-task-desc').textContent = task.description || 'No additional description provided.';
    document.getElementById('drawer-task-due').textContent = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline';
    document.getElementById('drawer-assignee-name').textContent = task.assigneeName || 'Unassigned';
    document.getElementById('drawer-assignee-avatar').src = task.assigneeAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    // Priority badge
    const prioBadge = document.getElementById('drawer-task-priority');
    prioBadge.textContent = task.priority;
    prioBadge.className = 'badge';
    if (task.priority === 'High') prioBadge.classList.add('badge-danger-soft');
    else if (task.priority === 'Medium') prioBadge.classList.add('badge-warning-soft');
    else prioBadge.classList.add('badge-success-soft');

    // Fetch Project details for permissions (If we clicked this from dashboard rather than details)
    const roleRes = await fetch(`${API_BASE}/projects/${task.projectId}`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const projectInfo = await roleRes.json();
    const myRole = projectInfo.myRole || 'Member';

    // Status Select
    const statusSelect = document.getElementById('drawer-task-status-select');
    statusSelect.value = task.status;

    // Check permissions:
    // Only Admin OR Assigned user can change status.
    const isAssignee = task.assigneeId === state.user.id;
    const isProjectAdmin = myRole === 'Admin';

    if (isProjectAdmin || isAssignee) {
      statusSelect.disabled = false;
      document.getElementById('status-permission-hint').textContent = 'You have permission to update task status.';
      document.getElementById('status-permission-hint').style.color = 'var(--color-green)';
    } else {
      statusSelect.disabled = true;
      document.getElementById('status-permission-hint').textContent = 'Only assignees or project admins can update status.';
      document.getElementById('status-permission-hint').style.color = 'var(--text-muted)';
    }

    // Load comments
    await loadComments(taskId);

    // Open pane
    document.getElementById('drawer-task-details').classList.remove('hidden');
    lucide.createIcons();
  } catch (err) {
    console.error(err);
  }
}

function closeDrawer() {
  document.getElementById('drawer-task-details').classList.add('hidden');
  activeDrawerTaskId = null;
  
  // Reload correct active views in background
  if (state.activeView === 'dashboard') {
    loadDashboardData();
  } else if (state.activeView === 'project-details') {
    loadProjectTasks();
  } else if (state.activeView === 'my-tasks') {
    loadPersonalTasks();
  }
}

async function handleDrawerStatusChange() {
  if (!activeDrawerTaskId) return;
  const newStatus = document.getElementById('drawer-task-status-select').value;

  try {
    const res = await fetch(`${API_BASE}/tasks/${activeDrawerTaskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update status');
  } catch (err) {
    alert(err.message);
  }
}

async function loadComments(taskId) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const comments = await res.json();
    if (!res.ok) throw new Error('Could not load comments');

    document.getElementById('drawer-comment-count').textContent = comments.length;
    renderComments(comments);
  } catch (err) {
    console.error(err);
  }
}

function renderComments(comments) {
  const container = document.getElementById('drawer-comments-list');
  container.innerHTML = '';

  if (comments.length === 0) {
    container.innerHTML = `<p class="text-muted text-sm text-center py-3">No discussions yet. Ask a question or leave a note!</p>`;
    return;
  }

  comments.forEach(c => {
    const div = document.createElement('div');
    div.className = 'comment-bubble';
    
    // Formatting date
    const cDate = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
      <div class="comment-bubble-header">
        <div class="comment-user">
          <img src="${c.userAvatar}" class="avatar">
          <span>${escapeHTML(c.userName)}</span>
        </div>
        <span class="comment-date">${cDate}</span>
      </div>
      <div class="comment-content">${escapeHTML(c.content)}</div>
    `;
    container.appendChild(div);
  });

  // Scroll to bottom of comments list
  container.scrollTop = container.scrollHeight;
}

async function handleAddComment(e) {
  e.preventDefault();
  if (!activeDrawerTaskId) return;

  const input = document.getElementById('comment-input');
  const content = input.value;

  try {
    const res = await fetch(`${API_BASE}/tasks/${activeDrawerTaskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add comment');

    input.value = '';
    await loadComments(activeDrawerTaskId);
  } catch (err) {
    alert(err.message);
  }
}

// ─── MODALS CONTROLLER ────────────────────────────────────────────────
function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// ─── UTILITIES ────────────────────────────────────────────────────────
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Global handle assignments for simple onclick helpers
window.removeMemberFromProject = removeMemberFromProject;
window.openTaskDrawer = openTaskDrawer;
