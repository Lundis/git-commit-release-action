const core = require("@actions/core");
const detect = require("./detect");

export async function gitCommitRelease({
  octokit,
  owner,
  repo,
  base,
  head,
  assign
}) {

  const commits = await detect({ octokit, owner, repo, base, head });
  const grouped = commits
      .map(c => c.commit.message)
      .flatMap(str => str.split('\n'))
      .filter(line => line.contains(':'))
      .reduce((acc, item) => {
        // Split each string into prefix and content
        const [prefix, content] = item.split(':').map(str => str.trim());

        // If the prefix doesn't exist in the accumulator, initialize it as an array
        if (!acc[prefix]) {
          acc[prefix] = [];
        }

        // Add the content to the corresponding prefix group
        acc[prefix].push(content);

        return acc;
      }, {});
  let body = '';

  // Iterate over the grouped object
  for (const [prefix, contents] of Object.entries(grouped)) {
    body += `#### ${prefix}:\n`;
    contents.forEach(content => {
      body += `- ${content}\n`;
    });
  }

  if (body === '') {
    core.info("No commits found between base and head");
    return;
  }

  const relevantPullRequests = (await octokit.pulls.list({
    owner,
    repo,
    base,
    head,
    state: "open",
  })).data;

  let releasePr;
  if (relevantPullRequests.length === 0) {
    core.info("No preexisting PR found, will proceed to creation");
    const { data } = await octokit.repos.getLatestRelease({
      owner: owner, // Owner of the repo
      repo: repo,   // Repo name
    });

    const releaseNumber = parseInt(data.tag_name.substring(1))+1;
    const prTitle = "Release v"+releaseNumber;
    // create
    releasePr = (await octokit.pulls.create({
      owner,
      repo,
      base,
      head,
      title: prTitle,
      body: body,
    })).data;
  } else {
    core.info("Preexisting PR found, will proceed to update");
    // update
    const existing = relevantPullRequests[0];
    releasePr = (await octokit.pulls.update({
      owner,
      repo,
      pull_number: existing.number,
      body: body,

    })).data;
  }

  if (assign) {
    core.info("Assigning stakeholders to the PR");
    const assignees = Array.from(new Set(commits
      .filter((c) => c.author.type === "User")
      .map((c) => c.author.login)
    ));

    await octokit.issues.addAssignees({
      owner,
      repo,
      issue_number: releasePr.number,
      assignees,
    });
  }

  core.info("Returning the release object");
  return releasePr;
}
