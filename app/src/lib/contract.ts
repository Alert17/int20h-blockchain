import { ethers } from 'ethers';
import NeverHoldABI from '../contracts/NeverHold.json';
import { getMockContract } from './mockContract';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  // Використовуємо мок-контракт, якщо встановлено відповідний прапорець
  if (USE_MOCK) {
    console.log('[Contract INFO]: Using mock contract');
    return getMockContract();
  }

  if (!CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS is not set');
  }

  return new ethers.Contract(CONTRACT_ADDRESS, NeverHoldABI, signerOrProvider);
}
