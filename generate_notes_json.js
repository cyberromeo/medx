const fs = require('fs');
const path = require('path');

const publicNotesDir = path.join(__dirname, 'public', 'notes');

// Map of common keywords to Subject names to categorize miscellaneous files
const subjectKeywords = {
  'ent': 'ENT',
  'medicine': 'Medicine',
  'ophtha': 'Ophthalmology',
  'optha': 'Ophthalmology',
  'surgery': 'Surgery',
  'pediatrics': 'Pediatrics',
  'pathology': 'Pathology',
  'microbiology': 'Microbiology',
  'anatomy': 'Anatomy',
  'biochem': 'Biochem',
  'derm': 'Dermatology',
  'fsm': 'FSM',
  'obg': 'Obstetrics Gynaecology',
  'obstetrics': 'Obstetrics Gynaecology',
  'ortho': 'Orthopaedics',
  'pharma': 'Pharmacology',
  'physio': 'Physiology',
  'psm': 'PSM',
  'psychiatry': 'Psychiatry',
  'radiology': 'Radiology',
  'anaesthesia': 'Anaesthesia'
};

function getFiles(dir, categoryType) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file, categoryType));
    } else {
      if (file.toLowerCase().endsWith('.pdf')) {
        const relativePath = file.substring(path.join(__dirname, 'public').length).replace(/\\/g, '/');
        const name = path.basename(file, '.pdf');
        
        let subject = "Other";
        if (categoryType === 'workbooks') {
          const folderParts = file.substring(path.join(__dirname, 'public', 'notes', 'workbooks').length).split(path.sep);
          if (folderParts.length > 2) {
            subject = folderParts[1];
          }
        } else {
          // Try to infer subject from filename
          const lowerName = name.toLowerCase();
          for (const [keyword, mappedSubject] of Object.entries(subjectKeywords)) {
            if (lowerName.includes(keyword)) {
              subject = mappedSubject;
              break;
            }
          }
        }
        
        results.push({ name, path: relativePath, subject, categoryType });
      }
    }
  });
  return results;
}

const workbooks = getFiles(path.join(publicNotesDir, 'workbooks'), 'workbooks');
const miscellaneous = getFiles(path.join(publicNotesDir, 'miscellaneous'), 'miscellaneous');

const allFiles = [...workbooks, ...miscellaneous];

const subjectsMap = {};

allFiles.forEach(file => {
  if (!subjectsMap[file.subject]) {
    subjectsMap[file.subject] = {
      subject: file.subject,
      files: []
    };
  }
  subjectsMap[file.subject].files.push(file);
});

// Convert map to sorted array
const groupedData = Object.values(subjectsMap).sort((a, b) => a.subject.localeCompare(b.subject));

fs.writeFileSync(path.join(__dirname, 'src', 'lib', 'notes-data.json'), JSON.stringify(groupedData, null, 2));
console.log('Generated notes-data.json successfully!');
