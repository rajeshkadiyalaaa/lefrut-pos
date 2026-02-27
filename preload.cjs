// Preload script (CommonJS) to work with ESM main process
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  print: async (options) => ipcRenderer.invoke('print', options)
});
