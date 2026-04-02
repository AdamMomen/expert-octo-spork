# prd-playwright-integration-test-lab.md

# Playwright Integration Test Lab PRD

## 1. Introduction/Overview
The Playwright Integration Test Lab is an internal tool that automatically runs, observes, and helps debug Playwright-based SaaS integrations at AccessOwl.  

It solves the problem of frequent UI changes breaking selectors in 300+ browser automations, which currently cause silent failures, slow manual debugging, and compliance risks (failed offboardings and SOC2/ISO27001 violations).  

**Goal:** Build a minimal CI-like system so integration engineers can quickly detect breakage, view rich artifacts, and fix issues faster.

## 2. Goals
- Detect integration breakage within minutes (per-commit and nightly runs)
- Capture rich debugging artifacts (video, screenshots, logs)
- Reduce debug time significantly for integration engineers
- Provide clear visibility into integration health for the team
- Support safe addition of many new integrations per year

## 3. User Stories
- As an integration engineer, I can run all integrations nightly so I know which ones are failing.
- As an integration engineer, I can trigger a test run manually or via GitHub commit so I can test changes immediately.
- As an integration engineer, I can view video, screenshots, and logs of a failed run so I can understand what broke.
- As an integration engineer, I can use the AI copilot to get suggested selector fixes for a failure.
- As an engineering manager, I can see a simple dashboard showing which integrations are healthy or failing.

## 4. Functional Requirements
1. The system must store a simple list of integrations (JSON-based registry).
2. The system must run all Playwright tests nightly using a scheduler.
3. The system must allow manual triggering of all tests or specific tests via UI button.
4. The system must support GitHub webhook to trigger tests on changed integration files.
5. The system must capture Playwright video, screenshots, trace, and console logs on every run.
6. The system must display a dashboard listing all integrations with their last run status and overall health percentage.
7. The system must provide a detail view for each failed run showing embedded video, screenshots, and raw logs.
8. The system must include a one-click AI Copilot button that sends failure artifacts to Cloudflare Workers AI and displays suggested selector fixes.
9. The system must run inside a single Docker container using Docker Compose on Coolify.

## 5. Non-Goals (Out of Scope)
- Replacing the company’s generic CI/CD pipeline
- Automatically fixing failures or applying selector changes
- Solving CAPTCHAs or advanced anti-bot challenges
- Building advanced analytics, historical charts, or full observability platform
- Supporting multiple concurrent heavy runs (single container MVP)

## 6. Design Considerations
- Simple Next.js dashboard with two main pages: Overview (failing integrations list) and Failure Detail view.
- Embedded video player for Playwright recordings.
- Clean, minimal UI focused on clarity and speed.

## 7. Technical Considerations
- Backend: Hono (TypeScript) + Effect-TS v4
- Frontend: Next.js
- Database: PostgreSQL
- Artifact storage: local filesystem inside the container
- Test execution: child_process to run Playwright Test
- Deployment: single Docker container via Docker Compose on Coolify
- Demo uses one controllable test website with stable/broken states via feature flag

## 8. Success Metrics
- All nightly runs complete successfully and results appear on dashboard
- Integration engineers can go from failure to understanding root cause in under 5 minutes
- Demo flow (break → detect → analyze with AI → fix) completes in under 2 minutes
- Zero silent failures during demo or initial usage period

## 9. Open Questions
- None at this time (MVP scope is clearly defined)