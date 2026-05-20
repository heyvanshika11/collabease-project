const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'database.json');

// Helper to read database
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return initDefaultDB();
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file, resetting to defaults:', error);
    return initDefaultDB();
  }
}

// Helper to write database
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

// Initialize default data if DB file doesn't exist
function initDefaultDB() {
  const salt = bcrypt.genSaltSync(10);
  
  // Default users (passwords are 'password123')
  const users = [
    {
      id: 'u-1',
      name: 'Sarah Connor',
      email: 'sarah.c@collab.com',
      password: bcrypt.hashSync('password123', salt),
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'u-2',
      name: 'John Doe',
      email: 'john.d@collab.com',
      password: bcrypt.hashSync('password123', salt),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'u-3',
      name: 'Alex Mercer',
      email: 'alex.m@collab.com',
      password: bcrypt.hashSync('password123', salt),
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'u-4',
      name: 'Elena Rostova',
      email: 'elena.r@collab.com',
      password: bcrypt.hashSync('password123', salt),
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Default projects
  const projects = [
    {
      id: 'p-1',
      name: 'Phoenix Redesign',
      description: 'Overhaul the customer-facing dashboard and landing page with modern soft aesthetics, micro-animations, and improved layout structure.',
      ownerId: 'u-1',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'p-2',
      name: 'API Gateway V2',
      description: 'Rebuilding our routing and authentication gateway for a 3x speedup. Standardizing REST endpoints and adding extensive logging middleware.',
      ownerId: 'u-3',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Project Members mapping project to users with a specific role
  const projectMembers = [
    // Phoenix Redesign (Sarah is Owner/Admin)
    { id: 'pm-1', projectId: 'p-1', userId: 'u-1', role: 'Admin', createdAt: new Date().toISOString() },
    { id: 'pm-2', projectId: 'p-1', userId: 'u-2', role: 'Member', createdAt: new Date().toISOString() },
    { id: 'pm-3', projectId: 'p-1', userId: 'u-4', role: 'Member', createdAt: new Date().toISOString() },
    
    // API Gateway (Alex is Owner/Admin)
    { id: 'pm-4', projectId: 'p-2', userId: 'u-3', role: 'Admin', createdAt: new Date().toISOString() },
    { id: 'pm-5', projectId: 'p-2', userId: 'u-1', role: 'Member', createdAt: new Date().toISOString() },
    { id: 'pm-6', projectId: 'p-2', userId: 'u-2', role: 'Member', createdAt: new Date().toISOString() }
  ];

  // Default Tasks
  const tasks = [
    {
      id: 't-1',
      projectId: 'p-1',
      title: 'Design high-fidelity UI mockups',
      description: 'Create beautiful Figma boards with high HSL contrast, dynamic buttons, soft shadows, and clean typography. Focus on glassmorphism details for sidebar.',
      status: 'Completed',
      priority: 'High',
      assigneeId: 'u-4',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 't-2',
      projectId: 'p-1',
      title: 'Implement dynamic dashboard shell',
      description: 'Build core responsive shell structure, setup main CSS variables, custom dark/light color scheme support, and slide-in sidebar UI.',
      status: 'In Progress',
      priority: 'High',
      assigneeId: 'u-2',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 't-3',
      projectId: 'p-1',
      title: 'Hook up analytics widgets & charts',
      description: 'Integrate the SVG-based visual progression charts. Include animated rings and counts for active, completed, and overdue tasks.',
      status: 'To Do',
      priority: 'Medium',
      assigneeId: 'u-2',
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 't-4',
      projectId: 'p-1',
      title: 'Fix edge cases in mobile sidebar',
      description: 'Ensure mobile view side drawer closes smoothly on clicking backdrop, and overlays work correctly across iOS and Android browsers.',
      status: 'In Review',
      priority: 'Low',
      assigneeId: 'u-4',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Overdue!
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    
    // API Gateway Tasks
    {
      id: 't-5',
      projectId: 'p-2',
      title: 'Define API routing schemas',
      description: 'Design mapping configuration format for JSON inputs. Write robust route matching functions, wildcard handlers, and proxy path rewrite engines.',
      status: 'Completed',
      priority: 'High',
      assigneeId: 'u-3',
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 't-6',
      projectId: 'p-2',
      title: 'Implement JWT validation middleware',
      description: 'Create lightweight, fast middleware utilizing jsonwebtoken package to parse Auth header, validate signatures, and attach roles securely.',
      status: 'In Progress',
      priority: 'High',
      assigneeId: 'u-1',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 't-7',
      projectId: 'p-2',
      title: 'Benchmark proxy routing latencies',
      description: 'Run load testing scripts using autocannon or wrk. Record average, p95, and p99 response times. Verify we hit our 3x speedup target.',
      status: 'To Do',
      priority: 'Low',
      assigneeId: 'u-2',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Task Comments
  const comments = [
    {
      id: 'c-1',
      taskId: 't-2',
      userId: 'u-1',
      content: 'I have verified the color choices. The slate-indigo palette is exceptionally clean. Let us make sure shadows use HSL transparency for optimal softness.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'c-2',
      taskId: 't-2',
      userId: 'u-2',
      content: 'Agreed! Working on matching custom CSS variables right now. Should be ready for review tomorrow afternoon.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'c-3',
      taskId: 't-4',
      userId: 'u-4',
      content: 'Encountered a touch target issue on iOS Safari. Fixing this now via custom pointer-events variables.',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    }
  ];

  const db = { users, projects, projectMembers, tasks, comments };
  writeDB(db);
  return db;
}

// Database helper functions resembling an ORM
const db = {
  // Users
  users: {
    findMany: () => {
      const data = readDB();
      return data.users.map(u => {
        const { password, ...safeUser } = u;
        return safeUser;
      });
    },
    findOne: (filter) => {
      const data = readDB();
      const user = data.users.find(u => {
        return Object.keys(filter).every(key => u[key] === filter[key]);
      });
      return user; // returns password for verification if needed
    },
    create: (userData) => {
      const data = readDB();
      const salt = bcrypt.genSaltSync(10);
      const newUser = {
        id: `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: bcrypt.hashSync(userData.password, salt),
        avatar: userData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`, // default avatar
        createdAt: new Date().toISOString()
      };
      
      // Check if user already exists
      if (data.users.some(u => u.email === newUser.email)) {
        throw new Error('User with this email already exists');
      }

      data.users.push(newUser);
      writeDB(data);

      const { password, ...safeUser } = newUser;
      return safeUser;
    }
  },

  // Projects
  projects: {
    findMany: (filter = {}) => {
      const data = readDB();
      return data.projects.filter(p => {
        return Object.keys(filter).every(key => p[key] === filter[key]);
      });
    },
    findOne: (id) => {
      const data = readDB();
      return data.projects.find(p => p.id === id);
    },
    create: (projectData) => {
      const data = readDB();
      const newProject = {
        id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: projectData.name,
        description: projectData.description,
        ownerId: projectData.ownerId,
        dueDate: projectData.dueDate,
        status: 'In Progress',
        createdAt: new Date().toISOString()
      };

      data.projects.push(newProject);
      
      // Automatically add owner as Admin in ProjectMembers
      const newMember = {
        id: `pm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectId: newProject.id,
        userId: projectData.ownerId,
        role: 'Admin',
        createdAt: new Date().toISOString()
      };
      data.projectMembers.push(newMember);

      writeDB(data);
      return newProject;
    },
    update: (id, updateData) => {
      const data = readDB();
      const index = data.projects.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Project not found');
      
      data.projects[index] = {
        ...data.projects[index],
        ...updateData
      };
      writeDB(data);
      return data.projects[index];
    },
    delete: (id) => {
      const data = readDB();
      data.projects = data.projects.filter(p => p.id !== id);
      data.projectMembers = data.projectMembers.filter(pm => pm.projectId !== id);
      data.tasks = data.tasks.filter(t => t.projectId !== id);
      // Clean up comments for tasks in this project
      const projectTasks = data.tasks.filter(t => t.projectId === id).map(t => t.id);
      data.comments = data.comments.filter(c => !projectTasks.includes(c.taskId));
      
      writeDB(data);
      return true;
    }
  },

  // Project Members (Role-based access mapping)
  projectMembers: {
    findMany: (filter = {}) => {
      const data = readDB();
      return data.projectMembers.filter(pm => {
        return Object.keys(filter).every(key => pm[key] === filter[key]);
      });
    },
    findOne: (filter = {}) => {
      const data = readDB();
      return data.projectMembers.find(pm => {
        return Object.keys(filter).every(key => pm[key] === filter[key]);
      });
    },
    create: (memberData) => {
      const data = readDB();
      
      // Prevent duplicates
      const exists = data.projectMembers.find(
        pm => pm.projectId === memberData.projectId && pm.userId === memberData.userId
      );
      if (exists) {
        throw new Error('User is already a member of this project');
      }

      const newMember = {
        id: `pm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectId: memberData.projectId,
        userId: memberData.userId,
        role: memberData.role || 'Member', // Admin or Member
        createdAt: new Date().toISOString()
      };

      data.projectMembers.push(newMember);
      writeDB(data);
      return newMember;
    },
    updateRole: (projectId, userId, role) => {
      const data = readDB();
      const member = data.projectMembers.find(
        pm => pm.projectId === projectId && pm.userId === userId
      );
      if (!member) throw new Error('Project member not found');
      member.role = role;
      writeDB(data);
      return member;
    },
    delete: (projectId, userId) => {
      const data = readDB();
      
      // Ensure we don't delete the last admin of a project
      const project = data.projects.find(p => p.id === projectId);
      if (project && project.ownerId === userId) {
        throw new Error('Cannot remove the project owner');
      }

      data.projectMembers = data.projectMembers.filter(
        pm => !(pm.projectId === projectId && pm.userId === userId)
      );
      
      // Unassign tasks of this user in this project
      data.tasks.forEach(t => {
        if (t.projectId === projectId && t.assigneeId === userId) {
          t.assigneeId = null;
        }
      });

      writeDB(data);
      return true;
    }
  },

  // Tasks
  tasks: {
    findMany: (filter = {}) => {
      const data = readDB();
      return data.tasks.filter(t => {
        return Object.keys(filter).every(key => t[key] === filter[key]);
      });
    },
    findOne: (id) => {
      const data = readDB();
      return data.tasks.find(t => t.id === id);
    },
    create: (taskData) => {
      const data = readDB();
      const newTask = {
        id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectId: taskData.projectId,
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || 'To Do',
        priority: taskData.priority || 'Medium',
        assigneeId: taskData.assigneeId || null,
        dueDate: taskData.dueDate,
        createdAt: new Date().toISOString()
      };

      data.tasks.push(newTask);
      writeDB(data);
      return newTask;
    },
    update: (id, updateData) => {
      const data = readDB();
      const index = data.tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Task not found');

      data.tasks[index] = {
        ...data.tasks[index],
        ...updateData
      };
      writeDB(data);
      return data.tasks[index];
    },
    delete: (id) => {
      const data = readDB();
      data.tasks = data.tasks.filter(t => t.id !== id);
      data.comments = data.comments.filter(c => c.taskId !== id);
      writeDB(data);
      return true;
    }
  },

  // Comments
  comments: {
    findManyByTask: (taskId) => {
      const data = readDB();
      return data.comments.filter(c => c.taskId === taskId);
    },
    create: (commentData) => {
      const data = readDB();
      const newComment = {
        id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        taskId: commentData.taskId,
        userId: commentData.userId,
        content: commentData.content,
        createdAt: new Date().toISOString()
      };

      data.comments.push(newComment);
      writeDB(data);
      return newComment;
    }
  }
};

module.exports = db;
