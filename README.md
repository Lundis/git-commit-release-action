# git-commit-release-action

Create and maintain a pull-request description between two branches, such as production <- preproduction.

Commits between the two branches are listed in the pull-request description.

Only commits in the format "prefix: message" are listed. They are then grouped by prefix.

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
          base: production
          head: pre-production
          token: ${{ secrets.GITHUB_TOKEN }}
          assign: true
```

**input**

- `owner`: Default is current reopsitory's owner.
- `repo`: Default is current reopsitory's name.
- `base`: **required** Base branch of the release pull-request.
- `head`: **required** Head branch of the release pull-request. Typically, it is the same as a subscribed branch.
- `assign`: If true, assign each commit's author to the release pull-req
- `token`: **required** `GITHUB_TOKEN` for creating a pull request.

Note that this action uses the template file in your repository. So you need 'checkout' step if you specify template option.

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
