'use client';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useEthersSigner } from '../../hooks/useEthersSigner';
import { getProjectsByCreator } from '../../lib/projects';

export default function DashboardPage() {
  const signer = useEthersSigner();
  const { address } = useAccount();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const projects = await getProjectsByCreator(signer!, address!);

        console.log(projects);
      } catch (error) {
        console.error(error);
      }
    }

    if (signer && address) {
      fetchProjects();
    }
  }, [signer, address]);

  return <div className="flex min-h-screen"></div>;
}
