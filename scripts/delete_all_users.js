require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

async function deleteAllUsers() {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
  }
  
  let projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId) projectId = projectId.replace(/^"|"$/g, "");

  let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (clientEmail) clientEmail = clientEmail.replace(/^"|"$/g, "");

  const app = initializeApp({
    credential: cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    }),
  });

  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    console.log('Fetching all auth users...');
    let nextPageToken;
    let uids = [];
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      listUsersResult.users.forEach((userRecord) => {
        uids.push(userRecord.uid);
      });
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    if (uids.length > 0) {
      console.log(`Found ${uids.length} users. Deleting from Firebase Auth...`);
      const deleteResult = await auth.deleteUsers(uids);
      console.log(`Successfully deleted ${deleteResult.successCount} users.`);
      if (deleteResult.failureCount > 0) {
        console.log(`Failed to delete ${deleteResult.failureCount} users.`);
        console.error('Errors:', deleteResult.errors);
      }
    } else {
      console.log('No users found in Auth.');
    }

    console.log('Deleting users from Firestore "users" collection...');
    const usersSnapshot = await db.collection('users').get();
    if (!usersSnapshot.empty) {
      const batch = db.batch();
      usersSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`Successfully deleted ${usersSnapshot.size} documents from Firestore "users" collection.`);
    } else {
      console.log('No documents found in Firestore "users" collection.');
    }

    console.log('Finished.');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting users:', error);
    process.exit(1);
  }
}

deleteAllUsers();
