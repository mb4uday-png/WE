let electronModule;
try {
  electronModule = require('electron');
  console.log('Electron module loaded:', typeof electronModule, electronModule ? 'has app:' + !!electronModule.app : 'null');
} catch (err) {
  console.error('Error requiring electron:', err);
  process.exit(1);
}

if (typeof electronModule !== 'object' || !electronModule.app) {
  console.error('Electron module not available or invalid, type:', typeof electronModule, 'value:', electronModule);
  process.exit(1);
}

const { app, BrowserWindow, ipcMain, dialog } = electronModule;
const path = require('path');
const Database = require('better-sqlite3');
const ExcelJS = require('exceljs');

// Enable hot reload in development
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reload')(path.join(__dirname, '../src'));
  } catch (err) {
    console.log('electron-reload not available, hot reload disabled');
  }
}

let db;
let mainWindow = null;

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'estimates.db');
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS estimates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientName TEXT NOT NULL,
      projectName TEXT NOT NULL,
      totalAmount REAL NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS estimate_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estimateId INTEGER NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      unitPrice REAL NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (estimateId) REFERENCES estimates(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_estimate_items_estimateId 
    ON estimate_items(estimateId);
  `);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In development, load the built file to ensure preload works
  // For hot reload, rebuild after changes
  mainWindow.loadFile(path.join(__dirname, '../dist-react/index.html'));
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.close();
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-estimates', () => {
  const estimates = db.prepare('SELECT * FROM estimates ORDER BY updatedAt DESC').all();
  
  return estimates.map((estimate) => {
    const items = db.prepare('SELECT * FROM estimate_items WHERE estimateId = ?').all(estimate.id);
    return {
      ...estimate,
      items,
    };
  });
});

ipcMain.handle('save-estimate', (_event, estimate) => {
  const now = new Date().toISOString();
  
  const insert = db.prepare(`
    INSERT INTO estimates (clientName, projectName, totalAmount, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = insert.run(
    estimate.clientName,
    estimate.projectName,
    estimate.totalAmount,
    now,
    now
  );

  const estimateId = result.lastInsertRowid;

  const insertItem = db.prepare(`
    INSERT INTO estimate_items (estimateId, description, quantity, unitPrice, amount)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const item of estimate.items) {
    insertItem.run(estimateId, item.description, item.quantity, item.unitPrice, item.amount);
  }

  return estimateId;
});

ipcMain.handle('update-estimate', (_event, estimate) => {
  const now = new Date().toISOString();
  
  const update = db.prepare(`
    UPDATE estimates 
    SET clientName = ?, projectName = ?, totalAmount = ?, updatedAt = ?
    WHERE id = ?
  `);
  
  update.run(
    estimate.clientName,
    estimate.projectName,
    estimate.totalAmount,
    now,
    estimate.id
  );

  db.prepare('DELETE FROM estimate_items WHERE estimateId = ?').run(estimate.id);

  const insertItem = db.prepare(`
    INSERT INTO estimate_items (estimateId, description, quantity, unitPrice, amount)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const item of estimate.items) {
    insertItem.run(estimate.id, item.description, item.quantity, item.unitPrice, item.amount);
  }
});

ipcMain.handle('delete-estimate', (_event, id) => {
  db.prepare('DELETE FROM estimates WHERE id = ?').run(id);
});

ipcMain.handle('export-to-excel', async (_event, estimates) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Estimates to Excel',
    defaultPath: `estimates-${new Date().toISOString().split('T')[0]}.xlsx`,
    filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
  });

  if (!filePath) return '';

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Estimates');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Client Name', key: 'clientName', width: 25 },
    { header: 'Project Name', key: 'projectName', width: 25 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Unit Price', key: 'unitPrice', width: 15 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Total Amount', key: 'totalAmount', width: 15 },
    { header: 'Created At', key: 'createdAt', width: 20 },
    { header: 'Updated At', key: 'updatedAt', width: 20 },
  ];

  for (const estimate of estimates) {
    for (let i = 0; i < estimate.items.length; i++) {
      const item = estimate.items[i];
      worksheet.addRow({
        id: i === 0 ? estimate.id : '',
        clientName: i === 0 ? estimate.clientName : '',
        projectName: i === 0 ? estimate.projectName : '',
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        totalAmount: i === 0 ? estimate.totalAmount : '',
        createdAt: i === 0 ? new Date(estimate.createdAt).toLocaleString() : '',
        updatedAt: i === 0 ? new Date(estimate.updatedAt).toLocaleString() : '',
      });
    }
  }

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  await workbook.xlsx.writeFile(filePath);
  return filePath;
});

ipcMain.handle('import-from-excel', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Estimates from Excel',
    filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }],
    properties: ['openFile'],
  });

  if (!filePaths || filePaths.length === 0) return [];

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePaths[0]);
  const worksheet = workbook.worksheets[0];

  const estimates = [];
  let currentEstimate = null;

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const cells = row.values;
    const id = cells[1];
    const clientName = cells[2];
    const projectName = cells[3];
    const description = cells[4];
    const quantity = cells[5];
    const unitPrice = cells[6];
    const amount = cells[7];

    if (id && clientName && projectName) {
      if (currentEstimate) {
        estimates.push(currentEstimate);
      }
      currentEstimate = {
        clientName,
        projectName,
        items: [],
        totalAmount: 0,
      };
    }

    if (currentEstimate && description) {
      currentEstimate.items.push({
        description,
        quantity: Number(quantity) || 0,
        unitPrice: Number(unitPrice) || 0,
        amount: Number(amount) || 0,
      });
    }
  });

  if (currentEstimate) {
    estimates.push(currentEstimate);
  }

  estimates.forEach((estimate) => {
    estimate.totalAmount = estimate.items.reduce((sum, item) => sum + item.amount, 0);
  });

  return estimates;
});
