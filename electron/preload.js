let electronModule;
try {
  // Try using module.require
  electronModule = module.require ? module.require('electron') : require('electron');
  console.log('Electron required successfully in preload');
} catch (err) {
  console.error('Error requiring electron in preload:', err);
  electronModule = require('electron');
}

if (typeof electronModule === 'string') {
  console.error('Electron APIs not available in preload');
  return;
}

const { contextBridge, ipcRenderer } = electronModule;

console.log('Preload script loaded');

contextBridge.exposeInMainWorld('electronAPI', {
  getEstimates: () => ipcRenderer.invoke('get-estimates'),
  saveEstimate: (estimate) => ipcRenderer.invoke('save-estimate', estimate),
  updateEstimate: (estimate) => ipcRenderer.invoke('update-estimate', estimate),
  deleteEstimate: (id) => ipcRenderer.invoke('delete-estimate', id),
  exportToExcel: (estimates) => ipcRenderer.invoke('export-to-excel', estimates),
  importFromExcel: () => ipcRenderer.invoke('import-from-excel'),
});

console.log('electronAPI exposed');
