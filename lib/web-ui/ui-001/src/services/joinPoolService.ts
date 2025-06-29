import { ethers } from 'ethers';
import JoinPoolABI from '../abis/JoinPool.json';
import TreasuryVaultABI from '../abis/TreasuryVault.json';

declare let window: any;

export const deployJoinPool = async (treasuryVaultAddress: string, tokenAddress: string, signer: ethers.Signer) => {
  try {
    // Deploy the JoinPool contract
    const JoinPoolFactory = new ethers.ContractFactory(
      JoinPoolABI.abi,
      JoinPoolABI.bytecode,
      signer
    );

    const joinPool = await JoinPoolFactory.deploy(tokenAddress, treasuryVaultAddress);
    await joinPool.deployed();
    
    return {
      address: joinPool.address,
      txHash: joinPool.deployTransaction.hash
    };
  } catch (error) {
    console.error('Error deploying JoinPool:', error);
    throw error;
  }
};

export const createJoinPoolProposal = async (
  treasuryVaultAddress: string,
  poolAddress: string,
  tokenAddress: string,
  amount: string,
  description: string,
  signer: ethers.Signer
) => {
  try {
    const treasuryVault = new ethers.Contract(
      treasuryVaultAddress,
      TreasuryVaultABI.abi,
      signer
    );

    // Check if JoinPool is already deployed
    let joinPoolAddress = await treasuryVault.getPolicy('JoinPool');
    
    if (joinPoolAddress === ethers.constants.AddressZero) {
      // Deploy JoinPool if not deployed
      const { address } = await deployJoinPool(treasuryVaultAddress, tokenAddress, signer);
      joinPoolAddress = address;
      
      // Set the JoinPool policy in TreasuryVault
      const tx = await treasuryVault.setPolicy('JoinPool', joinPoolAddress);
      await tx.wait();
    }

    // Create the proposal
    const joinPool = new ethers.Contract(
      joinPoolAddress,
      JoinPoolABI.abi,
      signer
    );

    // Convert amount to wei
    const amountWei = ethers.utils.parseEther(amount);
    
    // Create the proposal
    const tx = await joinPool.fundsReq(
      poolAddress,
      Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
      amountWei,
      tokenAddress
    );
    
    const receipt = await tx.wait();
    
    // Extract proposal ID from event
    const event = receipt.events?.find((e: any) => e.event === 'newFunds');
    const proposalId = event?.args?.proposalId?.toNumber();
    
    // Save to database (you'll need to implement this part)
    await saveProposalToDatabase({
      proposalId,
      type: 'JoinPool',
      poolAddress,
      tokenAddress,
      amount,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      treasuryVaultAddress
    });
    
    return proposalId;
    
  } catch (error) {
    console.error('Error creating JoinPool proposal:', error);
    throw error;
  }
};

// Helper function to save proposal to your database
const saveProposalToDatabase = async (proposalData: any) => {
  // Implement your database saving logic here
  // This is a placeholder - replace with your actual API call
  try {
    const response = await fetch('/api/proposals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proposalData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save proposal');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving proposal to database:', error);
    throw error;
  }
};
