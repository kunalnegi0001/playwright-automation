import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const removeGithub = args.has('--remove-github');

const githubDir = path.join(rootDir, '.github');
const azurePipelineFile = path.join(rootDir, 'azure-pipelines.yml');

const log = (message) => {
  console.log(`[prepare-ado] ${message}`);
};

const fail = (message) => {
  console.error(`[prepare-ado] ${message}`);
  process.exitCode = 1;
};

const removeDirectory = (targetPath) => {
  if (!fs.existsSync(targetPath)) {
    log(`${path.relative(rootDir, targetPath) || targetPath} not found. Skipping.`);
    return;
  }

  if (dryRun) {
    log(`Dry run: would remove ${path.relative(rootDir, targetPath)}`);
    return;
  }

  fs.rmSync(targetPath, { recursive: true, force: true });
  log(`Removed ${path.relative(rootDir, targetPath)}`);
};

log('Preparing repository for Azure DevOps usage.');

if (!fs.existsSync(azurePipelineFile)) {
  fail('Missing azure-pipelines.yml. Add the Azure DevOps pipeline file before migration.');
} else {
  log('Found azure-pipelines.yml.');
}

if (removeGithub) {
  removeDirectory(githubDir);
} else if (fs.existsSync(githubDir)) {
  log('Retained .github/. Use --remove-github when preparing a client clone.');
}

log('Next steps:');
log('1. Import or push this repository to Azure Repos.');
log('2. Create a pipeline that points to azure-pipelines.yml.');
log('3. Configure Variable Groups or Azure Key Vault-backed secrets.');
log('4. Update branch filters, environment values, and service connections for the client project.');
