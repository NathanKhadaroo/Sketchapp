const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Handler for loading prompts

ipcMain.handle('load-prompts', async (event) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'prompts.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to load prompts:', error);
        return []; // Return an empty array in case of error
    }
});


// Handler for loading gallery data
ipcMain.handle('load-gallery', async (event) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'metadata.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to load gallery:', error);
        return []; // Return an empty array in case of error
    }
});


ipcMain.handle('save-image', async (event, imageData, fileName, timeTaken, materialsUsed, promptOfTheDay) => {
    const buffer = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const imagesDirectory = path.join(__dirname, 'SavedImages');
    if (!fs.existsSync(imagesDirectory)) {
        fs.mkdirSync(imagesDirectory);
    }

    const filePath = path.join(imagesDirectory, fileName);

    try {
        fs.writeFileSync(filePath, buffer);
        updateMetadata(fileName, filePath, timeTaken, materialsUsed, promptOfTheDay);
        return { status: 'success', message: 'Image saved successfully', path: filePath };
    } catch (error) {
        console.error('Error saving image:', error);
        return { status: 'error', message: 'Failed to save image' };
    }
});

function updateMetadata(fileName, filePath, timeTaken, materialsUsed, promptOfTheDay) {
    const metadataPath = path.join(__dirname, 'metadata.json');
    let metadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, 'utf8')) : [];

    const newEntry = {
        date: new Date().toISOString().split('T')[0],
        filename: fileName,
        filepath: filePath,
        timeTaken: timeTaken,
        materials: materialsUsed,
        prompt: promptOfTheDay // Save the prompt as part of the metadata
    };

    metadata.push(newEntry);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('Metadata updated successfully');
}
