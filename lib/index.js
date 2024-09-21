import { Octokit } from "@octokit/action";

const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')

const base = process.env.INPUT_TARGET_BRANCH;
const head = process.env.GITHUB_REF_NAME;

console.log(`Starting creation of PR from ${head} to ${base}`);
console.log(`owner: ${owner}`);
console.log(`repo: ${repo}`);

const octokit = new Octokit();

let commitsResponse = await octokit.repos.compareCommits({
  owner,
  repo,
  base,
  head,
})

console.log(commitsResponse);
let commits = commitsResponse.data.commits;


console.log(`Found ${commits.length} commits`);

if (commits.length === 0) {
  process.exit(0);
}

const grouped = commits
    .map(c => c.commit.message)
    .flatMap(str => str.split('\n'))
    .filter(line => line.includes(':'))
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

const relevantPullRequests = (await octokit.pulls.list({
  owner,
  repo,
  base,
  head,
  state: "open",
})).data;

let releasePr;
if (relevantPullRequests.length === 0) {
  console.log("No existing PR found, will proceed to creation");
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
  console.log("Existing PR found, will proceed to update");
  // update
  const existing = relevantPullRequests[0];
  releasePr = (await octokit.pulls.update({
    owner,
    repo,
    pull_number: existing.number,
    body: body,

  })).data;
}

console.log("Assigning stakeholders to the PR");
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
