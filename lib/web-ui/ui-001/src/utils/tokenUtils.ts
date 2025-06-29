import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { AddressZero } from '@ethersproject/constants';

const RESERVE_VAULT_ABI = [
  'function treasuryName() view returns (string memory)'
];

const ERC20_ABI = [
  'function isValidTreasuryToken() external view returns (address)'
];

export const getTreasuryName = async (tokenAddress: string, provider: Web3Provider): Promise<string> => {
  try {
    // Check if the token is a treasury token
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
    const treasuryAddress = await tokenContract.isValidTreasuryToken();
    
    if (treasuryAddress === AddressZero) {
      throw new Error('Not a treasury token');
    }

    // Get the treasury name
    const treasuryContract = new Contract(treasuryAddress, RESERVE_VAULT_ABI, provider);
    const treasuryName = await treasuryContract.treasuryName();
    
    return treasuryName;
  } catch (error) {
    console.error('Error getting treasury name:', error);
    return '';
  }
};
