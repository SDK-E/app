---
name: deploy-to-vercel
description: Deploy applications and websites to Vercel. Use when the user requests deployment actions like "deploy my app", "deploy and give me the link", "push this live", or "create a preview deployment".
metadata:
  author: vercel
  version: "3.0.0"
---

# Deploy to Vercel

Deploy any project to Vercel. **Always deploy as preview** (not production) unless the user explicitly asks for production.

The goal is to get the user into the best long-term setup: their project linked to Vercel with git-push deploys. Every method below tries to move the user closer to that state.

## Step 1: Gather Project State

Run all four checks before deciding which method to use:

```bash
git remote get-url origin 2>/dev/null
cat .vercel/project.json 2>/dev/null || cat .vercel/repo.json 2>/dev/null
vercel whoami 2>/dev/null
vercel teams list --format json 2>/dev/null
```

### Team selection

If the user belongs to multiple teams, present all available team slugs as a bulleted list and ask which one to deploy to. Once the user picks a team, proceed immediately — do not ask for additional confirmation. Pass the team slug via `--scope` on all subsequent CLI commands.

If the project is already linked (`.vercel/project.json` or `.vercel/repo.json` exists), the `orgId` in those files determines the team — no need to ask again. If there is only one team (or just a personal account), skip the prompt and use it directly.

**About the `.vercel/` directory:** A linked project has either `.vercel/project.json` (from `vercel link`; contains `projectId` and `orgId`) or `.vercel/repo.json` (from `vercel link --repo`; contains `orgId`, `remoteName`, and a `projects` array). Either file means the project is linked.

**Do NOT** use `vercel project inspect`, `vercel ls`, or `vercel link` to detect state in an unlinked directory — they will interactively prompt or silently link as a side-effect. Only `vercel whoami` is safe to run anywhere.

## Step 2: Choose a Deploy Method

### Linked + has git remote → Git Push

This is the ideal state. The project is linked and has git integration.

1. **Ask the user before pushing.** Never push without explicit approval.
2. Commit and push:
   ```bash
   git add .
   git commit -m "deploy: <description of changes>"
   git push
   ```
3. Retrieve the preview URL:
   ```bash
   sleep 5
   vercel ls --format json
   ```
   Find the latest entry in the `deployments` array. If the CLI is not authenticated, tell the user to check the Vercel dashboard or commit status checks.

### Linked + no git remote → `vercel deploy`

```bash
vercel deploy [path] -y --no-wait
```

Use `--no-wait` so the CLI returns immediately with the deployment URL. Then check on the deployment status with:

```bash
vercel inspect <deployment-url>
```

Production (only when user explicitly asks):

```bash
vercel deploy [path] --prod -y --no-wait
```

### Not linked + CLI is authenticated → Link first, then deploy

1. **Ask the user which team to deploy to.** Present team slugs from `vercel teams list --format json` as a bulleted list. If there's only one team, skip.
2. **Once a team is selected, proceed directly to linking.** Tell the user what will happen but do not ask for separate confirmation.
3. **If a git remote exists**, use repo-based linking:
   ```bash
   vercel link --repo --scope <team-slug>
   ```
   This reads the git remote URL and matches it to existing Vercel projects. Creates `.vercel/repo.json`. More reliable than plain `vercel link`, which matches by directory name.
4. **If there is no git remote**, fall back to standard linking:
   ```bash
   vercel link --scope <team-slug>
   ```
   Creates `.vercel/project.json`.
5. **Then deploy using the best available method:** git push if remote exists, otherwise `vercel deploy [path] -y --no-wait --scope <team-slug>`, then `vercel inspect <url>`.

### Not linked + CLI not authenticated → Install, auth, link, deploy

1. **Install the CLI (if not already installed):**
   ```bash
   npm install -g vercel
   ```
2. **Authenticate:**
   ```bash
   vercel login
   ```
   The user completes auth in their browser. If running in a non-interactive environment where login is not possible, skip to the **no-auth fallback** below.
3. Ask which team to deploy to — present team slugs as a bulleted list. If only one team, skip.
4. **Link the project** with the selected team scope (use `--repo` if a git remote exists):
   ```bash
   vercel link --repo --scope <team-slug>   # if git remote exists
   vercel link --scope <team-slug>          # if no git remote
   ```
5. **Deploy** using the best available method (git push if remote exists, otherwise `vercel deploy -y --no-wait --scope <team-slug>`, then `vercel inspect <url>`).

### No-Auth Fallback — claude.ai sandbox

Last resort when the CLI can't be installed or authenticated. Returns a Preview URL and a Claim URL.

```bash
bash /mnt/skills/user/deploy-to-vercel/resources/deploy.sh [path]
```

The script auto-detects the framework from `package.json`, packages the project, uploads it, and waits for the build. **Tell the user:** "Your deployment is ready at [previewUrl]. Claim it at [claimUrl] to manage your deployment."

### No-Auth Fallback — Codex sandbox

1. **Check whether the Vercel CLI is installed:**
   ```bash
   command -v vercel
   ```
2. **If installed**, try deploying with the CLI:
   ```bash
   vercel deploy [path] -y --no-wait
   ```
3. **If not installed, or the CLI fails with "No existing credentials found"**, use the fallback script:
   ```bash
   skill_dir="<path-to-skill>"
   bash "$skill_dir/resources/deploy-codex.sh" [path]
   ```

**Tell the user:** "Your deployment is ready at [previewUrl]. Claim it at [claimUrl] to manage your deployment."

**Escalated network access:** Only escalate the actual deploy command if sandboxing blocks the network call. Do **not** escalate the `command -v vercel` check.

## Agent-Specific Notes

- **Claude Code / terminal-based agents:** You have full shell access. Do NOT use the `/mnt/skills/` path. Follow the decision flow above using the CLI directly. For the no-auth fallback, run the deploy script from the skill's installed location (`bash ~/.claude/skills/deploy-to-vercel/resources/deploy.sh [path]`).
- **Sandboxed environments (claude.ai):** You likely cannot run `vercel login` or `git push`. Go directly to the **no-auth fallback — claude.ai sandbox**.
- **Codex:** Check if the CLI is available first, then fall back to the deploy script. Go to the **no-auth fallback — Codex sandbox**.

## Output

Always show the user the deployment URL.

- **Git push:** Use `vercel ls --format json` to find the preview URL. If the CLI isn't authenticated, tell the user to check the Vercel dashboard or commit status checks.
- **CLI deploy:** Show the URL returned by `vercel deploy --no-wait`. Use `vercel inspect <url>` to check build status.
- **No-auth fallback:** Show both the preview URL and the claim URL.

**Do not** curl or fetch the deployed URL to verify it works. Just return the link.

## Troubleshooting

### Network Egress Error (claude.ai)

Tell the user to add `*.vercel.com` to allowed domains at `https://claude.ai/settings/capabilities`.

### Escalated Network Access (Codex / sandboxed environments)

If deployment fails due to network issues in a sandboxed environment, rerun with escalated permissions. Do not escalate the initial CLI availability check — only escalate the actual deploy command.

### CLI Auth Failure

If `vercel login` or `vercel deploy` fails with authentication errors, fall back to the no-auth deploy script.
