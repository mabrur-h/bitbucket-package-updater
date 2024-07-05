import fs from 'fs/promises';
import path from 'path';
import { PackageDetails } from '../types';
import logger from '../utils/logger';

export class PackageService {
  constructor(private repoPath: string) {}

  async updatePackageJson(packageDetails: PackageDetails): Promise<string> {
    const packageJsonPath = path.join(this.repoPath, 'package.json');
    
    try {
      const data = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(data);
  
      logger.info(`Current version of ${packageDetails.name}: ${packageJson.dependencies[packageDetails.name] || packageJson.devDependencies[packageDetails.name]}`);
      
      if (packageJson.dependencies && packageJson.dependencies[packageDetails.name]) {
        packageJson.dependencies[packageDetails.name] = packageDetails.version;
      } else if (packageJson.devDependencies && packageJson.devDependencies[packageDetails.name]) {
        packageJson.devDependencies[packageDetails.name] = packageDetails.version;
      } else {
        throw new Error(`Package ${packageDetails.name} not found in package.json`);
      }
  
      const updatedContent = JSON.stringify(packageJson, null, 2);
      await fs.writeFile(packageJsonPath, updatedContent);
      
      logger.info(`Updated ${packageDetails.name} to version ${packageDetails.version} in package.json`);
      
      return updatedContent;
    } catch (error) {
      logger.error(`Failed to update package.json: ${(error as Error).message}`);
      throw error;
    }
  }
}