## 1. Dockerfile Infrastructure

- [x] 1.1 Create the production `Dockerfile` in the project root.
- [x] 1.2 Implement the multi-stage builder using `node:24-bookworm-slim` and `pnpm` to install and compile assets.
- [x] 1.3 Implement the runner stage using `nginx:alpine`, copying compiled assets and configuring default port/API_URL environments.

## 2. Nginx Server Configuration

- [x] 2.1 Create `nginx.conf.template` in the project root.
- [x] 2.2 Configure Nginx static asset serving and SPA routing handling in the template using the dynamic `${PORT}` environment.
- [x] 2.3 Configure the proxy block in the template to forward all requests under `/api` to `${API_URL}`.

## 3. Makefile Devops Automation

- [x] 3.1 Modify the `Makefile` to add automated targets for `prod-build`, `prod-run`, `prod-test`, `prod-clean`, and `prod-verify`.
- [x] 3.2 Reorganize the entire `Makefile` into logical sections using commented headers (e.g. HELP / UTILITIES, DEVELOPMENT WORKFLOW, DATABASE / SEEDING, DESIGN SYSTEM TOOLS, and PRODUCTION VERIFICATION).

## 4. Documentation

- [x] 4.1 Generate a comprehensive `DEPLOYMENT.md` file in the project root outlining the multi-stage architecture, local verification, and Google Cloud Run console setup steps.

## 5. Local Testing and Verification

- [x] 5.1 Run `make prod-verify` to execute the end-to-end automated build-run-test pipeline locally.
- [x] 5.2 Manually spin up the backend and production containers locally and verify full client-server data operations.

## 6. Live Google Cloud Run Verification (User Step)

- [ ] 6.1 Follow the step-by-step console instructions in `DEPLOYMENT.md` to connect the GitHub repository and deploy the service on Google Cloud Run.
- [ ] 6.2 Navigate to the generated live HTTPS URL in your web browser and confirm the React SPA loads correctly.
- [ ] 6.3 Verify that network requests to the `/api` route succeed and interact correctly with the backend API.

