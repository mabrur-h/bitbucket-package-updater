import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { PackageService } from './services/package.service';
import { BitbucketService } from './services/bitbucket.service';
import { PackageDetails, RepositoryDetails, PullRequestDetails } from './types';
import logger from './utils/logger';
import config from './config/config';

async function main() {
  try {
    // TODO: Make it work with multiple packages at once
    const argv = await yargs(hideBin(process.argv))
    .option('package', {
      alias: 'p',
      description: 'Package name to update',
      type: 'string',
      demandOption: true
    })
    .option('newVersion', {
      alias: 'v',
      description: 'Version to update to',
      type: 'string',
      demandOption: true
    })
    .help()
    .alias('help', 'h')
    .argv;

    const packageDetails: PackageDetails = {
      name: argv.package as string,
      version: argv.newVersion as string,
    };

    const repoDetails: RepositoryDetails = {
      owner: config.repository.owner,
      slug: config.repository.slug,
      branch: config.repository.branch,
    };

    const repoPath = '/path/to/your/local/codes';

    const packageService = new PackageService(repoPath);
    const updatedPackageJson = await packageService.updatePackageJson(packageDetails);

    const bitbucketService = new BitbucketService();
    
    const newBranchName = `update-${packageDetails.name}-to-${packageDetails.version}`;
    await bitbucketService.createBranch(repoDetails, newBranchName, repoDetails.branch);z

    await bitbucketService.commitChanges(repoDetails, newBranchName, `Update ${packageDetails.name} to ${packageDetails.version}`, {
      'package.json': updatedPackageJson
    });

    const hasDifferences = await bitbucketService.compareBranches(repoDetails, newBranchName, repoDetails.branch);

    if (hasDifferences) {
      const prDetails: PullRequestDetails = {
        title: `Update ${packageDetails.name} to version ${packageDetails.version}`,
        description: `This PR updates ${packageDetails.name} to version ${packageDetails.version}`,
        sourceBranch: newBranchName,
        destinationBranch: repoDetails.branch,
      };

      const prUrl = await bitbucketService.createPullRequest(repoDetails, prDetails);
      logger.info(`Pull request created successfully: ${prUrl}`);
    } else {
      logger.info('No differences found between branches. Skipping pull request creation.');
    }
  } catch (error) {
    logger.error(`Error in main process: ${(error as Error).message}`);
  }
}

main();