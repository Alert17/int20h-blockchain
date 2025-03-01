import { ethers } from 'ethers';
import DecentralizedAchievementsABI from '../contracts/DecentralizedAchievements.json';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  if (!CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS is not set');
  }

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    DecentralizedAchievementsABI,
    signerOrProvider
  );
}
