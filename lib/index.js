const core = require('@actions/core');
const github = require('@actions/github');
import { Octokit } from "@octokit/action";
const {gitCommitRelease} = require('./git-commit-release');

(async function main() {
  const {
    owner = core.getInput('owner'),
    repo = core.getInput('repo'),
  } = github.context.repo;

  const base = core.getInput('base');
  const head = core.getInput('head');
  const assign = core.getInput('assign');

  core.info(`Starting creation of PR from ${head} to ${base}`);
  core.info(`owner: ${owner}`);
  core.info(`repo: ${repo}`);
  core.info(`assign: ${assign}`);

  const octokit = new Octokit();

  const releasePr = await gitCommitRelease({
    octokit, owner, repo,
    base, head,
    assign,
  });

  core.info('Returned PR:');
  for(let key in releasePr) {
    if (releasePr.hasOwnProperty(key)) {
      core.info(`${key}: ${releasePr[key]}`);
    }
  }

})().catch(e => {
  core.setFailed(e.message);
});
