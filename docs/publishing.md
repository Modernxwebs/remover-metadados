# Preparing a public repository

## Publish a clean snapshot

Historical author names and emails are accepted for this project. A fresh history
is optional for that reason; an existing repository can be used after committing
the reviewed fixes, checking its history for credentials, and reviewing any
GitHub-hosted logs and artifacts. The steps below describe the fresh-snapshot
option.

Use a new repository with a fresh history when historical author identities,
deleted files, logs or old settings should not be made public. Making an existing
private repository public also publishes its reachable history and may expose
existing Actions logs and artifacts. Deleting a file in the latest commit does
not remove its historical contents.

From the reviewed working tree:

```sh
npm run release:public -- --output /absolute/path/to/new-release-directory
```

The destination must not exist. The exporter copies only the documented public
files, rejects symlinks and sensitive filenames, omits `.git`, local environment
files, editor settings, audit artifacts, and generated build output, and writes
a SHA-256 manifest. It does not publish anything or create a remote repository.
Review the exported tree, scan it with a current secret scanner, and run a clean
install, build and checks in that copy before creating its first commit.

In the exported directory, set the explicitly approved public identity locally:

```sh
git init -b main
git config user.name "Modern X Webs"
git config user.email "dev@modernxwebs.com"
git add .
git commit -m "Initial public source release"
```

Do not copy the original `.git` directory, add an old private remote, push old
branches or tags, use `git push --mirror`, or upload local `.env` files. Keep the
original private repository private. Choose a separate public repository name
and add that new remote only when you are ready to publish.

## GitHub settings

- Limit repository administration and write access to the maintainer.
- Enable secret scanning and push protection where available. Review the
  Security tab after publication; automated coverage is not universal.
- Protect the default branch against force pushes and deletion, and require
  the validation workflow to pass where your GitHub plan supports these rules.
- Set default Actions permissions to read-only. Do not enable workflows from
  untrusted pull requests with access to credentials.
- Disable Issues and Discussions if you do not want public support queues.
  `CONTRIBUTING.md` states that external code contributions are not accepted.
- Use the approved organization identity and `dev@modernxwebs.com` for future
  commits. Check commit metadata before pushing.

## Deployment configuration

The source defaults to the official Remover Metadados URLs and branding. A fork
must replace reserved artwork/editorial content, maintainer contacts, canonical
URLs, sitemap/robots URLs, schema identities and domain-specific hosting rules
before publishing under its own identity. Search the source and `public/` for
`remover-metadados.com` and `modernxwebs.com`; changing `astro.config.mjs` alone
does not rebrand every page.

No credentials are needed for a local build. Analytics is disabled in a fresh
copy. Copy `.env.example` to an ignored `.env.local` only if needed.
For the official deployment, configure these values in the hosting provider's
build environment:

| Variable | Purpose |
| --- | --- |
| `PUBLIC_GA_MEASUREMENT_ID` | Optional public GA4 measurement identifier |
| `PUBLIC_GA_HOSTNAME` | Exact production hostname permitted to load GA4 |

No CI workflow automatically deploys or submits URLs. The sitemap remains
available for normal search-engine discovery.

If advertising is added later, review third-party script behavior, update the
privacy disclosures and hosting CSP, and keep ads separate from file controls.
The MIT license permits commercial use; it does not establish ad-network
eligibility or legal compliance.

## Release verification

Run the README checks, inspect the binary-asset metadata, review license notices
and the exported manifest, and scan both the release directory and its new Git
history. Confirm that the deployed HTML, assets, response headers and privacy
description match that release. The source being public does not by itself prove
that a hosted deployment was built from it.
