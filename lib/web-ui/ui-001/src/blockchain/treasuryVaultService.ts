import { ethers } from 'ethers';
// import TreasuryVaultAbi from '../abi/TreasuryVault.json';
// import TreasuryVaultBytecode from '../bytecode/TreasuryVault.json';

export async function deployReserveVault(
  signer: ethers.Signer,
  resName: string,
  treasuryTokenAddress: string,
  tokenName: string,
  tokenSymbol: string
): Promise<{ treasuryTokenAddress: string; reserveVaultAddress: string }> {
  const factory = new ethers.ContractFactory(
    [], // TODO: Replace with TreasuryVaultAbi
    '0x...', // TODO: Replace with TreasuryVaultBytecode
    signer
  );
  const contract = await factory.deploy(resName, treasuryTokenAddress, tokenName, tokenSymbol);
  await contract.deployed();
  
  return {
    treasuryTokenAddress: treasuryTokenAddress,
    reserveVaultAddress: contract.address
  };
}

export function getTreasuryVaultContract(
  address: string,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) {
  return new ethers.Contract(address, [], signerOrProvider); // TODO: Replace [] with TreasuryVaultAbi
}
