# Development and deployment

- Use the existing checkout; do not create a worktree unless the user requests one.
- The user has instructed: "always deploy after developing," and clarified that this means committing and pushing to GitHub. After implementing and validating changes, commit and push to the connected production branch `main` without asking for confirmation again. Cloudflare automatically deploys when it detects that update.
- For application and deployment configuration changes, run the production build and browser checks with `npm test`. In this environment use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` to use the installed browser. Documentation-only changes need a diff/format check rather than a repeated application test run.
- `wrangler.jsonc` configures the production Worker `3rd-anniversary` and its static assets. The separate `wrangler.pages.jsonc` is only for optional Pages workflows. The normal publishing route is GitHub; direct Wrangler deployment is available when explicitly needed.
- Preserve remote changes and never force-push. After pushing, verify that remote `main` contains the new commit.
- Report the successful commit/push as the completed publishing step. Claim a live Cloudflare deployment only when independently verified, but do not require a Cloudflare login or live URL to finish the user's GitHub publishing workflow.
- Inspect credential names/presence only. Never print credentials, commit them, or ask for their values in chat.
- Application deployment is separate from publishing the development environment. Do not publish environment configuration unless the user requests it.
