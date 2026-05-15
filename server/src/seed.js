import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@taskflow.com',
      password: 'Admin123',
      role: 'admin',
      department: 'Engineering',
      bio: 'Platform administrator',
    });

    const member1 = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah@taskflow.com',
      password: 'Member123',
      role: 'member',
      department: 'Design',
      bio: 'UI/UX Designer',
    });

    const member2 = await User.create({
      name: 'Mike Chen',
      email: 'mike@taskflow.com',
      password: 'Member123',
      role: 'member',
      department: 'Engineering',
      bio: 'Full Stack Developer',
    });

    const member3 = await User.create({
      name: 'Emily Davis',
      email: 'emily@taskflow.com',
      password: 'Member123',
      role: 'member',
      department: 'Marketing',
      bio: 'Marketing Specialist',
    });

    console.log('Created users');

    // Create projects
    const project1 = await Project.create({
      title: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX principles and improved performance.',
      createdBy: admin._id,
      members: [
        { user: member1._id, role: 'lead' },
        { user: member2._id, role: 'contributor' },
      ],
      status: 'active',
      priority: 'high',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      color: '#0f62fe',
      tags: ['design', 'frontend'],
    });

    const project2 = await Project.create({
      title: 'Mobile App Development',
      description: 'Build a cross-platform mobile app for iOS and Android using React Native.',
      createdBy: admin._id,
      members: [
        { user: member2._id, role: 'lead' },
        { user: member3._id, role: 'contributor' },
      ],
      status: 'planning',
      priority: 'medium',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      color: '#06b6d4',
      tags: ['mobile', 'react-native'],
    });

    const project3 = await Project.create({
      title: 'Marketing Campaign Q2',
      description: 'Plan and execute the Q2 marketing campaign across all channels.',
      createdBy: admin._id,
      members: [
        { user: member3._id, role: 'lead' },
        { user: member1._id, role: 'contributor' },
      ],
      status: 'active',
      priority: 'medium',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      color: '#10b981',
      tags: ['marketing', 'campaign'],
    });

    console.log('Created projects');

    // Create tasks
    const tasks = [
      { title: 'Design homepage mockup', description: 'Create high-fidelity mockups for the new homepage', projectId: project1._id, assignedTo: member1._id, createdBy: admin._id, priority: 'high', status: 'completed', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { title: 'Implement responsive navbar', description: 'Build a responsive navigation bar with mobile menu', projectId: project1._id, assignedTo: member2._id, createdBy: admin._id, priority: 'high', status: 'in-progress', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
      { title: 'Create design system', description: 'Set up colors, typography, and component library', projectId: project1._id, assignedTo: member1._id, createdBy: admin._id, priority: 'medium', status: 'pending', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      { title: 'Optimize page load speed', description: 'Improve performance metrics to under 2s load time', projectId: project1._id, assignedTo: member2._id, createdBy: admin._id, priority: 'medium', status: 'pending', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) },
      { title: 'Setup React Native project', description: 'Initialize the project with proper architecture', projectId: project2._id, assignedTo: member2._id, createdBy: admin._id, priority: 'high', status: 'completed', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { title: 'Design app wireframes', description: 'Create wireframes for all major screens', projectId: project2._id, assignedTo: member1._id, createdBy: admin._id, priority: 'medium', status: 'in-progress', dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000) },
      { title: 'Implement authentication flow', description: 'Build login, register, and password reset screens', projectId: project2._id, assignedTo: member2._id, createdBy: admin._id, priority: 'high', status: 'pending', dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000) },
      { title: 'Create social media calendar', description: 'Plan posts for all social media channels', projectId: project3._id, assignedTo: member3._id, createdBy: admin._id, priority: 'medium', status: 'in-progress', dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000) },
      { title: 'Write blog posts', description: 'Write 4 blog posts for the Q2 campaign', projectId: project3._id, assignedTo: member3._id, createdBy: admin._id, priority: 'low', status: 'pending', dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000) },
      { title: 'Design email templates', description: 'Create responsive email templates for the campaign', projectId: project3._id, assignedTo: member1._id, createdBy: admin._id, priority: 'medium', status: 'completed', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { title: 'SEO audit report', description: 'Review outdated content and broken links', projectId: project1._id, assignedTo: member2._id, createdBy: admin._id, priority: 'low', status: 'overdue', dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ];

    for (const taskData of tasks) {
      await Task.create({
        ...taskData,
        activityLogs: [{ user: admin._id, action: 'created', details: `Task "${taskData.title}" created` }],
      });
    }

    console.log('Created tasks');

    console.log('\n[OK] Seed completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@taskflow.com / Admin123');
    console.log('Member: sarah@taskflow.com / Member123');
    console.log('Member: mike@taskflow.com / Member123');
    console.log('Member: emily@taskflow.com / Member123\n');

    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Seed failed:', error);
    process.exit(1);
  }
};

seedData();
