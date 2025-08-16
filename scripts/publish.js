const fs = require('fs');
const path = require('path');

console.log('🚀 Live Database Playground - Publishing Helper');
console.log('==============================================');
console.log('');

// Check if package.json has correct publisher info
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

console.log('📋 Current Configuration:');
console.log(`   Publisher: ${packageJson.publisher}`);
console.log(`   Repository: ${packageJson.repository?.url || 'Not set'}`);
console.log(`   Version: ${packageJson.version}`);
console.log('');

// Check for required files
const requiredFiles = [
  'resources/logo.png',
  'resources/icon.png', 
  'resources/banner.png',
  'out/extension.js',
  'package.json'
];

console.log('📁 Required Files Check:');
let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});
console.log('');

if (!allFilesExist) {
  console.log('⚠️  Missing required files! Please:');
  console.log('   1. Generate PNG logos (see LOGO_GUIDE.md)');
  console.log('   2. Compile the extension: npm run compile');
  console.log('   3. Package the extension: npm run package');
  console.log('');
}

// Check publisher name
if (packageJson.publisher === 'your-actual-publisher-name') {
  console.log('⚠️  Publisher name needs to be updated!');
  console.log('   Please update package.json with your real publisher name');
  console.log('');
}

console.log('🚀 Publishing Steps:');
console.log('');
console.log('1. Update package.json with your real publisher name');
console.log('2. Create publisher account at: https://marketplace.visualstudio.com/');
console.log('3. Create Personal Access Token at: https://dev.azure.com/');
console.log('4. Login to VSCE: vsce login YOUR-PUBLISHER-NAME');
console.log('5. Publish extension: vsce publish');
console.log('');
console.log('📖 For detailed instructions, see: PUBLISHING_GUIDE.md');
console.log('🎨 For logo generation, see: LOGO_GUIDE.md');
console.log('');

if (allFilesExist && packageJson.publisher !== 'your-actual-publisher-name') {
  console.log('✅ Ready to publish!');
  console.log('   Run: vsce publish');
} else {
  console.log('❌ Not ready to publish yet.');
  console.log('   Please fix the issues above first.');
}
