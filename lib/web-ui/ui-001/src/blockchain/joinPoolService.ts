import { ethers } from 'ethers';
// import JoinPoolAbi from '../abi/JoinPool.json';
// import JoinPoolBytecode from '../bytecode/JoinPool.json';

export async function deployJoinPool(
  signer: ethers.Signer,
  ...constructorArgs: any[]
) {
  const factory = new ethers.ContractFactory(
    [], // TODO: Replace with JoinPoolAbi
    '0x...', // TODO: Replace with JoinPoolBytecode
    signer
  );
  const contract = await factory.deploy(...constructorArgs);
  await contract.deployed();
  return contract.address;
}

export function getJoinPoolContract(
  address: string,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) {
  return new ethers.Contract(address, [], signerOrProvider); // TODO: Replace [] with JoinPoolAbi
}
