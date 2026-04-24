require('dotenv').config();
const db = require('../models');

async function seed() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ force: true });
    console.log('Database synced.');

    // Create Admin
    const admin = await db.User.create({
      name: 'Admin User',
      email: 'admin@societycare.com',
      phone: '9999999999',
      password: 'Admin@123',
      role: 'admin',
      houseNumber: 'Office',
      tower: 'Main',
      isEmailVerified: true,
    });

    // Create Residents
    const residents = await db.User.bulkCreate([
      { name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '9876543210', password: 'Pass@123', role: 'resident', houseNumber: 'A-101', tower: 'Tower A', isEmailVerified: true },
      { name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543211', password: 'Pass@123', role: 'resident', houseNumber: 'A-202', tower: 'Tower A', isEmailVerified: true },
      { name: 'Amit Patel', email: 'amit@example.com', phone: '9876543212', password: 'Pass@123', role: 'resident', houseNumber: 'B-301', tower: 'Tower B', isEmailVerified: true },
      { name: 'Sunita Devi', email: 'sunita@example.com', phone: '9876543213', password: 'Pass@123', role: 'resident', houseNumber: 'B-102', tower: 'Tower B', isEmailVerified: true },
      { name: 'Vikram Singh', email: 'vikram@example.com', phone: '9876543214', password: 'Pass@123', role: 'resident', houseNumber: 'C-401', tower: 'Tower C', isEmailVerified: true },
    ], { individualHooks: true });

    // Create Staff Users
    const staffUsers = await db.User.bulkCreate([
      { name: 'Ramesh Electrician', email: 'ramesh@example.com', phone: '9876543220', password: 'Staff@123', role: 'staff', isEmailVerified: true },
      { name: 'Suresh Plumber', email: 'suresh@example.com', phone: '9876543221', password: 'Staff@123', role: 'staff', isEmailVerified: true },
      { name: 'Mohan Carpenter', email: 'mohan@example.com', phone: '9876543222', password: 'Staff@123', role: 'staff', isEmailVerified: true },
    ], { individualHooks: true });

    // Create Service Personnel
    const personnel = await db.ServicePersonnel.bulkCreate([
      { name: 'Ramesh Kumar', phone: '9876543220', email: 'ramesh@example.com', specialization: 'electrician', rating: 4.5, totalJobs: 45, userId: staffUsers[0].id },
      { name: 'Suresh Yadav', phone: '9876543221', email: 'suresh@example.com', specialization: 'plumber', rating: 4.2, totalJobs: 38, userId: staffUsers[1].id },
      { name: 'Mohan Lal', phone: '9876543222', email: 'mohan@example.com', specialization: 'carpenter', rating: 4.7, totalJobs: 52, userId: staffUsers[2].id },
      { name: 'Raju Cleaner', phone: '9876543223', specialization: 'cleaner', rating: 4.0, totalJobs: 120 },
      { name: 'Sanjay Painter', phone: '9876543224', specialization: 'painter', rating: 4.3, totalJobs: 25 },
    ]);

    // Create Family Members
    await db.FamilyMember.bulkCreate([
      { userId: residents[0].id, name: 'Meena Kumar', relation: 'Wife', age: 35, phone: '9876543230' },
      { userId: residents[0].id, name: 'Rahul Kumar', relation: 'Son', age: 12 },
      { userId: residents[1].id, name: 'Arun Sharma', relation: 'Husband', age: 38, phone: '9876543231' },
      { userId: residents[2].id, name: 'Neha Patel', relation: 'Wife', age: 30, phone: '9876543232' },
    ]);

    // Create Service Requests
    const requests = await db.ServiceRequest.bulkCreate([
      { userId: residents[0].id, title: 'Electrical Short Circuit', category: 'electrical', description: 'Short circuit in kitchen. Sparks coming from switch board near the gas stove.', priority: 'urgent', status: 'assigned', aiSummary: 'Kitchen switchboard short circuit with sparking near gas stove. Urgent safety concern.' },
      { userId: residents[1].id, title: 'Bathroom Tap Leaking', category: 'plumbing', description: 'Bathroom tap has been leaking continuously for 2 days. Water wastage is significant.', priority: 'high', status: 'in_progress', aiSummary: 'Continuous bathroom tap leak for 2 days causing water wastage.' },
      { userId: residents[2].id, title: 'Door Hinge Broken', category: 'carpentry', description: 'Main door hinge is broken. Door is not closing properly causing security concern.', priority: 'medium', status: 'pending', aiSummary: 'Broken main door hinge creating security issue.' },
      { userId: residents[3].id, title: 'Cockroach Problem', category: 'pest_control', description: 'Kitchen has severe cockroach infestation. Need pest control treatment urgently.', priority: 'high', status: 'pending', aiSummary: 'Severe cockroach infestation in kitchen requiring pest control.' },
      { userId: residents[0].id, title: 'Wall Paint Peeling', category: 'painting', description: 'Living room wall paint is peeling off due to water seepage from above floor.', priority: 'low', status: 'completed', aiSummary: 'Wall paint peeling due to water seepage from upper floor.', resolvedAt: new Date() },
    ]);

    // Create Assignments
    await db.Assignment.bulkCreate([
      { requestId: requests[0].id, personnelId: personnel[0].id, assignedBy: admin.id, status: 'assigned' },
      { requestId: requests[1].id, personnelId: personnel[1].id, assignedBy: admin.id, status: 'in_progress', startedAt: new Date() },
      { requestId: requests[4].id, personnelId: personnel[4].id, assignedBy: admin.id, status: 'completed', startedAt: new Date(Date.now() - 86400000), completedAt: new Date() },
    ]);

    // Create Feedback
    await db.Feedback.create({
      userId: residents[0].id,
      requestId: requests[4].id,
      rating: 4,
      comment: 'Good work. Paint job looks great.',
      personnelBehavior: 5,
      serviceQuality: 4,
      timeliness: 3,
    });

    // Create Maintenance Fee Structure
    await db.MaintenanceFee.bulkCreate([
      { tower: null, flatType: '1BHK', amount: 2500.00, lateFeePerDay: 50.00, dueDay: 10, effectiveFrom: '2025-01-01' },
      { tower: null, flatType: '2BHK', amount: 3500.00, lateFeePerDay: 50.00, dueDay: 10, effectiveFrom: '2025-01-01' },
      { tower: null, flatType: '3BHK', amount: 5000.00, lateFeePerDay: 75.00, dueDay: 10, effectiveFrom: '2025-01-01' },
    ]);

    // Create Payments
    await db.Payment.bulkCreate([
      { userId: residents[0].id, amount: 3500.00, lateFee: 0, totalAmount: 3500.00, month: '2025-03', status: 'completed', paymentMethod: 'razorpay', paidAt: new Date('2025-03-08'), dueDate: '2025-03-10' },
      { userId: residents[0].id, amount: 3500.00, lateFee: 0, totalAmount: 3500.00, month: '2025-04', status: 'pending', dueDate: '2025-04-10' },
      { userId: residents[1].id, amount: 3500.00, lateFee: 0, totalAmount: 3500.00, month: '2025-03', status: 'completed', paymentMethod: 'upi', paidAt: new Date('2025-03-05'), dueDate: '2025-03-10' },
      { userId: residents[2].id, amount: 5000.00, lateFee: 250, totalAmount: 5250.00, month: '2025-03', status: 'completed', paymentMethod: 'cash', paidAt: new Date('2025-03-15'), dueDate: '2025-03-10' },
    ]);

    // Create Announcements
    await db.Announcement.bulkCreate([
      { title: 'Water Supply Maintenance', content: 'Water supply will be interrupted on Sunday 10 AM - 2 PM for tank cleaning. Please store water accordingly.', category: 'maintenance', createdBy: admin.id },
      { title: 'Annual General Meeting', content: 'Annual General Meeting of the Society will be held on 25th April at 6 PM in the community hall. All residents are requested to attend.', category: 'event', createdBy: admin.id },
      { title: 'Maintenance Fee Revision', content: 'Please note that maintenance fees have been revised effective January 2025. Check the payment section for updated amounts.', category: 'payment', createdBy: admin.id },
    ]);

    // Create Visitors
    await db.Visitor.bulkCreate([
      { userId: residents[0].id, visitorName: 'Delivery Person', visitorPhone: '9876543290', purpose: 'Package delivery', expectedDate: new Date().toISOString().split('T')[0], status: 'expected' },
      { userId: residents[1].id, visitorName: 'Dr. Mehta', visitorPhone: '9876543291', purpose: 'Medical visit', expectedDate: new Date().toISOString().split('T')[0], status: 'checked_in', checkInTime: new Date() },
    ]);

    console.log('Seed data inserted successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@societycare.com / Admin@123');
    console.log('Resident: rajesh@example.com / Pass@123');
    console.log('Staff: ramesh@example.com / Staff@123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
