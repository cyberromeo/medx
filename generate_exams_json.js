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
        
        let subcategory = "Other";
        
        if (categoryType === 'mock test') {
          // Extract mock folder name
          const folderParts = file.substring(path.join(__dirname, 'public', 'exam-archives', 'mock test').length).split(path.sep);
          if (folderParts.length > 2) {
            subcategory = folderParts[1];
          } else {
            subcategory = "Uncategorized Mocks";
          }
        } else {
          // Infer subject from filename for Subject Wise Tests
          const lowerName = name.toLowerCase();
          for (const [keyword, mappedSubject] of Object.entries(subjectKeywords)) {
            if (lowerName.includes(keyword)) {
              subcategory = mappedSubject;
              break;
            }
          }
        }
        
        results.push({ name, path: relativePath, subcategory, categoryType });
      }
    }
  });
  return results;
}

const mockTests = getFiles(path.join(publicExamsDir, 'mock test'), 'mock test');
const subjectWiseTests = getFiles(path.join(publicExamsDir, 'subject wise test'), 'subject wise test');

const allFiles = [...mockTests, ...subjectWiseTests];

const nestedData = {
  "Subject Wise Tests": {},
  "Mock Tests": {}
};

allFiles.forEach(file => {
  const topCategory = file.categoryType === 'mock test' ? 'Mock Tests' : 'Subject Wise Tests';
  
  if (!nestedData[topCategory][file.subcategory]) {
    nestedData[topCategory][file.subcategory] = {
      name: file.subcategory,
      files: []
    };
  }
  
  nestedData[topCategory][file.subcategory].files.push(file);
});

// Format to final array
const finalData = [
  {
    category: "Subject Wise Tests",
    subcategories: Object.values(nestedData["Subject Wise Tests"]).sort((a, b) => a.name.localeCompare(b.name))
  },
  {
    category: "Mock Tests",
    subcategories: Object.values(nestedData["Mock Tests"]).sort((a, b) => a.name.localeCompare(b.name))
  }
];

fs.writeFileSync(path.join(__dirname, 'src', 'lib', 'exams-data.json'), JSON.stringify(finalData, null, 2));
console.log('Generated nested exams-data.json successfully!');
