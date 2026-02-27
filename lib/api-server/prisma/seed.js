import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding contract addresses...');

  // Seed contract addresses
  const contractAddresses = [
    {
      name: 'EthereumUSDC(Mainnet)',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      network: 'mainnet',
      description: 'USDC token contract on Ethereum Mainnet'
    },
    {
      name: 'Ethereum Sepolia(USDC)',
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      network: 'sepolia',
      description: 'USDC token contract on Ethereum Sepolia testnet'
    }
  ];

  for (const contractAddress of contractAddresses) {
    await prisma.contractAddress.upsert({
      where: {
        name_network: {
          name: contractAddress.name,
          network: contractAddress.network
        }
      },
      update: {},
      create: contractAddress,
    });
  }

  console.log('Contract addresses seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
