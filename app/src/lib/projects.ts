import { ethers } from 'ethers';
import { getContract } from './contract';
import { BigNumberish } from 'ethers';

export async function getProjectsByCreator(
  provider: ethers.Signer | ethers.Provider,
  creatorAddress: string
) {
  const contract = getContract(provider);

  const filter = contract.filters.ProjectCreated(null, creatorAddress);

  const logs = await contract.queryFilter(filter);

  const events = logs.map((log) => contract.interface.parseLog(log));
  console.log(logs, events);
  const projectIds = events.map((event) => event?.args?.projectId.toNumber());

  return projectIds;
}

export async function getProjectsDetails(
  provider: ethers.Signer | ethers.Provider,
  creatorAddress?: string
) {
  const contract = getContract(provider);

  const projectCounter: BigNumberish = await contract.projects();

  const totalProjects = Number(projectCounter);
  const projects: Array<any> = [];

  for (let id = 1; id <= totalProjects; id++) {
    const project = await contract.projects(id);

    if (
      creatorAddress &&
      project.creator.toLowerCase() !== creatorAddress.toLowerCase()
    ) {
      continue;
    }

    const filter = contract.filters.SubmissionCreated(id, null);
    const events = await contract.queryFilter(filter);
    const submissionCount = events.length;

    projects.push({
      ...project,
      submissionCount,
    });
  }

  return projects;
}
