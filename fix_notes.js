const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'lib', 'notes-data.json');
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const map = {};

data.forEach(group => {
  let subjectName = group.subject;
  
  if (subjectName === 'FSM' || subjectName === 'fsm') subjectName = 'FMT';
  if (subjectName === 'Dermtology' || subjectName === 'Derma' || subjectName === 'derma') subjectName = 'Dermatology';
  if (subjectName === 'Optha' || subjectName === 'Ophtha') subjectName = 'Ophthalmology';
  
  if (!map[subjectName]) {
    map[subjectName] = { subject: subjectName, files: [] };
  }
  
  group.files.forEach(file => {
    file.subject = subjectName;
    // prevent exact path duplicates just in case
    if (!map[subjectName].files.find(f => f.path === file.path)) {
      map[subjectName].files.push(file);
    }
  });
});

const mergedData = Object.values(map).sort((a, b) => a.subject.localeCompare(b.subject));
fs.writeFileSync(dataPath, JSON.stringify(mergedData, null, 2));
console.log('Fixed subjects in notes-data.json successfully');
