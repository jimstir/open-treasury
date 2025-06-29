import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Simple transition component to replace Headless UI Transition
const FadeInOut = ({ show, children }: { show: boolean; children: React.ReactNode }) => {
  return (
    <div
      className={`transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
    >
      {children}
    </div>
  );
};
import { createJoinPoolProposal } from '../services/joinPoolService';
import { ethers } from 'ethers';

interface Pool {
  id: string;
  name: string;
  address: string;
}

interface Token {
  id: string;
  name: string;
  address: string;
  decimals?: number;
}

interface JoinTreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  treasuryAddress: string;
  treasuryName: string;
}

const JoinTreasuryModal: React.FC<JoinTreasuryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  treasuryAddress,
  treasuryName,
}) => {
  const [selectedPool, setSelectedPool] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock data for pools and tokens
  const [pools] = useState<Pool[]>([
    { id: '1', name: 'Aave V3', address: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2' },
    { id: '2', name: 'Compound V3', address: '0xc3d688B66703497DAA19211EEdff47f25384cdc3' },
  ]);

  const [tokens] = useState<Token[]>([
    { id: '1', name: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
    { id: '2', name: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
    { id: '3', name: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPool || !selectedToken || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      if (!window.ethereum) {
        throw new Error('Please install MetaMask to continue');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const selectedTokenObj = tokens.find(t => t.address === selectedToken);
      
      if (!selectedTokenObj) {
        throw new Error('Selected token not found');
      }

      // Use BigNumber to handle the token amount with correct decimals
      const amountInWei = ethers.utils.parseUnits(
        amount,
        selectedTokenObj.decimals || 18
      );

      await createJoinPoolProposal(
        treasuryAddress || '', // treasuryVaultAddress
        selectedPool,           // poolAddress
        selectedToken,          // tokenAddress
        amount,                 // amount (as string)
        description,            // description
        signer                  // signer
      );

      setSuccess('Proposal created successfully!');
      onSuccess();
      // Close modal after a short delay
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Error creating join pool proposal:', error);
      setError(error instanceof Error ? error.message : 'Failed to create proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={onClose}>
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <FadeInOut show={isOpen}>
          <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </FadeInOut>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <FadeInOut show={isOpen}>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <div className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    <h3>Create Join Pool Proposal</h3>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Create a proposal to join a liquidity pool with {treasuryName} treasury funds.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {/* Pool Selection */}
                    <div>
                      <label htmlFor="pool" className="block text-sm font-medium text-gray-700">
                        Select Pool *
                      </label>
                      <select
                        id="pool"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedPool}
                        onChange={(e) => setSelectedPool(e.target.value)}
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Select a pool</option>
                        {pools.map((pool) => (
                          <option key={pool.id} value={pool.address}>
                            {pool.name} ({pool.address.slice(0, 6)}...{pool.address.slice(-4)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Token Selection */}
                    <div>
                      <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                        Select Token *
                      </label>
                      <select
                        id="token"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Select a token</option>
                        {tokens.map((token) => (
                          <option key={token.id} value={token.address}>
                            {token.name} ({token.address.slice(0, 6)}...{token.address.slice(-4)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Amount *
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          id="amount"
                          className="block w-full pr-12 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.000000000000000001"
                          required
                          disabled={isSubmitting}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">
                            {tokens.find(t => t.address === selectedToken)?.name || 'TOK'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Describe the purpose of this proposal"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Error and Success Messages */}
                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{error}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {success && (
                      <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-green-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Success</h3>
                            <div className="mt-2 text-sm text-green-700">
                              <p>{success}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Creating Proposal...' : 'Create Proposal'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onClose}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
        </FadeInOut>
      </div>
    </Dialog>
  );
};

export default JoinTreasuryModal;
