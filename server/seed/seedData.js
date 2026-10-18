require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const MaintenanceTicket = require('../models/MaintenanceTicket');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const seedAll = async () => {
  try {
    await connectDB();
    console.log('[Seed] Purging existing database collections...');

    await Promise.all([
      User.deleteMany({}),
      Resource.deleteMany({}),
      Booking.deleteMany({}),
      MaintenanceTicket.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed] Seeding demo users across all 4 roles...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const users = await User.create([
      {
        name: 'Aarav Sharma',
        email: 'student@campus.edu',
        passwordHash,
        role: 'student',
        department: 'Computer Science & Engineering',
        phone: '+91 98765 43210',
        isActive: true,
      },
      {
        name: 'Dr. Priya Nair',
        email: 'faculty@campus.edu',
        passwordHash,
        role: 'faculty',
        department: 'Electronics & Communication',
        phone: '+91 98765 43211',
        isActive: true,
      },
      {
        name: 'Rajesh Verma',
        email: 'manager@campus.edu',
        passwordHash,
        role: 'resource_manager',
        department: 'Campus Infrastructure & Facility Management',
        phone: '+91 98765 43212',
        isActive: true,
      },
      {
        name: 'Dr. Vikram Malhotra',
        email: 'admin@campus.edu',
        passwordHash,
        role: 'admin',
        department: 'Deanery of Academic Operations',
        phone: '+91 98765 43213',
        isActive: true,
      },
    ]);

    const [studentUser, facultyUser, managerUser, adminUser] = users;

    console.log('[Seed] Seeding campus resources...');
    const resources = await Resource.create([
      {
        name: 'Turing Advanced Computing Lab (CS-301)',
        type: 'Computer Lab',
        location: { building: 'Tech Block A', floor: '3rd Floor', roomNumber: 'CS-301' },
        capacity: 45,
        equipment: ['High-End PCs', '4K Projector', 'Air Conditioning', 'Gigabit LAN', 'Smart Board'],
        status: 'Available',
        approvalRequired: true,
        description: 'Equipped with 45 Linux/Windows dual-boot high-performance GPU workstations for AI, Full-Stack development, and networking practicals.',
      },
      {
        name: 'Ramanujan Lecture Theatre (LT-101)',
        type: 'Classroom',
        location: { building: 'Aryabhatta Science Block', floor: '1st Floor', roomNumber: 'LT-101' },
        capacity: 80,
        equipment: ['Dual Projectors', 'Wireless Mic & Audio System', 'Air Conditioning', 'Smart Board', 'Document Camera'],
        status: 'Available',
        approvalRequired: false,
        description: 'Tiered auditorium-style lecture hall with stepped acoustic seating and dual projection screens.',
      },
      {
        name: 'Bhabha Central Seminar Hall',
        type: 'Seminar Hall',
        location: { building: 'Administrative Complex', floor: 'Ground Floor', roomNumber: 'SH-Auditorium' },
        capacity: 180,
        equipment: ['Stage Lighting', 'Surround Sound', 'Video Conferencing', 'Dual HD Screens', 'Podium Mic', 'Air Conditioning'],
        status: 'Available',
        approvalRequired: true,
        description: 'Premier campus auditorium for guest lectures, national conferences, hackathons, and symposiums.',
      },
      {
        name: 'Edison Robotics & IoT Innovation Lab (EE-205)',
        type: 'Computer Lab',
        location: { building: 'Tech Block B', floor: '2nd Floor', roomNumber: 'EE-205' },
        capacity: 35,
        equipment: ['Oscilloscopes', '3D Printers', 'Soldering Stations', 'PCs', 'Air Conditioning'],
        status: 'Available',
        approvalRequired: true,
        description: 'Specialized maker lab for IoT development, microcontroller programming, and hardware prototyping.',
      },
      {
        name: '4K Ultra-Portable Laser Projector Kit #1',
        type: 'Projector',
        location: { building: 'AV Resource Center', floor: 'Ground Floor', roomNumber: 'AV-04' },
        capacity: 1,
        equipment: ['4K Laser Projector', 'Heavy-Duty Tripod', 'HDMI/Type-C Converters', 'Wireless Presentation Remote'],
        status: 'Available',
        approvalRequired: false,
        description: 'High-lumen portable projection kit available for faculty check-out for classroom presentations.',
      },
      {
        name: 'APJ Abdul Kalam Executive Conference Room',
        type: 'Conference Room',
        location: { building: 'Administrative Complex', floor: '4th Floor', roomNumber: 'ADM-401' },
        capacity: 25,
        equipment: ['Oval Conference Table', 'Cisco Telepresence', 'Ceiling Mic Array', '65-inch Interactive Display', 'Air Conditioning'],
        status: 'Available',
        approvalRequired: true,
        description: 'Executive conference room reserved for board meetings, faculty committees, and project defenses.',
      },
      {
        name: 'Central Indoor Badminton & Table Tennis Arena',
        type: 'Sports Facility',
        location: { building: 'Sports Pavilion', floor: 'Ground Floor', roomNumber: 'SP-Main' },
        capacity: 20,
        equipment: ['Synthetic BWF Courts', 'LED Floodlights', 'Electronic Scoreboard', 'Equipment Locker'],
        status: 'Available',
        approvalRequired: false,
        description: 'Dual synthetic indoor court for campus badminton and table tennis practice.',
      },
      {
        name: 'Chemical & Materials Characterization Lab',
        type: 'Lab Equipment',
        location: { building: 'Science Block B', floor: '1st Floor', roomNumber: 'CHEM-102' },
        capacity: 15,
        equipment: ['UV-Vis Spectrophotometer', 'Fume Hoods', 'Centrifuge', 'Precision Analytical Balances'],
        status: 'Under Maintenance',
        maintenanceNote: 'Fume hood ventilation undergoing filter replacement.',
        approvalRequired: true,
        description: 'Advanced chemistry laboratory for analytical research and synthesis experiments.',
      },
    ]);

    const [turingLab, ramanujanHall, bhabhaHall, edisonLab, projectorKit, conferenceRoom] = resources;

    console.log('[Seed] Seeding sample bookings with future demonstration dates...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const slot1Start = new Date(tomorrow);
    slot1Start.setHours(10, 0, 0, 0);
    const slot1End = new Date(tomorrow);
    slot1End.setHours(12, 0, 0, 0);

    const slot2Start = new Date(tomorrow);
    slot2Start.setHours(14, 0, 0, 0);
    const slot2End = new Date(tomorrow);
    slot2End.setHours(16, 0, 0, 0);

    const slot3Start = new Date(tomorrow);
    slot3Start.setHours(16, 30, 0, 0);
    const slot3End = new Date(tomorrow);
    slot3End.setHours(18, 0, 0, 0);

    const bookings = await Booking.create([
      {
        userId: facultyUser._id,
        resourceId: turingLab._id,
        startTime: slot1Start,
        endTime: slot1End,
        purpose: 'Full-Stack Development Lab Exam (CS301-A)',
        attendeesCount: 42,
        status: 'Approved',
        decisionBy: managerUser._id,
        decisionReason: 'Departmental practical exam approved.',
      },
      {
        userId: studentUser._id,
        resourceId: bhabhaHall._id,
        startTime: slot2Start,
        endTime: slot2End,
        purpose: 'Campus Coding Club Annual Hackathon Kickoff',
        attendeesCount: 120,
        status: 'Pending',
      },
      {
        userId: facultyUser._id,
        resourceId: ramanujanHall._id,
        startTime: slot3Start,
        endTime: slot3End,
        purpose: 'Guest Lecture on Cloud Native Microservices',
        attendeesCount: 75,
        status: 'Approved',
        decisionBy: adminUser._id,
        decisionReason: 'Academic guest lecture.',
      },
    ]);

    console.log('[Seed] Seeding sample maintenance tickets...');
    const tickets = await MaintenanceTicket.create([
      {
        resourceId: ramanujanHall._id,
        reportedBy: facultyUser._id,
        description: 'Ceiling projector lamp is flickering intermittently during slide transitions.',
        priority: 'Medium',
        status: 'In Progress',
        assignedTo: 'Suresh (AV Support Team)',
      },
      {
        resourceId: turingLab._id,
        reportedBy: studentUser._id,
        description: 'Workstations #12 and #13 have loose Ethernet RJ-45 jacks causing connection drops.',
        priority: 'Low',
        status: 'Open',
        assignedTo: 'Unassigned',
      },
    ]);

    console.log('[Seed] Seeding sample notifications...');
    await Notification.create([
      {
        userId: studentUser._id,
        message: 'Your booking request for Bhabha Central Seminar Hall is pending approval from the facility manager.',
        type: 'booking_update',
        link: '/bookings',
        isRead: false,
      },
      {
        userId: facultyUser._id,
        message: 'Your booking for Turing Advanced Computing Lab (CS-301) has been approved!',
        type: 'booking_update',
        link: '/bookings',
        isRead: true,
      },
    ]);

    console.log('[Seed] Database seeded successfully!');
    console.log('---------------------------------------------------------');
    console.log('Demo Credentials Ready for Viva / Evaluation:');
    console.log('  1. Student:          student@campus.edu    / password123');
    console.log('  2. Faculty:          faculty@campus.edu    / password123');
    console.log('  3. Resource Manager: manager@campus.edu    / password123');
    console.log('  4. Admin:            admin@campus.edu      / password123');
    console.log('---------------------------------------------------------');

    return { users, resources, bookings, tickets };
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    throw error;
  }
};

// Allow direct CLI execution
if (require.main === module) {
  seedAll()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await closeDB();
      process.exit(1);
    });
}

module.exports = { seedAll };
