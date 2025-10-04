import { useEffect, useMemo, useState } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useProjectSettingsStore, useProjectSettings, type ProjectSettings } from "@/stores/projectSettings"

interface ProjectSettingsPanelProps {
  projectId: string
}

const MIN_PROMPT = 1000
const MAX_PROMPT = 20000

export function ProjectSettingsPanel({ projectId }: ProjectSettingsPanelProps) {
  const loadSettings = useProjectSettingsStore((state) => state.loadSettings)
  const updateSettings = useProjectSettingsStore((state) => state.updateSettings)
  const loadingMap = useProjectSettingsStore((state) => state.loading)
  const error = useProjectSettingsStore((state) => state.error)
  const settings = useProjectSettings(projectId)

  const loading = loadingMap[projectId] ?? false

  const [formState, setFormState] = useState<ProjectSettings | null>(settings ?? null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      void loadSettings(projectId)
    }
  }, [projectId, loadSettings])

  useEffect(() => {
    if (settings) {
      setFormState(settings)
    }
  }, [settings])

  const handleSave = async () => {
    if (!formState) return
    setSaving(true)
    setSaveMessage(null)
    try {
      await updateSettings(projectId, formState)
      setSaveMessage("Saved")
      setTimeout(() => setSaveMessage(null), 1500)
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const promptValue = formState?.codex.promptCharLimit ?? 8000

  const promptError = useMemo(() => {
    if (!formState) return null
    if (formState.codex.promptCharLimit < MIN_PROMPT) {
      return `Minimum is ${MIN_PROMPT.toLocaleString()} characters`
    }
    if (formState.codex.promptCharLimit > MAX_PROMPT) {
      return `Maximum is ${MAX_PROMPT.toLocaleString()} characters`
    }
    return null
  }, [formState])

  if (!formState) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">{loading ? "Loading settings…" : "No settings available"}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold">Codex Automation</h2>
        <p className="text-xs text-muted-foreground">
          Configure how Agent Orange seeds Codex sessions that originate from GitHub issues and pull requests.
        </p>
      </div>
      <Separator />
      <div className="flex-1 space-y-6 overflow-auto px-4 py-5 text-sm">
        <div className="flex items-start gap-3">
          <Checkbox
            id="autoPrompt"
            checked={formState.codex.autoPrompt}
            onCheckedChange={(checked) =>
              setFormState((prev) =>
                prev
                  ? {
                      ...prev,
                      codex: {
                        ...prev.codex,
                        autoPrompt: checked === true,
                      },
                    }
                  : prev
              )
            }
          />
          <div className="space-y-1">
            <Label htmlFor="autoPrompt">Auto-inject GitHub context</Label>
            <p className="text-xs text-muted-foreground">
              When enabled, Codex sessions launched from the GitHub page start with an instructional prompt describing the issue or PR.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="promptLimit">Maximum prompt characters</Label>
          <Input
            id="promptLimit"
            type="number"
            min={MIN_PROMPT}
            max={MAX_PROMPT}
            value={promptValue}
            onChange={(event) => {
              const next = Number.parseInt(event.currentTarget.value, 10)
              if (Number.isNaN(next)) {
                return
              }
              setFormState((prev) =>
                prev
                  ? {
                      ...prev,
                      codex: {
                        ...prev.codex,
                        promptCharLimit: next,
                      },
                    }
                  : prev
              )
            }}
          />
          <p className="text-xs text-muted-foreground">
            Codex will receive up to this many characters from the GitHub issue or PR when auto-injecting context.
          </p>
          {promptError ? <p className="text-xs text-destructive">{promptError}</p> : null}
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="text-xs text-muted-foreground">
          {promptError ? <span className="text-destructive">{promptError}</span> : error || saveMessage}
        </div>
        <Button onClick={handleSave} disabled={saving || Boolean(promptError)}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  )
}
