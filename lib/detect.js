const core = require("@actions/core");

module.exports = async function detect({
  octokit,
  owner,
  repo,
  base,
  head,
}) {
  const mergeCommits = await octokit.repos.compareCommits({
    owner,
    repo,
    base,
    head,
  }).data.commits;
  core.info(
    `Found ${mergeCommits.length} commits between head and base`
  );

  if (mergeCommits.length === 0) {
    return [];
  }

  return mergeCommits;
};
