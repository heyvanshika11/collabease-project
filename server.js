const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'collabease_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Auth Middleware ───────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Helper: check role in a project
function getUserProjectRole(projectId, userId) {
  const member = db.projectMembers.findOne({ projectId, userId });
  return member ? member.role : null;
}

// ─── AUTH ROUTES ───────────────────────────────────────────────

// Signup
app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const user = db.users.create({ name, email, password });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = db.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.users.findOne({ id: req.userId });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// ─── USERS ─────────────────────────────────────────────────────

app.get('/api/users', authMiddleware, (req, res) => {
  res.json(db.users.findMany());
});

// ─── PROJECTS ──────────────────────────────────────────────────

// Get all projects the current user is a member of
app.get('/api/projects', authMiddleware, (req, res) => {
  const memberships = db.projectMembers.findMany({ userId: req.userId });
  const projectIds = memberships.map(m => m.projectId);
  const allProjects = db.projects.findMany();
  const userProjects = allProjects.filter(p => projectIds.includes(p.id));

  // Enrich with member count and task stats
  const enriched = userProjects.map(p => {
    const members = db.projectMembers.findMany({ projectId: p.id });
    const tasks = db.tasks.findMany({ projectId: p.id });
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const overdue = tasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < new Date()).length;
    const myRole = members.find(m => m.userId === req.userId)?.role || 'Member';
    return {
      ...p,
      memberCount: members.length,
      taskCount: tasks.length,
      completedCount: completed,
      overdueCount: overdue,
      myRole
    };
  });

  res.json(enriched);
});

