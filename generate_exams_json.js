const fs = require('fs');
const path = require('path');

const publicExamsDir = path.join(__dirname, 'public', 'exam-archives');

const subjectKeywords = {
  'ent': 'ENT',
  'medicine': 'Medicine',
  'ophtha': 'Ophthalmology',
  'optha': 'Ophthalmology',
  'surgery': 'Surgery',
  'pediatrics': 'Pediatrics',
  'paediatrics': 'Pediatrics',
  'pathology': 'Pathology',
  'microbiology': 'Microbiology',
  'anatomy': 'Anatomy',
  'anae': 'Anaesthesia',
  'anaesthesia': 'Anaesthesia',
  'biochem': 'Biochem',
  'derm': 'Dermatology',
  'derma': 'Dermatology',
  'fsm': 'FMT',
  'fmt': 'FMT',
  'obg': 'Obstetrics Gynaecology',
  'obstetrics': 'Obstetrics Gynaecology',
  'ortho': 'Orthopaedics',
  'pharma': 'Pharmacology',
  'physio': 'Physiology',
  'psm': 'PSM',
  'psychiatry': 'Psychiatry',
  'radiology': 'Radiology',
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
        if (categoryType === 'mock test') {
          subject = "Mock Tests";
        } else {
          // Infer subject from filename
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

const mockTests = getFiles(path.join(publicExamsDir, 'mock test'), 'mock test');
const subjectWiseTests = getFiles(path.join(publicExamsDir, 'subject wise test'), 'subject wise test');

const allFiles = [...mockTests, ...subjectWiseTests];

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

// Convert map to sorted array (Mock Tests first, then alphabetical)
const groupedData = Object.values(subjectsMap).sort((a, b) => {
  if (a.subject === "Mock Tests") return -1;
  if (b.subject === "Mock Tests") return 1;
  return a.subject.localeCompare(b.subject);
});

fs.writeFileSync(path.join(__dirname, 'src', 'lib', 'exams-data.json'), JSON.stringify(groupedData, null, 2));
console.log('Generated exams-data.json successfully!');
