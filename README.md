# Package Updater for Bitbucket

This tool automatically updates a specified package in your project's `package.json`, creates a new branch with the changes, and opens a pull request in Bitbucket.

## Prerequisites

- Node.js (v14 or later recommended)
- npm (comes with Node.js)
- A Bitbucket account with access to the repository you want to update
- Git installed on your local machine

## Setup

1. Clone this repository:
git clone https://bitbucket.org/your-username/package-updater.git
cd package-updater

2. Install dependencies:
npm install

3. Set up your Bitbucket App Password:
- Log in to your Bitbucket account
- Go to Bitbucket settings → App passwords
- Click "Create app password"
- Give it a label (e.g., "Package Updater")
- Select the following permissions:
  - Repositories: Read, Write
  - Pull requests: Read, Write
- Copy the generated app password

4. Create a `.env` file in the root of the project with the following content:
BITBUCKET_USERNAME=your_bitbucket_username
BITBUCKET_AUTH_TOKEN=your_app_password
REPO_LOCAL_PATH=/path/to/your/local/repository

Replace `your_bitbucket_username`, `your_app_password`, and `/path/to/your/local/repository` with your actual values.

5. Update the `config.ts` file with your repository details:
```typescript
export default {
  // ... other config options
  repository: {
    owner: 'your_workspace_or_username',
    slug: 'your_repository_name',
    branch: 'main',
  },
};
```

## Usage

Run the script with the following command:
```
npm start -- --package <package-name> --newVersion <new-version>
```

You can also use short options:
```
npm start -- -p <package-name> -v <new-version>
```
