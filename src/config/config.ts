import dotenv from 'dotenv';

dotenv.config();

export default {
  bitbucket: {
    apiBaseUrl: 'https://api.bitbucket.org/2.0',
    authToken: process.env.BITBUCKET_AUTH_TOKEN || '',
    username: process.env.BITBUCKET_USERNAME || ''
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  repository: {
    owner: 'your_workspace_or_username',
    slug: 'your_repository_name',
    branch: 'main',
  }
};