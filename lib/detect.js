const core = require("@actions/core");
const octokitWithThrottling = require("./octokitWithThrottling");

module.exports = async function detect({
  octokit,
  token,
  owner,
  repo,
  base,
  head,
}) {
  if (!octokit) {
    octokit = octokitWithThrottling.get({
      auth: token,
    });
  }

  const compareRes = await octokit.repos.compareCommits({
    owner,
    repo,
    base,
    head,
  });
  core.info(
    `Found ${compareRes.data.commits.length} commits between head and base`
  );

  let merge_commits = compareRes.data.commits;

  if (merge_commits.length === 0) {
    core.info("Returning empty array");
    return [];
  }

  merge_commits = merge_commits.map((c) => {
      return {
        title: c.commit.message,
        number: c.sha.substring(0, 7),
        assignees: [c.author],
        user: c.author
      }
    })

  return Object.values(
      merge_commits.reduce((accum, commit) => {
      // uniq.
      accum[commit.number] = commit;
      return accum;
    }, {})
  );
};
