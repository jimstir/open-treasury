import { ethers } from 'ethers';
// import TreasuryTokenAbi from '../abi/TreasuryToken.json';
// import TreasuryTokenBytecode from '../bytecode/TreasuryToken.json';

export async function deployTreasuryToken(
  signer: ethers.Signer,
  name: string,
  symbol: string
) {
  const factory = new ethers.ContractFactory(
    [], // TODO: Replace with TreasuryTokenAbi
    '0x...', // TODO: Replace with TreasuryTokenBytecode
    signer
  );
  const contract = await factory.deploy(name, symbol);
  await contract.deployed();
  return contract.address;
}

export function getTreasuryTokenContract(
  address: string,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) {
  return new ethers.Contract(address, [], signerOrProvider); // TODO: Replace [] with TreasuryTokenAbi
}
