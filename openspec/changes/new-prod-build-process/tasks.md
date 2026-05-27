## 1. Dockerfile Infrastructure

- [ ] 1.1 Create the production `Dockerfile` in the project root.
- [ ] 1.2 Implement the multi-stage builder using `node:24-bookworm-slim` and `pnpm` to install and compile assets.
- [ ] 1.3 Implement the runner stage using `nginx:alpine`, copying compiled assets and configuring default port/API_URL environments.

## 2. Nginx Server Configuration

- [ ] 2.1 Create `nginx.conf.template` in the project root.
- [ ] 2.2 Configure Nginx static asset serving and SPA routing handling in the template using the dynamic `${PORT}` environment.
- [ ] 2.3 Configure the proxy block in the template to forward all requests under `/api` to `${API_URL}`.

## 3. Makefile Devops Automation

- [ ] 3.1 Modify the `Makefile` to add automated targets for `prod-build`, `prod-run`, `prod-test`, `prod-clean`, and `prod-verify`.
- [ ] 3.2 Reorganize the entire `Makefile` into logical sections using commented headers (e.g. HELP / UTILITIES, DEVELOPMENT WORKFLOW, DATABASE / SEEDING, DESIGN SYSTEM TOOLS, and PRODUCTION VERIFICATION).


## 4. Documentation

- [ ] 4.1 Generate a comprehensive `DEPLOYMENT.md` file in the project root outlining the multi-stage architecture, local verification, and Google Cloud Run console setup steps.

## 5. Local Testing and Verification

- [ ] 5.1 Run `make prod-verify` to execute the end-to-end automated build-run-test pipeline locally.
- [ ] 5.2 Manually spin up the backend and production containers locally and verify full client-server data operations.

## 6. One-Off Git Workflow Transition (User Step)

- [ ] 6.1 Sync the repository to the latest code (CLI: `git checkout main && git pull` or click the Sync/Pull icon in the IDE).
- [ ] 6.2 Create the new local `dev` branch:
  - **IDE GUI Method**: Click the active branch name in the bottom-left Status Bar (or open Command Palette `Cmd+Shift+P`, type `Git: Checkout to...`), select `+ Create new branch...`, type `dev`, and hit `Enter`.
  - **CLI Method**: Run `git checkout -b dev`.
- [ ] 6.3 Publish and track the `dev` branch remotely:
  - **IDE GUI Method**: Open the Source Control view (`Ctrl+Shift+G` or the branch icon in the Activity Bar) and click the **Publish Branch** button.
  - **CLI Method**: Run `git push -u origin dev`.
- [ ] 6.4 Establish the rule to execute future development strictly on the `dev` branch, merging changes to `main` via PRs when preparing a production build.


