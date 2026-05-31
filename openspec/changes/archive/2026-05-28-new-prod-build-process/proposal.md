## Why

To support reliable production deployments of the rook-notes React SPA (such as to Google Cloud Run), we need a production-grade multi-stage Docker build served via Nginx. Currently, the repository only supports a development container setup, so we need a lightweight, production-ready environment that can be validated locally using OrbStack.

## What Changes

- Add a production `Dockerfile` featuring a multi-stage build: a Node 24 and pnpm builder stage, and an Alpine-based Nginx runner stage.
- Add an `nginx.conf.template` to dynamically route `/api` requests to a configurable `API_URL` and support standard port bindings through `${PORT}`.
- Add new `Makefile` targets (`prod-build`, `prod-run`, `prod-test`, `prod-clean`, and `prod-verify`) for local automation and testing.
- Add a comprehensive `DEPLOYMENT.md` guide detailing Cloud Run deployment steps and local validation.
- Define clear verification steps for the live deployed Google Cloud Run HTTPS service endpoint.





## Capabilities

### New Capabilities
- `prod-build-process`: Build process and runtime configuration for production deployment, enabling light static serving through Nginx, environment-substituted API proxying, and automated local validation.

### Modified Capabilities
