require('dotenv').config({ path: '.env.local' });
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let app;
if (!getApps().length) {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
  }
  
  let projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId) projectId = projectId.replace(/^"|"$/g, '');

  let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (clientEmail) clientEmail = clientEmail.replace(/^"|"$/g, '');

  app = initializeApp({
    credential: cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    }),
  });
} else {
  app = getApps()[0];
}

const adminAuth = getAuth(app);

async function sendPasswordResetEmail(email) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestType: 'PASSWORD_RESET',
      email: email,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error(`Failed to send email to ${email}:`, data.error?.message || response.statusText);
    return false;
  }
  return true;
}

async function run() {
  try {
    let pageToken;
    let usersWithEmptyPassword = [];
    
    do {
      const listUsersResult = await adminAuth.listUsers(1000, pageToken);
      for (const userRecord of listUsersResult.users) {
        // If a user has no passwordHash, it means they have an empty password (or not set)
        if (!userRecord.passwordHash && userRecord.email) {
          usersWithEmptyPassword.push(userRecord.email);
        }
      }
      pageToken = listUsersResult.pageToken;
    } while (pageToken);

    console.log(`Found ${usersWithEmptyPassword.length} users with empty password.`);
    
    // Actually send them
    let successCount = 0;
    for (const email of usersWithEmptyPassword) {
      console.log(`Sending password reset to ${email}...`);
      const success = await sendPasswordResetEmail(email);
      if (success) {
        successCount++;
      }
      // slight delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`Successfully sent ${successCount}/${usersWithEmptyPassword.length} reset emails.`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

run();
