import axios, { AxiosRequestConfig } from 'axios';
import { RepositoryDetails, PullRequestDetails } from '../types';
import config from '../config/config';
import logger from '../utils/logger';

export class BitbucketService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.bitbucket.apiBaseUrl;
  }

  private getAxiosConfig(): AxiosRequestConfig {
    return {
      auth: {
        username: config.bitbucket.username,
        password: config.bitbucket.authToken
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }

  private handleError(error: unknown, action: string): void {
    if (axios.isAxiosError(error)) {
      logger.error(`Failed to ${action}: ${error.message}`);
      if (error.response) {
        logger.error(`Response status: ${error.response.status}`);
        logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
    } else {
      logger.error(`Unexpected error during ${action}: ${error}`);
    }
  }

  async createPullRequest(repoDetails: RepositoryDetails, prDetails: PullRequestDetails): Promise<string> {
    const url = `${this.baseUrl}/repositories/${repoDetails.owner}/${repoDetails.slug}/pullrequests`;
    
    logger.info(`Attempting to create PR at URL: ${url}`);

    try {
      const response = await axios.post(url, {
        title: prDetails.title,
        description: prDetails.description,
        source: { branch: { name: prDetails.sourceBranch } },
        destination: { branch: { name: prDetails.destinationBranch } }
      }, this.getAxiosConfig());

      const prUrl = response.data.links.html.href;
      logger.info(`Pull request created: ${prUrl}`);
      return prUrl;
    } catch (error) {
      this.handleError(error, 'create pull request');
      throw error;
    }
  }

  async createBranch(repoDetails: RepositoryDetails, branchName: string, sourceBranch: string): Promise<void> {
    const url = `${this.baseUrl}/repositories/${repoDetails.owner}/${repoDetails.slug}/refs/branches`;
    logger.info(`Attempting to create branch: ${branchName}`);

    try {
      await axios.post(url, {
        name: branchName,
        target: { hash: sourceBranch }
      }, this.getAxiosConfig());

      logger.info(`Branch created: ${branchName}`);
    } catch (error) {
      this.handleError(error, 'create branch');
      throw error;
    }
  }

  async commitChanges(repoDetails: RepositoryDetails, branchName: string, message: string, changes: any): Promise<void> {
    const url = `${this.baseUrl}/repositories/${repoDetails.owner}/${repoDetails.slug}/src`;
    logger.info(`Attempting to commit changes to branch: ${branchName}`);
    logger.info(`Commit message: ${message}`);
    logger.info(`Changes to be committed: ${JSON.stringify(changes)}`);

    try {
      await axios.post(url, changes, {
        ...this.getAxiosConfig(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        params: { branch: branchName, message: message }
      });

      logger.info(`Changes committed to branch: ${branchName}`);
    } catch (error) {
      this.handleError(error, 'commit changes');
      throw error;
    }
  }

  async compareBranches(repoDetails: RepositoryDetails, sourceBranch: string, destinationBranch: string): Promise<boolean> {
    const url = `${this.baseUrl}/repositories/${repoDetails.owner}/${repoDetails.slug}/diff/${sourceBranch}..${destinationBranch}`;
    logger.info(`Comparing branches: ${sourceBranch} and ${destinationBranch}`);

    try {
      const response = await axios.get(url, this.getAxiosConfig());
      const hasDifferences = response.data.trim().length > 0;
      logger.info(`Branches have differences: ${hasDifferences}`);
      return hasDifferences;
    } catch (error) {
      this.handleError(error, 'compare branches');
      throw error;
    }
  }
}
