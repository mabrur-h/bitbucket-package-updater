export interface RepositoryDetails {
  owner: string;
  slug: string;
  branch: string;
}

export interface PackageDetails {
  name: string;
  version: string;
}

export interface PullRequestDetails {
  title: string;
  description: string;
  sourceBranch: string;
  destinationBranch: string;
}
