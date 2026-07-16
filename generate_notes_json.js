const fs = require('fs');
const path = require('path');

const publicNotesDir = path.join(__dirname, 'public', 'notes');

function getFiles(dir, type) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file, type));
    } else {
      if (file.endsWith('.pdf')) {
        // file path relative to public
        const relativePath = file.substring(path.join(__dirname, 'public').length).replace(/\\/g, '/');
        // display name
        const name = path.basename(file, '.pdf');
        // subject folder if in workbook
        let subject = "Miscellaneous";
        if (type === 'workbooks') {
          // get the folder name right under workbooks
          const folderParts = file.substring(path.join(__dirname, 'public', 'notes', 'workbooks').length).split(path.sep);
          if (folderParts.length > 2) {
            subject = folderParts[1];
          }
        }
        results.push({ name, path: relativePath, subject, type });
      }
    }
  });
  return results;
}

const workbooks = getFiles(path.join(publicNotesDir, 'workbooks'), 'workbooks');
const miscellaneous = getFiles(path.join(publicNotesDir, 'miscellaneous'), 'miscellaneous');

const allData = {
  workbooks,
  miscellaneous
};

fs.writeFileSync(path.join(__dirname, 'src', 'lib', 'notes-data.json'), JSON.stringify(allData, null, 2));
console.log('Done!');
