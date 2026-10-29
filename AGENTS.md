# Development and deployment

- Use the existing checkout; do not create a worktree unless the user requests one.
- The user has instructed: "always deploy after developing." After implementing and validating changes, deploy to the existing Cloudflare Worker `3rd-anniversary` without asking for deployment confirmation again.
- Run the production build and browser checks with `npm test`. In this environment use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` to use the installed browser.
- `wrangler.jsonc` configures the production Worker and its static assets. `npm run deploy` builds and deploys it. The separate `wrangler.pages.jsonc` is only for optional Pages workflows.
- When direct Cloudflare credentials are unavailable, the connected GitHub production branch is `main`; a normal push can trigger Cloudflare's configured build. Preserve remote changes and never force-push.
- Check the deployment result. A successful build or Git push alone is not proof the live deployment succeeded. If access prevents deployment or verification, report the specific blocker.
- Inspect credential names/presence only. Never print credentials, commit them, or ask for their values in chat.
- Application deployment is separate from publishing the development environment. Do not publish environment configuration unless the user requests it.
