const fs = require('fs');
const path = require('path');

const externalFiles = [
  { subject: 'Anatomy', path: 'https://portal.mist.org.in/content/notes/4b327334-90fc-482a-ad86-93db0a9129c7.pdf', name: 'Anatomy Written', categoryType: 'written' },
  { subject: 'Pathology', path: 'https://portal.mist.org.in/content/notes/78845fa1-2aee-4426-9f5a-70189a1aa70b.pdf', name: 'Pathology Written', categoryType: 'written' },
  { subject: 'PSM', path: 'https://portal.mist.org.in/content/notes/bca1fd4c-d9cd-4857-aaf4-485c2d94087b.pdf', name: 'PSM Written', categoryType: 'written' },
  { subject: 'FMT', path: 'https://portal.mist.org.in/content/notes/226ceab8-099c-4f70-b819-dc39a5504971.pdf', name: 'FMT Written', categoryType: 'written' },
  { subject: 'ENT', path: 'https://portal.mist.org.in/content/notes/012f026d-f3a7-4f8f-8336-17a487c53eb4.pdf', name: 'ENT Revision Written', categoryType: 'written' },
  { subject: 'Anaesthesia', path: 'https://portal.mist.org.in/content/notes/4332d366-e467-4e96-985a-171a90b0d238.pdf', name: 'Anaesthesia Written', categoryType: 'written' },
  { subject: 'Surgery', path: 'https://portal.mist.org.in/content/notes/658b2927-7de0-459e-ba49-ebe11efe5f7d.pdf', name: 'Surgery Written', categoryType: 'written' },
  { subject: 'Radiology', path: 'https://portal.mist.org.in/content/notes/fbfce1e3-8315-4cd4-8db8-4073671d9173.pdf', name: 'Radiology Written Part 1', categoryType: 'written' },
  { subject: 'Radiology', path: 'https://portal.mist.org.in/content/notes/0c6464ac-cc33-4dff-aee8-a9daa35bccb0.pdf', name: 'Radiology Written Part 2', categoryType: 'written' },
  { subject: 'Radiology', path: 'https://portal.mist.org.in/content/notes/78590aaa-86f7-4733-baf6-c3f158683ee2.pdf', name: 'Radiology Written Part 3', categoryType: 'written' },
  { subject: 'Radiology', path: 'https://portal.mist.org.in/content/notes/b7e387d9-df11-4283-879e-a373d2d348e0.pdf', name: 'Radiology Written Part 4', categoryType: 'written' },
  { subject: 'Ophthalmology', path: 'https://portal.mist.org.in/content/notes/460eeb45-d1bc-4d7f-a78f-2345bd0d42bf.pdf', name: 'Ophthalmology Written', categoryType: 'written' },
  { subject: 'Biochem', path: 'https://portal.mist.org.in/content/notes/c9553c0b-7604-4bc7-abe9-73b925d6456f.pdf', name: 'Biochem Written', categoryType: 'written' },
  { subject: 'Dermatology', path: 'https://portal.mist.org.in/content/notes/b1a0df3e-3902-49a1-b86b-9ee062c1bdcc.pdf', name: 'Dermatology Written', categoryType: 'written' },
  { subject: 'Microbiology', path: 'https://portal.mist.org.in/content/notes/abe2c846-e1b4-416c-bd23-945a1131809c.pdf', name: 'Microbiology Written', categoryType: 'written' },
  { subject: 'Radiology', path: 'https://portal.mist.org.in/content/notes/3321daae-4058-4abf-a854-aa4e1fda94a1.pdf', name: 'Radiology Revision Written', categoryType: 'written' }
];

const dataPath = path.join(__dirname, 'src', 'lib', 'notes-data.json');
let groupedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Convert groupedData to a map for easy merging
const subjectsMap = {};
groupedData.forEach(group => {
  subjectsMap[group.subject] = group;
});

// Append external files
externalFiles.forEach(file => {
  if (!subjectsMap[file.subject]) {
    subjectsMap[file.subject] = {
      subject: file.subject,
      files: []
    };
  }
  // Check if it already exists to avoid duplicates
  if (!subjectsMap[file.subject].files.find(f => f.path === file.path)) {
    subjectsMap[file.subject].files.push(file);
  }
});

// Convert back to sorted array
groupedData = Object.values(subjectsMap).sort((a, b) => a.subject.localeCompare(b.subject));

fs.writeFileSync(dataPath, JSON.stringify(groupedData, null, 2));
console.log('Successfully added external written notes to notes-data.json');