// Create project
app.post('/api/projects', authMiddleware, (req, res) => {
  try {
    const { name, description, dueDate } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const project = db.projects.create({
      name,
      description: description || '',
      dueDate: dueDate || null,
      ownerId: req.userId
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single project
app.get('/api/projects/:id', authMiddleware, (req, res) => {
  const project = db.projects.findOne(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const role = getUserProjectRole(req.params.id, req.userId);
  if (!role) return res.status(403).json({ error: 'Access denied' });

  res.json({ ...project, myRole: role });
});

// Update project (Admin only)
app.patch('/api/projects/:id', authMiddleware, (req, res) => {
  try {
    const role = getUserProjectRole(req.params.id, req.userId);
    if (role !== 'Admin') return res.status(403).json({ error: 'Only admins can update projects' });

    const updated = db.projects.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete project (Admin only)
app.delete('/api/projects/:id', authMiddleware, (req, res) => {
  try {
    const role = getUserProjectRole(req.params.id, req.userId);
    if (role !== 'Admin') return res.status(403).json({ error: 'Only admins can delete projects' });

    db.projects.delete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── PROJECT MEMBERS ───────────────────────────────────────────

// Get members of a project
app.get('/api/projects/:id/members', authMiddleware, (req, res) => {
  const role = getUserProjectRole(req.params.id, req.userId);
  if (!role) return res.status(403).json({ error: 'Access denied' });

  const members = db.projectMembers.findMany({ projectId: req.params.id });
  const allUsers = db.users.findMany();

  const enriched = members.map(m => {
    const user = allUsers.find(u => u.id === m.userId);
    return {
      ...m,
      name: user?.name || 'Unknown',
      email: user?.email || '',
      avatar: user?.avatar || ''
    };
  });

  res.json(enriched);
});

// Add member (Admin only)
app.post('/api/projects/:id/members', authMiddleware, (req, res) => {
  try {
    const role = getUserProjectRole(req.params.id, req.userId);
    if (role !== 'Admin') return res.status(403).json({ error: 'Only admins can add members' });

    const { email, memberRole } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = db.users.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'No registered user found with that email' });

    const member = db.projectMembers.create({
      projectId: req.params.id,
      userId: user.id,
      role: memberRole || 'Member'
    });

    const { password, ...safeUser } = user;
    res.status(201).json({ ...member, name: safeUser.name, email: safeUser.email, avatar: safeUser.avatar });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update member role (Admin only)
app.patch('/api/projects/:id/members/:userId', authMiddleware, (req, res) => {
  try {
    const role = getUserProjectRole(req.params.id, req.userId);
    if (role !== 'Admin') return res.status(403).json({ error: 'Only admins can change roles' });

    const { newRole } = req.body;
    if (!['Admin', 'Member'].includes(newRole)) {
      return res.status(400).json({ error: 'Role must be Admin or Member' });
    }

    const updated = db.projectMembers.updateRole(req.params.id, req.params.userId, newRole);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove member (Admin only)
app.delete('/api/projects/:id/members/:userId', authMiddleware, (req, res) => {
  try {
    const role = getUserProjectRole(req.params.id, req.userId);
    if (role !== 'Admin') return res.status(403).json({ error: 'Only admins can remove members' });

    db.projectMembers.delete(req.params.id, req.params.userId);
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── TASKS ─────────────────────────────────────────────────────

// Get tasks for a project
app.get('/api/projects/:id/tasks', authMiddleware, (req, res) => {
  const role = getUserProjectRole(req.params.id, req.userId);
  if (!role) return res.status(403).json({ error: 'Access denied' });

  const tasks = db.tasks.findMany({ projectId: req.params.id });
  const allUsers = db.users.findMany();

  const enriched = tasks.map(t => {
    const assignee = allUsers.find(u => u.id === t.assigneeId);
    return {
      ...t,
      assigneeName: assignee?.name || 'Unassigned',
      assigneeAvatar: assignee?.avatar || ''
    };
  });

  res.json(enriched);
});

// Create task (Admin only)
app.post('/api/projects/:id/tasks', authMiddleware, (req, res) => {
  try {
    const role = getUserProjectRole(req.params.id, req.userId);
    if (role !== 'Admin') return res.status(403).json({ error: 'Only admins can create tasks' });

    const { title, description, priority, assigneeId, dueDate } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required' });

    // If assigneeId is provided, verify they are a member
    if (assigneeId) {
      const isMember = db.projectMembers.findOne({ projectId: req.params.id, userId: assigneeId });
      if (!isMember) return res.status(400).json({ error: 'Assignee must be a member of the project' });
    }

    const task = db.tasks.create({
      projectId: req.params.id,
      title,
      description,
      priority,
      assigneeId,
      dueDate
    });

    const allUsers = db.users.findMany();
    const assignee = allUsers.find(u => u.id === task.assigneeId);

    res.status(201).json({
      ...task,
      assigneeName: assignee?.name || 'Unassigned',
      assigneeAvatar: assignee?.avatar || ''
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update task
app.patch('/api/tasks/:taskId', authMiddleware, (req, res) => {
  try {
    const task = db.tasks.findOne(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const role = getUserProjectRole(task.projectId, req.userId);
    if (!role) return res.status(403).json({ error: 'Access denied' });

    // Members can only update the status of tasks assigned to them
    if (role === 'Member') {
      if (task.assigneeId !== req.userId) {
        return res.status(403).json({ error: 'Members can only update their assigned tasks' });
      }
      // Members can only update status
      const allowedFields = ['status'];
      const updateKeys = Object.keys(req.body);
      const forbidden = updateKeys.filter(k => !allowedFields.includes(k));
      if (forbidden.length > 0) {
        return res.status(403).json({ error: 'Members can only update task status' });
      }
    }

    // Validate status values
    if (req.body.status) {
      const validStatuses = ['To Do', 'In Progress', 'In Review', 'Completed'];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
    }

    const updated = db.tasks.update(req.params.taskId, req.body);
    const allUsers = db.users.findMany();
    const assignee = allUsers.find(u => u.id === updated.assigneeId);

    res.json({
      ...updated,
      assigneeName: assignee?.name || 'Unassigned',
      assigneeAvatar: assignee?.avatar || ''
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete task (Admin only)
app.delete('/api/tasks/:taskId', authMiddleware, (req, res) => {
  try {
    const task = db.tasks.findOne(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const role = getUserProjectRole(task.projectId, req.userId);
    if (role !== 'Admin') return res.status(403).json({ error: 'Only admins can delete tasks' });

    db.tasks.delete(req.params.taskId);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── COMMENTS ──────────────────────────────────────────────────

// Get comments for a task
app.get('/api/tasks/:taskId/comments', authMiddleware, (req, res) => {
  const task = db.tasks.findOne(req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const role = getUserProjectRole(task.projectId, req.userId);
  if (!role) return res.status(403).json({ error: 'Access denied' });

  const comments = db.comments.findManyByTask(req.params.taskId);
  const allUsers = db.users.findMany();

  const enriched = comments.map(c => {
    const user = allUsers.find(u => u.id === c.userId);
    return {
      ...c,
      userName: user?.name || 'Unknown',
      userAvatar: user?.avatar || ''
    };
  });

  res.json(enriched);
});

// Create comment
app.post('/api/tasks/:taskId/comments', authMiddleware, (req, res) => {
  try {
    const task = db.tasks.findOne(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const role = getUserProjectRole(task.projectId, req.userId);
    if (!role) return res.status(403).json({ error: 'Access denied' });

    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Comment content is required' });

    const comment = db.comments.create({
      taskId: req.params.taskId,
      userId: req.userId,
      content: content.trim()
    });

    const allUsers = db.users.findMany();
    const user = allUsers.find(u => u.id === comment.userId);

    res.status(201).json({
      ...comment,
      userName: user?.name || 'Unknown',
      userAvatar: user?.avatar || ''
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── DASHBOARD STATS ───────────────────────────────────────────

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const memberships = db.projectMembers.findMany({ userId: req.userId });
  const projectIds = memberships.map(m => m.projectId);
  const allProjects = db.projects.findMany();
  const userProjects = allProjects.filter(p => projectIds.includes(p.id));

  let totalTasks = 0, completedTasks = 0, inProgressTasks = 0, overdueTasks = 0, toDoTasks = 0, inReviewTasks = 0;
  let myTasks = [];
  const now = new Date();

  userProjects.forEach(p => {
    const tasks = db.tasks.findMany({ projectId: p.id });
    tasks.forEach(t => {
      totalTasks++;
      if (t.status === 'Completed') completedTasks++;
      else if (t.status === 'In Progress') inProgressTasks++;
      else if (t.status === 'To Do') toDoTasks++;
      else if (t.status === 'In Review') inReviewTasks++;

      if (t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < now) {
        overdueTasks++;
      }

      if (t.assigneeId === req.userId) {
        myTasks.push({ ...t, projectName: p.name });
      }
    });
  });

  res.json({
    totalProjects: userProjects.length,
    totalTasks,
    completedTasks,
    inProgressTasks,
    toDoTasks,
    inReviewTasks,
    overdueTasks,
    myTasks
  });
});

// ─── CATCH-ALL: Serve SPA ─────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── START SERVER ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════════╗`);
  console.log(`  ║   🚀 CollabEase Server Running           ║`);
  console.log(`  ║   → http://localhost:${PORT}               ║`);
  console.log(`  ║   → Press Ctrl+C to stop                 ║`);
  console.log(`  ╚══════════════════════════════════════════╝\n`);
});
