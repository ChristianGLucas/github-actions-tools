// Shared test context and fixture workflow for github-actions-tools node
// unit tests. Not a node and not a test file (no describe/it), so it is
// neither registered as a node nor collected by jest.
import {
  AxiomContext,
  AxiomLogger,
  AxiomSecrets,
  AxiomReflection,
  AxiomMutation,
} from '../gen/axiomContext';

const reflection: AxiomReflection = {
  flow: {
    nodes: [],
    edges: [],
    loopEdges: [],
    position: { currentInstance: 0, depth: 0, loopIterations: {}, subflowStackGraphIds: [] },
    graphId: '',
  },
};

const mutation: AxiomMutation = {
  flow: {
    addNode: (_p: string, _v: string) => 0,
    addEdge: (_s: number, _d: number) => {},
  },
};

export const ctx: AxiomContext = {
  log: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} } satisfies AxiomLogger,
  secrets: { get: (_n: string): [string, boolean] => ['', false] } satisfies AxiomSecrets,
  executionId: 'test-execution-id',
  flowId: 'test-flow-id',
  tenantId: 'test-tenant-id',
  reflection,
  mutation,
};

/**
 * FIXTURE — a 4-job workflow (build/lint/publish/notify) hand-authored to
 * exercise every field this package extracts: every `on:` shape (bare
 * string via none used here, list form via none, map-with-filters form for
 * push/pull_request/pull_request_target, schedule's cron list,
 * workflow_dispatch/workflow_call's declared inputs+secrets), workflow +
 * job env/permissions/concurrency, a job's environment/container/strategy.
 * matrix (dimensions + include + exclude)/defaults.run, steps covering
 * every uses: shape (floating-tag action, SHA-pinned action, local-path
 * action, Docker-image action) and every run: shape (single-line, a
 * multi-line block scalar, a script referencing a secret), and two
 * reusable-workflow-call jobs (one local-path with secrets: inherit, one
 * SHA-pinned external with an explicit secrets: map).
 *
 * Every oracle constant below was derived from THIS TEXT by feeding it
 * through js-yaml directly (`node -e "require('js-yaml').load(...)"`,
 * independent of this package's own extraction code) and then hand-
 * mapping the resulting parsed structure to each node's documented
 * semantics — never by running this package's own nodes and copying their
 * output. The js-yaml parse itself is trusted (it is the well-tested
 * upstream library, not something this package reimplements); what these
 * tests exercise is OUR mapping/extraction logic on top of that trusted
 * parse.
 */
export const FIXTURE_WORKFLOW = `
name: CI

on:
  push:
    branches: [main, "release/*"]
    paths-ignore: ["docs/**"]
  pull_request:
    types: [opened, synchronize]
  pull_request_target:
    branches: [main]
  schedule:
    - cron: "0 3 * * *"
    - cron: "30 15 * * 1-5"
  workflow_dispatch:
    inputs:
      environment:
        description: "Target environment"
        required: true
      dry_run:
        type: boolean
        default: false
  workflow_call:
    inputs:
      tag:
        required: true
        type: string
    secrets:
      NPM_TOKEN:
        required: true

permissions:
  contents: read
  issues: write

env:
  CI: "true"
  NODE_ENV: production

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    name: Build and test
    runs-on: ubuntu-latest
    timeout-minutes: 15
    continue-on-error: false
    environment:
      name: staging
      url: https://staging.example.com
    permissions:
      contents: read
      packages: write
    container:
      image: node:20-bullseye
      env:
        NPM_CONFIG_CACHE: /tmp/.npm
      credentials:
        username: \${{ github.actor }}
        password: \${{ secrets.GHCR_TOKEN }}
    strategy:
      fail-fast: false
      max-parallel: 2
      matrix:
        os: [ubuntu-latest, macos-latest]
        node: [18, 20]
        include:
          - os: ubuntu-latest
            node: 20
            coverage: true
        exclude:
          - os: macos-latest
            node: 18
    env:
      BUILD_ENV: ci
    defaults:
      run:
        shell: bash
        working-directory: ./app
    steps:
      - name: Checkout
        id: checkout
        uses: actions/checkout@v4
      - name: Setup Node (pinned)
        uses: actions/setup-node@d6cd328b831104f9adbeded410aae9f60296cc25
        with:
          node-version: "20"
      - name: Local action
        uses: ./.github/actions/custom-setup
      - name: Docker step
        uses: docker://alpine:3.19
      - name: Install
        run: npm ci
        env:
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}
      - name: Build
        id: build
        run: |
          npm run build
          echo "done"
        shell: bash
        working-directory: ./app/dist
        if: success()
        continue-on-error: true
        timeout-minutes: 10
      - name: Deploy secret leak
        run: curl -H "Authorization Bearer \${{ secrets.DEPLOY_TOKEN }}" https://api.example.com/deploy

  lint:
    runs-on: [self-hosted, linux, x64]
    needs: [build]
    steps:
      - run: npm run lint

  publish:
    needs: [build, lint]
    uses: ./.github/workflows/publish.yml
    with:
      tag: v1.0.0
    secrets: inherit

  notify:
    needs: [publish]
    uses: my-org/shared-workflows/.github/workflows/notify.yml@abcdefabcdefabcdefabcdefabcdefabcdefabcd
    secrets:
      SLACK_WEBHOOK: \${{ secrets.SLACK_WEBHOOK }}
`;

