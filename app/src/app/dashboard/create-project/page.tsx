'use client';

import { useState } from 'react';
import { useEthersSigner } from '../../../hooks/useEthersSigner';
import { getContract } from '../../../lib/contract';
import { ZeroAddress } from 'ethers';

export default function CreateProject() {
  const signer = useEthersSigner();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [rewardToken, setRewardToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signer) {
      setError('Please connect your wallet.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const contract = getContract(signer);
      const createProject = contract.getFunction('createProject');
      console.log(createProject);
      console.log(signer);

      const tx = await createProject(
        title,
        description,
        reward,
        rewardToken || ZeroAddress
      );
      await tx.wait();
      alert('Project created successfully!');
    } catch (err: any) {
      console.error(err);
      setError('Transaction failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold">Create a New Project</h1>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter project title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Reward (in smallest unit)
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            placeholder="E.g. 1000000000000000000 for 1 token unit"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Reward Token Address
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={rewardToken}
            onChange={(e) => setRewardToken(e.target.value)}
            placeholder="0x..."
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
}
