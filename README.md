# Obsidian Sample Plugin

This is a sample plugin for Obsidian (https://obsidian.md).

This project uses Typescript to provide type checking and documentation.
The repo depends on the latest plugin API (obsidian.d.ts) in Typescript Definition format, which contains TSDoc comments describing what it does.

**Note:** The Obsidian API is still in early alpha and is subject to change at any time!

This sample plugin demonstrates some of the basic functionality the plugin API can do.

- Adds a ribbon icon, which shows a Notice when clicked.
- Adds a command "Open Sample Modal" which opens a Modal.
- Adds a plugin setting tab to the settings page.
- Registers a global click event and output 'click' to the console.
- Registers a global interval which logs 'setInterval' to the console.

## First time developing plugins?

Quick starting guide for new plugin devs:

- Check if [someone already developed a plugin for what you want](https://obsidian.md/plugins)! There might be an existing plugin similar enough that you can partner up with.
- Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it).
- Clone your repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/your-plugin-name` folder.
- Install NodeJS, then run `pnpm install` in the command line under your repo folder.
- Run `pnpm dev` to compile your plugin from `main.ts` to `dist/main.js`.
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `dist/main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
- For updates to the Obsidian API run `pnpm update` in the command line under your repo folder.

## Creating a plugin from this template

If this repository is configured as a GitHub template repository, create a new repository and clone it with GitHub CLI:

```bash
gh repo create my-plugin --public --template 22-2/obsidian-my-template --clone
cd my-plugin
pnpm install
```

For a local copy without GitHub repository creation, use `giget`:

```bash
pnpm dlx giget@latest gh:22-2/obsidian-my-template my-plugin --install
cd my-plugin
pnpm setup -- --name "My Plugin" --id my-plugin
```

The setup command keeps the standard Obsidian file names and initializes their
project-specific contents:

- `manifest.json`: plugin ID and display name
- `package.json`: npm package name (`obsidian-<plugin-id>`)
- `src/main.ts` and `src/settings.ts`: plugin class, settings type, and settings tab identifiers

The plugin ID is derived from the display name unless `--id` is supplied. A
separate Hygen generator package can wrap this flow later if a single
interactive command is needed; keeping `_templates` in this repository would
otherwise copy generator internals into every plugin.

## Releasing new releases

`release-it` updates the package and Obsidian manifest versions, builds the plugin, and uploads the build output to a GitHub Release:

1. Make sure the working tree is clean and the `origin` remote points to GitHub.
2. Run `pnpm release` and choose the next semantic version.
3. Confirm the commit, tag, and GitHub Release prompts.

The release tag intentionally has no `v` prefix because Obsidian looks for the GitHub Release whose tag matches the version in `manifest.json`. The uploaded assets are `dist/main.js`, `dist/manifest.json`, and `dist/styles.css`.

`pnpm release` leaves `versions.json` unchanged. When a release raises `minAppVersion` and must preserve a download path for older Obsidian versions, use `pnpm release:with-versions` instead.
The opt-in command updates only the affected version entry in `versions.json`, preserving the file's existing indentation and line endings.

`@release-it/conventional-changelog` recommends the release bump from Conventional Commits and updates [`CHANGELOG.md`](CHANGELOG.md). Use commit prefixes such as `feat:`, `fix:`, or `docs:` so the generated release notes stay organized.

Set `GITHUB_TOKEN` for an automated GitHub API release. Without it, release-it prepares a GitHub release URL for the final browser-assisted step. For CI, use `pnpm release --ci`.

## CI checks

Pull requests and pushes to `main` run the following checks in GitHub Actions:

- `vp check`
- `vp test`
- `vp build`
- `pnpm verify-build`

The workflow fetches the complete Git history so Conventional Changelog can calculate the recommended release bump. The tracked `.npmrc` intentionally contains no registry token; configure private-package authentication in the user-level npm configuration or GitHub Actions secrets.

## Settings API sample

`src/settings.ts` demonstrates Obsidian's declarative settings API and keeps the side-effectful logger update in a `render` callback.

- [Migrate to declarative settings](https://docs.obsidian.md/plugins/guides/migrate-declarative-settings)
- [Settings](https://docs.obsidian.md/Plugins/User+interface/Settings)

## Adding your plugin to the community plugin list

- Check https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

## How to use

- Clone this repo.
- Make sure your Node.js version is 22.21.x or 24+ (`node --version`).
- `pnpm install` to install dependencies.
- `pnpm dev` to start compilation in watch mode.

## Manually installing the plugin

- After `pnpm build`, copy `dist/main.js`, `dist/styles.css`, and `dist/manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Code quality

- Run `pnpm lint` for Oxlint, including the [Obsidian plugin guidelines](https://github.com/obsidianmd/eslint-plugin).
- Run `pnpm check-types` for formatting, linting, and TypeScript checks together.
- Run `pnpm test` for template release-invariant tests.
- Run `pnpm verify-build` after `pnpm build` to validate release assets.

## Funding URL

You can include funding URLs where people who use your plugin can financially support it.

The simple way is to set the `fundingUrl` field to your link in your `manifest.json` file:

```json
{
	"fundingUrl": "https://buymeacoffee.com"
}
```

If you have multiple URLs, you can also do:

```json
{
	"fundingUrl": {
		"Buy Me a Coffee": "https://buymeacoffee.com",
		"GitHub Sponsor": "https://github.com/sponsors",
		"Patreon": "https://www.patreon.com/"
	}
}
```

## API Documentation

See https://github.com/obsidianmd/obsidian-api
