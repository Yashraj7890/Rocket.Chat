const fs = require('fs');
const path = require('path');
const directoryPath = __dirname;

function computeNewLine(anchorId,file){
const fileContent = fs.readFileSync("../"+file, 'utf8');

  const lines = fileContent.split('\n');
  lines.forEach((line, index) => {
    if (line.includes(anchorId)) {
      return index+1;
    }
  });
}

function reLinkTours(jsonData){
for(var i=0;i<jsonData.steps.length;i++){
    const stepAnchorId=jsonData.steps[i].anchorId;// Unique id of every step
    const line=jsonData.steps[i].line;// Current line number of the step
    const file=jsonData.steps[i].file;// File in which the anchorId/step is present
    let newLine=computeNewLine(stepAnchorId,file);// Find the new line number of the step by searching for the new line number of the anchorId
    jsonData.steps[i].line=newLine;// Modify the object
}
}

// Function to parse the .tours file content into JSON
function parseAndcheck(filePath) {
    if (path.basename(filePath) === '2---how-a-message-is-sent.tour') {  // Right now just for this particular file
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${filePath}:`, err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        reLinkTours(jsonData); // Adjust the tour steps
        const jsonString = JSON.stringify(jsonData, null, 2);
        fs.writeFile(filePath, jsonString, (err) => {
            if (err) {
              console.log(err);
              return;
            }
          });
      } catch (error) {
        console.error(error);
      }
    });
}
  }

// Read the contents of the .tours directory
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // Filter out files with .tour extension
  const tourFiles = files.filter(file => path.extname(file) === '.tour');
  // Parse each .tour file into JSON and check if changes needed
  tourFiles.forEach(file => {
    const filePath = path.join(directoryPath, file);
    parseAndcheck(filePath);
  });
});
