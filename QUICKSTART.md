# Quick Start Guide - Estimate Manager

## Overview

This is a desktop application for managing work estimates. It stores data locally in an SQLite database and supports Excel import/export.

## First Time Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run in Development Mode**
   ```bash
   npm run dev
   ```   
   This will:
   - Start the Vite development server on http://localhost:5173
   - Launch the Electron desktop application

## Using the Application

### Creating a New Estimate

1. Click "New Estimate" button
2. Enter client name and project name
3. Add items:
   - Description: What the item is for
   - Quantity: How many units
   - Unit Price: Price per unit
   - Amount is calculated automatically (Quantity × Unit Price)
4. Click "Add Item" to add more line items
5. Review the total amount
6. Click "Save Estimate" to save to database

### Editing an Estimate

1. Click the ✏️ edit button on any estimate card
2. Modify the fields as needed
3. Click "Update Estimate" to save changes

### Deleting an Estimate

1. Click the 🗑️ delete button on any estimate card
2. Confirm the deletion

### Exporting to Excel

1. Click "Export to Excel" button in the header
2. Choose where to save the file
3. The file will contain all estimates with all line items

### Importing from Excel

1. Click "Import from Excel" button in the header
2. Select an Excel file to import
3. The format should match the export format
4. Estimates will be imported and saved to the database

## Building for Production

Build the application for your platform:

```bash
# Build for current platform
npm run package

# Build for Windows
npm run package:win

# Build for macOS
npm run package:mac

# Build for Linux
npm run package:linux
```

The installer will be created in the `release` folder.

## Data Location

Your database is stored at:
- **Windows**: `%APPDATA%/estimate-manager/estimates.db`
- **macOS**: `~/Library/Application Support/estimate-manager/estimates.db`
- **Linux**: `~/.config/estimate-manager/estimates.db`

## Troubleshooting

### Application won't start

- Make sure Node.js version 20.19+ or 22.12+ is installed
- Try deleting `node_modules` and running `npm install` again
- Check that no other application is using port 5173

### Database errors

- The database is created automatically on first run
- If you see database errors, try closing all instances of the app
- As a last resort, you can delete the database file (you'll lose all data)

### Excel import not working

- Make sure the Excel file has the correct format
- The first row should be headers
- Required columns: ID, Client Name, Project Name, Description, Quantity, Unit Price, Amount

## Features

- ✅ Create, edit, and delete estimates
- ✅ Local SQLite database (no internet required)
- ✅ Excel import and export
- ✅ Automatic total calculation
- ✅ Modern, clean interface
- ✅ Cross-platform (Windows, macOS, Linux)

## Tech Stack

- Electron (Desktop framework)
- React + TypeScript (UI)
- Vite (Build tool)
- Zustand (State management)
- SQLite (Database)
- ExcelJS (Excel processing)