/** Minimal valid workflow — one push trigger, one job with one run step —
 * for tests that just need "a workflow that parses cleanly". */
export const MINIMAL_WORKFLOW = `
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo hi
`;

/** Deliberately structurally invalid: no top-level on:, an empty jobs: map
 * substitute (job with neither runs-on nor uses). Used by ValidateWorkflow
 * tests. */
export const INVALID_WORKFLOW = `
jobs:
  orphan:
    steps:
      - run: echo hi
`;

export const NOT_A_MAPPING_WORKFLOW = `- just
- a
- list
`;

export const UNPARSEABLE_YAML = `
jobs:
  build:
    runs-on: ubuntu-latest
   steps:
      - run: echo hi
`;

export const FIXTURE_TRIGGER_EVENTS_ORACLE = [
  'push',
  'pull_request',
  'pull_request_target',
  'schedule',
  'workflow_dispatch',
  'workflow_call',
];

export const FIXTURE_JOB_IDS_ORACLE = ['build', 'lint', 'publish', 'notify'];

export const FIXTURE_ACTIONS_ORACLE = [
  {
    jobId: 'build',
    stepIndex: 0,
    stepName: 'Checkout',
    rawUses: 'actions/checkout@v4',
    owner: 'actions',
    repo: 'checkout',
    subPath: '',
    ref: 'v4',
    refKind: 'floating',
    isShaPinned: false,
    isLocalPath: false,
    isDocker: false,
    dockerImage: '',
  },
  {
    jobId: 'build',
    stepIndex: 1,
    stepName: 'Setup Node (pinned)',
    rawUses: 'actions/setup-node@d6cd328b831104f9adbeded410aae9f60296cc25',
    owner: 'actions',
    repo: 'setup-node',
    subPath: '',
    ref: 'd6cd328b831104f9adbeded410aae9f60296cc25',
    refKind: 'sha',
    isShaPinned: true,
    isLocalPath: false,
    isDocker: false,
    dockerImage: '',
  },
  {
    jobId: 'build',
    stepIndex: 2,
    stepName: 'Local action',
    rawUses: './.github/actions/custom-setup',
    owner: '',
    repo: '',
    subPath: '',
    ref: '',
    refKind: '',
    isShaPinned: false,
    isLocalPath: true,
    isDocker: false,
    dockerImage: '',
  },
  {
    jobId: 'build',
    stepIndex: 3,
    stepName: 'Docker step',
    rawUses: 'docker://alpine:3.19',
    owner: '',
    repo: '',
    subPath: '',
    ref: '',
    refKind: '',
    isShaPinned: false,
    isLocalPath: false,
    isDocker: true,
    dockerImage: 'alpine:3.19',
  },
];

export const FIXTURE_SECRETS_ORACLE = [
  { jobId: 'build', stepIndex: -1, location: 'container', secretName: 'GHCR_TOKEN' },
  { jobId: 'build', stepIndex: 4, location: 'env', secretName: 'NPM_TOKEN' },
  { jobId: 'build', stepIndex: 6, location: 'run', secretName: 'DEPLOY_TOKEN' },
  { jobId: 'notify', stepIndex: -1, location: 'secrets', secretName: 'SLACK_WEBHOOK' },
];

export const FIXTURE_BUILD_RUN_STEP = {
  index: 5,
  stepId: 'build',
  name: 'Build',
  run: 'npm run build\necho "done"\n',
  shell: 'bash',
  workingDirectory: './app/dist',
  ifCondition: 'success()',
  continueOnError: true,
  timeoutMinutes: 10,
};
