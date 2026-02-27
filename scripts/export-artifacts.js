const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create output directories
const abiDir = path.join(__dirname, 'lib/web-ui/ui-001/src/abi');
const bytecodeDir = path.join(__dirname, 'lib/web-ui/ui-001/src/bytecode');

[abiDir, bytecodeDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// List of contracts to export
const contracts = [
  'TreasuryToken',
  'TreasuryVault'
];

// Compile contracts
console.log('Compiling contracts...');
try {
  execSync('npx hardhat compile', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to compile contracts');
  process.exit(1);
}

// Copy artifacts
contracts.forEach(contractName => {
  console.log(`Exporting ${contractName}...`);
  
  try {
    // Read artifact
    const artifactPath = path.join(
      __dirname,
      'lib/contracts/artifacts/contracts',
      `${contractName}.sol`,
      `${contractName}.json`
    );
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Save ABI
    fs.writeFileSync(
      path.join(abiDir, `${contractName}.json`),
      JSON.stringify(artifact.abi, null, 2)
    );
    
    // Save bytecode
    fs.writeFileSync(
      path.join(bytecodeDir, `${contractName}.json`),
      JSON.stringify({ bytecode: artifact.bytecode }, null, 2)
    );
    
    console.log(`✅ Exported ${contractName}`);
  } catch (error) {
    console.error(`❌ Failed to export ${contractName}:`, error.message);
  }
});

console.log('\n🎉 All artifacts exported successfully!');
