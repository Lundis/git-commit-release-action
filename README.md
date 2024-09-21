# git-commit-release-action

Create and maintain a pull-request description between two branches, such as production <- preproduction.

Commits between the two branches are listed in the pull-request description.

Only commits in the format "prefix: message" are listed. They are then grouped by prefix.

Based on [SplashThat/git-pr-release-action](https://github.com/SplashThat/git-pr-release-action).

## Example

Given commit messages:

- prefix1: message1
- did some work that shouldn't be in release notes
- prefix1: message2
- whatever: lol


Corresponding output in the PR description:

#### prefix1:
  - message1
  - message2
#### whatever:
  - lol

## Usage

This Action subscribes to Push events.

```workflow
name: Create a release pull-request
on:
  push:
    branches:
      - pre-production
jobs:
  release_pull_request:
    runs-on: ubuntu-latest
    name: release_pull_request
    steps:
      - name: create-release-pr
        uses: Lundis/git-commit-release-action@v2
        with:
          target_branch: production
        env: 
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
