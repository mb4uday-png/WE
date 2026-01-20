# Estimate Manager

A desktop application for creating and managing work estimates with local database storage and Excel import/export capabilities.

## Features

- 📋 Create, edit, and delete estimates
- 💾 Local SQLite database for persistent storage
- 📊 Excel import/export functionality
- 🖥️ Cross-platform desktop application (Windows, macOS, Linux)
- ⚡ Fast and responsive UI built with React
- 🎨 Clean and modern interface

## Tech Stack

- **Framework**: Electron
- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Database**: SQLite (better-sqlite3)
- **Excel Processing**: ExcelJS
- **Styling**: CSS Modules

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run dev
```

This will start:
- Vite development server on http://localhost:5173
- Electron application in development mode

### Building

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

The built application will be available in the `release` folder.

## Usage

### Creating an Estimate

1. Click the "New Estimate" button
2. Fill in the client name and project name
3. Add estimate items with description, quantity, and unit price
4. The total amount is calculated automatically
5. Click "Save Estimate" to save to the database

### Editing an Estimate

1. Click the edit (✏️) button on any estimate card
2. Modify the details as needed
3. Click "Update Estimate" to save changes

### Deleting an Estimate

1. Click the delete (🗑️) button on any estimate card
2. Confirm the deletion

### Exporting to Excel

1. Click the "Export to Excel" button in the header
2. Choose a location to save the file
3. All estimates will be exported to the Excel file

### Importing from Excel

1. Click the "Import from Excel" button in the header
2. Select an Excel file to import
3. Estimates will be imported and saved to the database

## Database

The application uses SQLite for local data storage. The database file is stored in your user data directory:

- **Windows**: `%APPDATA%/estimate-manager/estimates.db`
- **macOS**: `~/Library/Application Support/estimate-manager/estimates.db`
- **Linux**: `~/.config/estimate-manager/estimates.db`

## License

MIT
