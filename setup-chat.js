/**
 * Setup Chat Messages Collection in Appwrite
 * Run: node setup-chat.js
 */

const fs = require('fs');
const path = require('path');
const { Client, Databases, Permission, Role } = require('node-appwrite');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
}, {});
process.env = { ...process.env, ...envConfig };

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const CHAT_COL_ID = 'chat_messages';

async function setupChatCollection() {
    console.log('Setting up Chat collection...\n');

    try {
        // Create the collection
        await databases.createCollection(
            DB_ID,
            CHAT_COL_ID,
            'Chat Messages',
            [
                Permission.read(Role.users()),      // Only logged in users can read
                Permission.create(Role.users()),    // Only logged in users can post
                Permission.update(Role.users()),    // Users can update their own
                Permission.delete(Role.users()),    // Users can delete their own
            ]
        );
        console.log('✅ Created "chat_messages" collection');
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️ Collection already exists, updating attributes...');
        } else {
            console.error('❌ Error creating collection:', error.message);
            return;
        }
    }

    // Create attributes
    const attributes = [
        { name: 'content', type: 'string', size: 1000, required: true },
        { name: 'userId', type: 'string', size: 64, required: true },
        { name: 'userName', type: 'string', size: 128, required: true },
        { name: 'userAvatar', type: 'string', size: 1024, required: false }, // Optional avatar URL
    ];

    for (const attr of attributes) {
        try {
            await databases.createStringAttribute(
                DB_ID, CHAT_COL_ID, attr.name, attr.size, attr.required
            );
            console.log(`✅ Created attribute: ${attr.name}`);
        } catch (error) {
            if (error.code === 409) {
                console.log(`ℹ️ Attribute "${attr.name}" already exists`);
            } else {
                console.error(`❌ Error creating "${attr.name}":`, error.message);
            }
        }
    }

    // Wait for attributes to be processed
    console.log('\n⏳ Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create indexes
    try {
        // Index for sorting by time (created at)
        // Appwrite creates $createdAt index by default usually, but explicit index is good for queries
        // Actually for simple list orderDesc("$createdAt") uses internal index.
        // Let's create an index on userId just in case updates are needed
        await databases.createIndex(
            DB_ID, CHAT_COL_ID, 'userId_index', 'key', ['userId']
        );
        console.log('✅ Created userId index');
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️ userId index already exists');
        } else {
            console.error('❌ Error creating index:', error.message);
        }
    }

    console.log('\n✨ Chat collection setup complete!');
    console.log('\nAdd this to your .env.local:');
    console.log(`NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID=${CHAT_COL_ID}`);
}

setupChatCollection();
