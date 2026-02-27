import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { AddressZero } from '@ethersproject/constants';

const RESERVE_VAULT_ABI = [
  'function treasuryName() view returns (string memory)',
  'function treasuryToken() view returns (address)'
];

const ERC20_ABI = [
  'function TREASURY_TOKEN_IDENTIFIER() external view returns (string memory)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function name() external view returns (string memory)',
  'function symbol() external view returns (string memory)',
  'function owner() external view returns (address)'
];

export const getTokenSupply = async (tokenAddress: string, provider: Web3Provider): Promise<string> => {
  try {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
    const supply = await tokenContract.totalSupply();
    return supply.toString();
  } catch (error) {
    console.error('Error fetching token supply:', error);
    return '0';
  }
};

export const getTokenBalance = async (tokenAddress: string, account: string, provider: Web3Provider): Promise<string> => {
  try {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await tokenContract.balanceOf(account);
    return balance.toString();
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return '0';
  }
};

export const isTreasuryToken = async (tokenAddress: string, provider: Web3Provider): Promise<boolean> => {
  try {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
    const identifier = await tokenContract.TREASURY_TOKEN_IDENTIFIER();
    return identifier === 'OPEN_TREASURY_TOKEN_V1';
  } catch (error) {
    // If the function doesn't exist or fails, it's not a treasury token
    return false;
  }
};

export const getTreasuryName = async (contractAddress: string, provider: Web3Provider): Promise<string> => {
  try {
    // Try to call treasuryName() on the contract (works for both tokens and vaults)
    const contract = new Contract(contractAddress, RESERVE_VAULT_ABI, provider);
    const treasuryName = await contract.treasuryName();
    return treasuryName;
  } catch (error) {
    console.error('Error getting treasury name:', error);
    return '';
  }
};

export const getTreasuryTokenAddress = async (vaultAddress: string, provider: Web3Provider): Promise<string> => {
  try {
    const vaultContract = new Contract(vaultAddress, RESERVE_VAULT_ABI, provider);
    const tokenAddress = await vaultContract.treasuryToken();
    return tokenAddress;
  } catch (error) {
    console.error('Error getting treasury token address:', error);
    return '';
  }
};

export const getTokenDetails = async (tokenAddress: string, provider: Web3Provider) => {
  try {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
    const [name, symbol, totalSupply, owner] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.totalSupply(),
      tokenContract.owner()
    ]);
    
    return {
      name,
      symbol,
      totalSupply: totalSupply.toString(),
      owner
    };
  } catch (error) {
    console.error('Error getting token details:', error);
    return {
      name: '',
      symbol: '',
      totalSupply: '0',
      owner: ''
    };
  }
};
