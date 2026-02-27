/**
 * Stores and formats treasury details for display in the UI
 * @param {Object} params - The treasury parameters
 * @param {string} params.tokenAddress - The token contract address
 * @param {string} params.vaultAddress - The vault contract address
 * @param {Object} params.tokenDetails - Token details
 * @param {string} params.tokenDetails.name - Token name
 * @param {string} params.tokenDetails.symbol - Token symbol
 * @param {string} params.tokenDetails.totalSupply - Total token supply (in wei)
 * @param {string} params.tokenDetails.owner - Token owner address
 * @param {Object} params.vaultDetails - Vault details
 * @param {string} params.vaultDetails.name - Vault name
 * @param {string} params.vaultDetails.asset - Asset token address
 * @param {string} params.vaultDetails.shareTokenName - Share token name
 * @param {string} params.vaultDetails.shareTokenSymbol - Share token symbol
 * @param {Object} params.connection - Token-vault connection details
 * @param {string} params.connection.tokenBalance - Token balance in vault (in wei)
 * @param {string} params.connection.assetBalance - Vault's asset balance (in wei)
 * @returns {Object} Formatted treasury details for UI display
 */
export const formatTreasuryDetails = ({
  tokenAddress,
  vaultAddress,
  tokenDetails,
  vaultDetails,
  connection
}) => {
  // Helper to format token amounts (wei to token units)
  const formatTokenAmount = (weiAmount, decimals = 18) => {
    return (BigInt(weiAmount) / BigInt(10 ** decimals)).toString();
  };

  // Format token details
  const formattedToken = {
    address: tokenAddress,
    name: tokenDetails.name,
    symbol: tokenDetails.symbol,
    totalSupply: formatTokenAmount(tokenDetails.totalSupply),
    owner: tokenDetails.owner,
    decimals: 18, // Assuming standard 18 decimals
    explorerUrl: `https://etherscan.io/token/${tokenAddress}` // Can be made configurable
  };

  // Format vault details
  const formattedVault = {
    address: vaultAddress,
    name: vaultDetails.name,
    asset: vaultDetails.asset,
    shareToken: {
      name: vaultDetails.shareTokenName,
      symbol: vaultDetails.shareTokenSymbol
    },
    explorerUrl: `https://etherscan.io/address/${vaultAddress}` // Can be made configurable
  };

  // Format connection details
  const formattedConnection = {
    tokenBalance: formatTokenAmount(connection.tokenBalance),
    assetBalance: formatTokenAmount(connection.assetBalance),
    isInitialized: connection.tokenBalance > 0
  };

  // Return complete treasury details
  return {
    id: `${tokenAddress}-${vaultAddress}`.toLowerCase(),
    token: formattedToken,
    vault: formattedVault,
    connection: formattedConnection,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Gets treasury details from blockchain
 * @param {Object} provider - Web3 provider
 * @param {string} tokenAddress - Token contract address
 * @param {string} vaultAddress - Vault contract address
 * @returns {Promise<Object>} Formatted treasury details
 */
export const getTreasuryDetails = async (provider, tokenAddress, vaultAddress) => {
  // Get contract instances using the provider
  const tokenContract = new ethers.Contract(tokenAddress, [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function totalSupply() view returns (uint256)',
    'function owner() view returns (address)',
    'function balanceOf(address) view returns (uint256)'
  ], provider);

  const vaultContract = new ethers.Contract(vaultAddress, [
    'function name() view returns (string)',
    'function asset() view returns (address)',
    'function symbol() view returns (string)',
    'function totalAssets() view returns (uint256)'
  ], provider);

  try {
    // Fetch all data in parallel
    const [
      tokenName,
      tokenSymbol,
      totalSupply,
      tokenOwner,
      vaultName,
      assetAddress,
      shareTokenSymbol,
      tokenBalance,
      assetBalance
    ] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.totalSupply(),
      tokenContract.owner(),
      vaultContract.name(),
      vaultContract.asset(),
      vaultContract.symbol(),
      tokenContract.balanceOf(vaultAddress),
      vaultContract.totalAssets()
    ]);

    // Format and return the data
    return formatTreasuryDetails({
      tokenAddress,
      vaultAddress,
      tokenDetails: {
        name: tokenName,
        symbol: tokenSymbol,
        totalSupply: totalSupply.toString(),
        owner: tokenOwner
      },
      vaultDetails: {
        name: vaultName,
        asset: assetAddress,
        shareTokenName: vaultName, // Assuming share token name is same as vault name
        shareTokenSymbol: shareTokenSymbol
      },
      connection: {
        tokenBalance: tokenBalance.toString(),
        assetBalance: assetBalance.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching treasury details:', error);
    throw new Error('Failed to fetch treasury details from blockchain');
  }
};

// Example usage:
/*
const provider = new ethers.providers.Web3Provider(window.ethereum);
const treasuryDetails = await getTreasuryDetails(
  provider,
  '0xTokenAddress',
  '0xVaultAddress'
);
console.log(treasuryDetails);
*/

export default {
  formatTreasuryDetails,
  getTreasuryDetails
};
