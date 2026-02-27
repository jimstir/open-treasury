const fs = require('fs');
const path = require('path');
const { artifacts } = require('hardhat');

async function main() {
  // Create output directories if they don't exist
  const abiDir = path.join(__dirname, '../../web-ui/ui-001/src/abi');
  const bytecodeDir = path.join(__dirname, '../../web-ui/ui-001/src/bytecode');
  
  [abiDir, bytecodeDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // List of contracts to export
  const contracts = [
    'TreasuryToken',
    'TreasuryVault',
    'Lending'
  ];

  for (const contractName of contracts) {
    console.log(`Exporting ${contractName}...`);
    
    // Get contract artifacts
    const contractArtifact = await artifacts.readArtifact(contractName);
    
    // Export ABI
    fs.writeFileSync(
      path.join(abiDir, `${contractName}.json`),
      JSON.stringify(contractArtifact.abi, null, 2)
    );
    
    // Export bytecode
    fs.writeFileSync(
      path.join(bytecodeDir, `${contractName}.json`),
      JSON.stringify({ bytecode: contractArtifact.bytecode }, null, 2)
    );
    
    console.log(`✅ Exported ${contractName} ABI and bytecode`);
  }
  
  console.log('\n🎉 All artifacts exported successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
