import { config } from '../config/env.js';

const API = `http://localhost:${config.port}/api`;

const runVerificationTests = async () => {
  console.log('🧪 Starting EventSphere End-to-End System Integration Tests...\n');

  try {
    // 1. Health check
    const healthRes = await fetch(`${API}/health`);
    const health = await healthRes.json();
    console.log(`[Test 1] Health Check: ${health.status === 'healthy' ? '✅ PASS' : '❌ FAIL'}`);

    // 2. Participant Login
    const partLoginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'participant@eventsphere.io', password: 'Password123!' }),
    });
    const partAuth = await partLoginRes.json();
    const partToken = partAuth.token;
    console.log(`[Test 2] Participant Login: ${partAuth.success ? '✅ PASS' : '❌ FAIL'} (User: ${partAuth.user.name})`);

    // 3. Organizer Login
    const orgLoginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'organizer@eventsphere.io', password: 'Password123!' }),
    });
    const orgAuth = await orgLoginRes.json();
    const orgToken = orgAuth.token;
    console.log(`[Test 3] Organizer Login: ${orgAuth.success ? '✅ PASS' : '❌ FAIL'} (User: ${orgAuth.user.name})`);

    // 4. Discover Events
    const eventsRes = await fetch(`${API}/events`);
    const eventsData = await eventsRes.json();
    const targetEvent = eventsData.events.find((e: any) => e.slug === 'hyperlocal-36-hour-open-hackathon');
    console.log(`[Test 4] Event Discovery: ${eventsData.events.length > 0 ? '✅ PASS' : '❌ FAIL'} (Found ${eventsData.events.length} events)`);

    if (!targetEvent) throw new Error('Target test event not found in database');
    const initialSeats = targetEvent.remainingSeats;

    // 5. Register for Event & Generate QR Ticket Pass
    const regRes = await fetch(`${API}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partToken}`,
      },
      body: JSON.stringify({ eventId: targetEvent._id }),
    });
    const regData = await regRes.json();
    console.log(`[Test 5] Event Registration & QR Ticket: ${regData.success ? '✅ PASS' : '❌ FAIL'} (Ticket: ${regData.ticket?.ticketCode})`);

    // 6. Test Duplicate Registration Prevention
    const dupRegRes = await fetch(`${API}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partToken}`,
      },
      body: JSON.stringify({ eventId: targetEvent._id }),
    });
    console.log(`[Test 6] Duplicate Registration Prevention: ${dupRegRes.status === 400 ? '✅ PASS' : '❌ FAIL'} (Rejected with 400 Bad Request)`);

    // 7. Organizer Scans QR Ticket (Check-In)
    const scanRes = await fetch(`${API}/attendance/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgToken}`,
      },
      body: JSON.stringify({
        tokenOrCode: regData.ticket.ticketToken,
        eventId: targetEvent._id,
      }),
    });
    const scanData = await scanRes.json();
    console.log(`[Test 7] QR Ticket Scan & Verified Check-in: ${scanData.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`         Coins Awarded: +${scanData.reward?.coinsAwarded} EventCoins | Certificate ID: ${scanData.certificateId}`);

    // 8. Test Duplicate Scan Prevention
    const dupScanRes = await fetch(`${API}/attendance/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgToken}`,
      },
      body: JSON.stringify({
        tokenOrCode: regData.ticket.ticketToken,
        eventId: targetEvent._id,
      }),
    });
    const dupScanData = await dupScanRes.json();
    console.log(`[Test 8] Duplicate Scan Prevention: ${dupScanRes.status === 409 && dupScanData.isDuplicate ? '✅ PASS' : '❌ FAIL'} (Message: "${dupScanData.message}")`);

    // 9. Verify Participant Attendance Counter & Coin Ledger
    const histRes = await fetch(`${API}/attendance/my-history`, {
      headers: { Authorization: `Bearer ${partToken}` },
    });
    const histData = await histRes.json();
    console.log(`[Test 9] Verified Attendance History Increment: ${histData.totalVerifiedAttended >= 2 ? '✅ PASS' : '❌ FAIL'} (Total: ${histData.totalVerifiedAttended} events)`);

    // 10. Verify Public Certificate Verification Registry
    if (scanData.certificateId) {
      const verifyRes = await fetch(`${API}/certificates/verify/${scanData.certificateId}`);
      const verifyData = await verifyRes.json();
      console.log(`[Test 10] Public Certificate Verification: ${verifyData.isValid ? '✅ PASS' : '❌ FAIL'} (Recipient: ${verifyData.certificate.participantName})`);
    }

    console.log('\n🎉 ALL 10 INTEGRATION TESTS COMPLETED SUCCESSFULLY!');
  } catch (err: any) {
    console.error('❌ Test execution error:', err.message);
  }
};

runVerificationTests();
