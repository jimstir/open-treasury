import { ethers } from 'ethers';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Deploys a new Treasury with associated token
 * @param {Object} params - Deployment parameters
 * @param {string} params.treasuryName - Name of the treasury
 * @param {string} params.tokenName - Name of the ERC20 token
 * @param {string} params.tokenSymbol - Symbol of the ERC20 token
 * @param {string} params.initialSupply - Initial supply of tokens (as a decimal string)
 * @param {string} [network='localhost'] - Network to deploy to
 * @returns {Promise<Object>} Deployment results
 */
export async function deployTreasury({
  treasuryName,
  tokenName,
  tokenSymbol,
  initialSupply,
  network = 'localhost'
}) {
  try {
    // Path to the deployment script
    const scriptPath = path.resolve(
      __dirname,
      '../../../contracts/scripts/deploy-treasury.js'
    );

    // Execute the deployment script
    const cmd = `npx hardhat run ${scriptPath} --network ${network} "${treasuryName}" "${tokenName}" "${tokenSymbol}" "${initialSupply}"`;
    
    console.log('Executing deployment command:', cmd);
    const output = execSync(cmd, { encoding: 'utf-8' });
    
    // Parse the output to get contract addresses
    const tokenMatch = output.match(/TreasuryToken deployed to: (0x[a-fA-F0-9]+)/);
    const vaultMatch = output.match(/TreasuryVault deployed to: (0x[a-fA-F0-9]+)/);
    
    if (!tokenMatch || !vaultMatch) {
      throw new Error('Failed to parse deployment output');
    }

    return {
      success: true,
      tokenAddress: tokenMatch[1],
      vaultAddress: vaultMatch[1],
      output
    };
  } catch (error) {
    console.error('Deployment failed:', error.message);
    return {
      success: false,
      error: error.message,
      output: error.output?.toString() || error.message
    };
  }
}

export default deployTreasury;
