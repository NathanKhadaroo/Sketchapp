const { contextBridge, ipcRenderer,timeTaken, materialsUsed } = require('electron');

contextBridge.exposeInMainWorld('api', {
    saveImage: (imageData, fileName, timeTaken, materialsUsed, promptOfTheDay) => ipcRenderer.invoke('save-image', imageData, fileName, timeTaken, materialsUsed, promptOfTheDay),
    loadPrompts: () => ipcRenderer.invoke('load-prompts'),
    loadGallery: () => ipcRenderer.invoke('load-gallery'),
});
