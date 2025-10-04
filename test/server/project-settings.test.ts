import { describe, it, expect, beforeEach, afterEach } from "@rstest/core"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { ProjectManager } from "@/server/project-manager"

describe("ProjectManager settings", () => {
  let dir: string

  beforeEach(() => {
    process.env.AGENT_ORANGE_TEST_MODE = "1"
    dir = mkdtempSync(join(tmpdir(), "pm-settings-"))
    ProjectManager.resetInstance()
  })

  afterEach(() => {
    try { rmSync(dir, { recursive: true, force: true }) } catch {}
    delete process.env.AGENT_ORANGE_TEST_MODE
    ProjectManager.resetInstance()
  })

  it("provides default settings when none are stored", async () => {
    const manager = ProjectManager.getInstance()
    const project = await manager.addProject(dir, "Sample")
    const settings = manager.getProjectSettings(project.id)
    expect(settings).to.be.ok
    expect(settings?.codex.autoPrompt).to.equal(true)
    expect(settings?.codex.promptCharLimit).to.equal(8000)
  })

  it("updates settings and clamps prompt limit", async () => {
    const manager = ProjectManager.getInstance()
    const project = await manager.addProject(dir, "Sample")

    const updated = manager.updateProjectSettings(project.id, {
      codex: {
        autoPrompt: false,
        promptCharLimit: 50000,
      },
    })

    expect(updated).to.be.ok
    expect(updated?.codex.autoPrompt).to.equal(false)
    expect(updated?.codex.promptCharLimit).to.equal(20000)

    const persisted = manager.getProjectSettings(project.id)
    expect(persisted?.codex.promptCharLimit).to.equal(20000)
  })
})
