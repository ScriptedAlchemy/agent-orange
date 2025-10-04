import { describe, it, expect, beforeEach, afterEach, rstest } from "@rstest/core"

import { useCliSessionsStore } from "@/stores/cliSessions"

describe("CLI sessions store – closeSession", () => {
  const session = {
    id: "sess-1",
    title: "Terminal",
    projectId: "proj-1",
    worktreeId: "default",
    cwd: "/repo/project",
    tool: "codex" as const,
    status: "running" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  let fetchMock: ReturnType<typeof rstest.fn>

  const resetStore = () => {
    useCliSessionsStore.setState((state) => ({
      ...state,
      sessions: [session],
      activeSessionId: session.id,
      error: null,
    }))
  }

  beforeEach(() => {
    fetchMock = rstest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : (input instanceof URL ? input.href : (input as Request).url)
      if (url.endsWith(`/api/cli/sessions/${session.id}`) && init?.method === "DELETE") {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }
      return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } })
    })

    rstest.stubGlobal("fetch", fetchMock)
    resetStore()
  })

  afterEach(() => {
    rstest.unstubAllGlobals()
    useCliSessionsStore.setState((state) => ({ ...state, sessions: [], activeSessionId: null, error: null }))
  })

  it("removes the session immediately and issues DELETE to server", async () => {
    const { closeSession } = useCliSessionsStore.getState()
    await closeSession(session.id)

    const state = useCliSessionsStore.getState()
    expect(state.sessions.length).to.equal(0)
    expect(state.activeSessionId).to.equal(null)
    // Ensure server call was attempted
    const calls = fetchMock.mock.calls.filter((c) => String(c[0]).includes(`/api/cli/sessions/${session.id}`))
    expect(calls.length).to.equal(1)
    const _init = calls[0][1] as RequestInit
    expect(_init.method).to.equal("DELETE")
  })

  it("restores the session if server DELETE fails", async () => {
    fetchMock.mockImplementationOnce(async () => new Response("boom", { status: 500 }))
    const { closeSession } = useCliSessionsStore.getState()
    await closeSession(session.id)

    const state = useCliSessionsStore.getState()
    expect(state.sessions.length).to.equal(1)
    expect(state.sessions[0].id).to.equal(session.id)
    expect(state.activeSessionId).to.equal(session.id)
    expect(state.error).to.be.a("string")
  })
})
