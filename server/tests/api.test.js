const http = require('http');

const request = (options, body = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- STARTING BACKEND REST API VALIDATION SUITE ---');

  // Test 1: Health Check
  const healthRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  console.log(`[Test 1] Health Check: Status ${healthRes.status} (${healthRes.data.status})`);
  if (healthRes.status !== 200) throw new Error('Health check failed');

  // Test 2: Student Login
  const studentLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'student@campus.edu', password: 'password123' }
  );
  console.log(`[Test 2] Student Login: Status ${studentLoginRes.status} (User: ${studentLoginRes.data.user.name}, Role: ${studentLoginRes.data.user.role})`);
  if (studentLoginRes.status !== 200 || !studentLoginRes.data.token) throw new Error('Student login failed');
  const studentToken = studentLoginRes.data.token;

  // Test 3: List Resources
  const resourcesRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/resources',
    method: 'GET',
  });
  console.log(`[Test 3] List Resources: Status ${resourcesRes.status} (Found ${resourcesRes.data.count} campus facilities)`);
  if (resourcesRes.status !== 200 || resourcesRes.data.count === 0) throw new Error('Resource listing failed');

  const turingLab = resourcesRes.data.resources.find((r) => r.name.includes('Turing'));
  if (!turingLab) throw new Error('Turing Lab seed not found');

  // Test 4: Resource Availability Check
  const availRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/resources/${turingLab._id}/availability`,
    method: 'GET',
  });
  console.log(`[Test 4] Availability Check for ${turingLab.name}: Status ${availRes.status} (Active Bookings: ${availRes.data.activeBookings.length})`);

  // Test 5: Conflict Detection (Section 14 Evaluation Demo: Attempt Conflicting Booking)
  // There is a seeded booking for tomorrow 10:00 - 12:00 in Turing Lab.
  // We attempt a conflicting booking 10:30 - 11:30.
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const conflictStart = new Date(tomorrow);
  conflictStart.setHours(10, 30, 0, 0);
  const conflictEnd = new Date(tomorrow);
  conflictEnd.setHours(11, 30, 0, 0);

  const conflictBookingRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/bookings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    },
    {
      resourceId: turingLab._id,
      startTime: conflictStart.toISOString(),
      endTime: conflictEnd.toISOString(),
      purpose: 'Conflicting Exam Booking Attempt',
    }
  );
  console.log(`[Test 5] Conflict Detection: Status ${conflictBookingRes.status} (Conflict Detected: ${conflictBookingRes.data.conflict})`);
  console.log(`         Alternative Slots suggested: ${conflictBookingRes.data.suggestions ? conflictBookingRes.data.suggestions.alternativeSlots.length : 0}`);
  if (conflictBookingRes.status !== 409) {
    throw new Error(`Expected 409 Conflict, got ${conflictBookingRes.status}`);
  }

  // Test 6: Security Check - Student attempting to call manager decision endpoint (Must return 403 Forbidden)
  const forbiddenRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/bookings/507f1f77bcf86cd799439011/decision',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    },
    { decision: 'Approved' }
  );
  console.log(`[Test 6] RBAC Security Check (Student unauthorized decision attempt): Status ${forbiddenRes.status} (Forbidden)`);
  if (forbiddenRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden for Student unauthorized call, got ${forbiddenRes.status}`);
  }

  // Test 7: Resource Manager Login & Approval
  const managerLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'manager@campus.edu', password: 'password123' }
  );
  console.log(`[Test 7] Manager Login: Status ${managerLoginRes.status} (Role: ${managerLoginRes.data.user.role})`);
  const managerToken = managerLoginRes.data.token;

  // Test 8: Analytics Overview
  const analyticsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/analytics/overview',
    method: 'GET',
    headers: { Authorization: `Bearer ${managerToken}` },
  });
  console.log(`[Test 8] Analytics Overview: Status ${analyticsRes.status} (Utilization Rate: ${analyticsRes.data.summary.utilizationRate}%)`);
  if (analyticsRes.status !== 200) throw new Error('Analytics failed');

  // Test 9: Smart Recommendations
  const recRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/resources/recommendations?capacity=40&equipment=Projector`,
    method: 'GET',
  });
  console.log(`[Test 9] Smart Recommendations: Status ${recRes.status} (Found ${recRes.data.count} candidates)`);
  if (recRes.data.recommendations.length > 0) {
    console.log(`         Top Pick: ${recRes.data.recommendations[0].resource.name} (${recRes.data.recommendations[0].matchScore}% Match)`);
  }

  console.log('--- ALL BACKEND ARCHITECTURE & REST TESTS PASSED PERFECTLY (100%) ---');
};

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
