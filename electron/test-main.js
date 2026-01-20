console.log('Starting test...');
console.log('Is Electron?:', process.versions.electron);

// Try different methods to access Electron
console.log('\n1. Checking global scope:');
console.log('global.electron:', typeof global.electron);
console.log('global.require:', typeof global.require);

console.log('\n2. Checking process:');
console.log('process.electronBinding:', typeof process.electronBinding);
console.log('process._linkedBinding:', typeof process._linkedBinding);

console.log('\n3. Standard require:');
try {
  // Delete require cache first  
  delete require.cache[require.resolve('electron')];
  const electron = require('electron');
  console.log('Electron type:', typeof electron);
  console.log('Electron value:', electron);
} catch (err) {
  console.error('Error:', err.message);
}

console.log('\n4. Trying to access from process:');
if (process.electronBinding) {
  try {
    const electron_common = process.electronBinding('electron_common_app');
    console.log('electron_common_app:', electron_common);
  } catch (err) {
    console.error('Error with electronBinding:', err.message);
  }
}
