
const axios = require('axios');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');

const GITLAB_BASE_URL = ''; //https://git.com/
const GROUP_ID = ''; // Use the group ID or name
const ACCESS_TOKEN = ''; // Personal Access Token

const git = simpleGit();
const baseDir = ''; //D:\\aaa\\aaa\\aa\\aaa

// Ensure the output directory exists
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Fetch all projects in the group and its subgroups
async function getAllProjects(groupId, page = 1) {
  const response = await axios.get(`${GITLAB_BASE_URL}/api/v4/groups/${groupId}/projects`, {
    params: { 
      include_subgroups: true, 
      page,
      per_page: 100 
    },
    headers: { 
      'Private-Token': ACCESS_TOKEN 
    }
  });
  return response.data;
}

async function cloneRepo(repoUrl, groupName, repoName) {
  const groupDir = path.join(baseDir, groupName);
  const repoDir = path.join(groupDir, repoName);

  if (!fs.existsSync(groupDir)) {
    fs.mkdirSync(groupDir, { recursive: true });
  }

  if (!fs.existsSync(repoDir)) {
    fs.mkdirSync(repoDir, { recursive: true });
  }

  try {
    await git.clone(repoUrl, repoDir);
    console.log(`Successfully cloned ${repoName} into ${groupName}`);
  } catch (error) {
    console.error(`Failed to clone ${repoName}:`, error.message);
  }
}

// Main function
async function main() {
  let page = 1;
  let projects;

  do {
    projects = await getAllProjects(GROUP_ID, page);
    for (const project of projects) {
      const repoUrl = project.http_url_to_repo;
      const repoName = project.name; // Repository name
      const groupName = project.namespace.name; // Group name

      await cloneRepo(repoUrl, groupName, repoName);
    }
    page++;
  } while (projects.length > 0);
}

main().catch(console.error);