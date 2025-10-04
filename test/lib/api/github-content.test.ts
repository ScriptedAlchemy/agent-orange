import { describe, it, expect, beforeEach, afterEach, rstest } from "@rstest/core"

import { fetchGitHubContent } from "@/lib/api/github-content"
import type { GitHubContentBatchResponse } from "@/lib/api/github-content"

const repo = { owner: "module-federation", repo: "core" }

const makeResponse = (payload: Partial<GitHubContentBatchResponse> = {}): GitHubContentBatchResponse => ({
  items: [],
  errors: [],
  issues: [],
  pulls: [],
  statuses: {},
  meta: {
    cacheHits: 0,
    cacheMisses: 0,
    refreshed: 0,
    staleHits: 0,
    warmed: 0,
    errorHits: 0,
  },
  rateLimit: null,
  ...payload,
})

describe("fetchGitHubContent", () => {
  let fetchMock: ReturnType<typeof rstest.fn>

  beforeEach(() => {
    fetchMock = rstest.fn(async () =>
      new Response(JSON.stringify(makeResponse()), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )
    rstest.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    rstest.unstubAllGlobals()
  })

  it("forwards lazy-loading flags to the API", async () => {
    await fetchGitHubContent({
      projectId: "project-1",
      request: {
        repo,
        includeIssues: { state: "open", perPage: 5 },
        includePulls: { state: "open", perPage: 10 },
        includeStatuses: true,
        prefetchIssueItems: false,
        prefetchPullItems: false,
      },
    })

    expect(fetchMock.mock.calls.length).to.equal(1)
    const [, init] = fetchMock.mock.calls[0]
    expect(init).to.exist
    const body = JSON.parse((init as RequestInit).body as string)
    expect(body.prefetchIssueItems).to.equal(false)
    expect(body.prefetchPullItems).to.equal(false)
    expect(body.includeIssues.perPage).to.equal(5)
    expect(body.includePulls.perPage).to.equal(10)
  })
})
