const fs = require('fs');
const path = require('path');
const directoryPath = __dirname;

// Function to search for a comment in a file
function searchCommentInFile(file, comment) {
    try {
        const fileContent = fs.readFileSync(file, 'utf8');

        const lines = fileContent.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes(comment)) {
                return i + 1;
            }
        }
    } catch (error) {
        console.error(`Error reading file ${file}:`, error);
        return -1;
    }
}

// Function to adjust tour steps and write to file
async function reLinkTours(jsonData, filePath) {
    var fileChangeRequired = false;
    try {
        for (var i = 0; i < jsonData.steps.length; i++) {
            const stepAnchorId = jsonData.steps[i].anchorId;
            const file = jsonData.steps[i].file;
            const newLine = await searchCommentInFile("../" + file, stepAnchorId);

            if (jsonData.steps[i].line != newLine) {
                fileChangeRequired = true;
            }
            if (newLine !== -1 && fileChangeRequired === true) {
                jsonData.steps[i].line = newLine;
            }
        }
        // Write updated JSON data to file
        if (fileChangeRequired) {
            const jsonString = JSON.stringify(jsonData, null, 2);
            fs.writeFile(filePath, jsonString, (err) => {
                if (err) {
                    console.error(`Error writing to file ${filePath}:`, err);
                    return;
                }
                console.log(`Updated file ${filePath} with modified tour steps.`);
            });
        }
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
    }
}

// Function to parse the .tours file content into JSON and modify tour steps
function parseAndCheck(filePath) {
    if (path.basename(filePath) === '2---how-a-message-is-sent.tour') {  // Right now just for this particular file
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading file ${filePath}:`, err);
                return;
            }
            try {
                const jsonData = JSON.parse(data);
                reLinkTours(jsonData, filePath); // Adjust the tour steps
            } catch (error) {
                console.error(`Error parsing JSON in file ${filePath}:`, error);
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

    tourFiles.forEach(file => {
        const filePath = path.join(directoryPath, file);
        parseAndCheck(filePath);//Convert .tour files in JS objects and check for changes
    });
});
