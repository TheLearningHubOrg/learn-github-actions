# [1.0.0](https://github.com/TheLearningHubOrg/learn-github-actions/compare/30c3930...v1.0.0) (2026-11-03)


### Features

* restructure the guide to the 7-stage standard: roadmap, versions and migration section, generated table of contents, closing sections
* deepen stages 1-3: runners and token permissions, triggers and trust boundaries, contexts and expressions, file commands, shells, job graphs, matrix expansion rules, dynamic matrices, caching, artifacts, services and concurrency
* add a tested starter project: models of matrix, conditions, needs, cache, concurrency and OIDC rules in `src/`, a `node24` JavaScript action and a composite action in `actions/`, example workflows in `examples/workflows/`
* add CI (actionlint, tests on Node 22 and 24, a dynamic matrix planned by the repo's own action, Docker build), a multi-stage Dockerfile and release automation
* earlier content: 7-stage masterclass draft with mermaid diagrams and unit tests ([30c3930](https://github.com/TheLearningHubOrg/learn-github-actions/commit/30c393055c0e07fd5dd56c4afa05e5b319873130))


### Bug Fixes

* correct the matrix `include` semantics in the tests (entries merge into every matching combination)
* correct concurrency behaviour (one pending run; newer pending runs replace older ones), job time limits, the 48 KB secret size limit and runner polling details
* replace end-of-life Node versions and retired action majors in examples
