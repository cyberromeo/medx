/**
 * Setup User Progress Collection in Appwrite
 * Run: node setup-progress.js
 */

const fs = require('fs');
const path = require('path');
const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

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
const PROGRESS_COL_ID = 'user_progress';

async function setupProgressCollection() {
    console.log('Setting up User Progress collection...\n');

    try {
        // Create the collection
        await databases.createCollection(
            DB_ID,
            PROGRESS_COL_ID,
            'User Progress',
            [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ]
        );
        console.log('✅ Created "user_progress" collection');
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
        { name: 'userId', type: 'string', size: 64, required: true },
        { name: 'videoId', type: 'string', size: 64, required: true },
        { name: 'watchedAt', type: 'datetime', required: true },
        { name: 'xpEarned', type: 'integer', required: false, default: 100 },
    ];

    for (const attr of attributes) {
        try {
            if (attr.type === 'string') {
                await databases.createStringAttribute(
                    DB_ID, PROGRESS_COL_ID, attr.name, attr.size, attr.required
                );
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(
                    DB_ID, PROGRESS_COL_ID, attr.name, attr.required, undefined, undefined, attr.default
                );
            } else if (attr.type === 'datetime') {
                await databases.createDatetimeAttribute(
                    DB_ID, PROGRESS_COL_ID, attr.name, attr.required
                );
            }
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

    // Create indexes for faster queries
    try {
        await databases.createIndex(
            DB_ID, PROGRESS_COL_ID, 'userId_index', 'key', ['userId']
        );
        console.log('✅ Created userId index');
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️ userId index already exists');
        } else {
            console.error('❌ Error creating index:', error.message);
        }
    }

    try {
        await databases.createIndex(
            DB_ID, PROGRESS_COL_ID, 'user_video_unique', 'unique', ['userId', 'videoId']
        );
        console.log('✅ Created unique user+video index');
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️ Unique index already exists');
        } else {
            console.error('❌ Error creating unique index:', error.message);
        }
    }

    console.log('\n✨ Progress collection setup complete!');
    console.log('\nAdd this to your .env.local:');
    console.log(`NEXT_PUBLIC_APPWRITE_PROGRESS_COLLECTION_ID=${PROGRESS_COL_ID}`);
}

setupProgressCollection();
