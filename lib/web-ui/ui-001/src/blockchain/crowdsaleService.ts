import { ethers } from 'ethers';
// import CrowdsaleAbi from '../abi/Crowdsale.json';
// import CrowdsaleBytecode from '../bytecode/Crowdsale.json';

export async function deployCrowdsale(
  signer: ethers.Signer,
  treasuryTokenAddress: string,
  treasuryVaultAddress: string,
  ratio: string | number
) {
  const factory = new ethers.ContractFactory(
    [], // TODO: Replace with CrowdsaleAbi
    '0x...', // TODO: Replace with CrowdsaleBytecode
    signer
  );
  const contract = await factory.deploy(
    treasuryTokenAddress,
    treasuryVaultAddress,
    ethers.utils.parseEther(ratio.toString())
  );
  await contract.deployed();
  return contract.address;
}

export function getCrowdsaleContract(
  address: string,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) {
  return new ethers.Contract(address, [], signerOrProvider); // TODO: Replace [] with CrowdsaleAbi
}
