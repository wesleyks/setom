# Releasing `setom`

Releases are managed by Release Please and published to npm from the same GitHub Actions workflow.

## Process

1. Use a Conventional Commit-style pull request title, such as `fix: ...`, `feat: ...`, or `feat!: ...`, when squash-merging normal changes.
2. Merging into `master` causes Release Please to open or update a release pull request.
3. Review and merge that release pull request. Release Please creates the GitHub release and tag, then the workflow tests and publishes the matching package version to npm.

If GitHub marks a release pull request workflow as awaiting approval, a maintainer must approve it before its checks can run.

## npm trusted publishing

The npm package must retain this trusted-publisher configuration:

- Repository: `wesleyks/setom`
- Workflow: `release-please.yml`
- Allowed action: `npm publish`
- Environment: none

Publishing uses GitHub Actions OIDC. Do not add or rotate an npm token for this workflow.

## Verification and guardrails

- Confirm the `publish` job in the Release Please workflow succeeds.
- Confirm the registry version with `npm view setom version`.
- Keep GitHub Releases enabled. The workflow's publish job runs only after Release Please reports that it created a release.
- Do not manually publish or create release tags except for an intentional recovery procedure.
