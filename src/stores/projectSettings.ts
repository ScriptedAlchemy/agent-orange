import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

export interface ProjectSettings {
  codex: {
    autoPrompt: boolean
    promptCharLimit: number
  }
}

const DEFAULT_SETTINGS: ProjectSettings = {
  codex: {
    autoPrompt: true,
    promptCharLimit: 8000,
  },
}

interface ProjectSettingsState {
  settings: Record<string, ProjectSettings>
  loading: Record<string, boolean>
  error: string | null
  loadSettings: (projectId: string) => Promise<ProjectSettings | null>
  updateSettings: (projectId: string, update: Partial<ProjectSettings>) => Promise<ProjectSettings | null>
}

const parseError = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "Unexpected error"
}

export const useProjectSettingsStore = create<ProjectSettingsState>()(
  immer((set, get) => ({
    settings: {},
    loading: {},
    error: null,

    loadSettings: async (projectId: string) => {
      if (!projectId) return null

      set((state) => {
        state.loading[projectId] = true
        state.error = null
      })

      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/settings`)
        if (!response.ok) {
          throw new Error(`Failed to load project settings (${response.status})`)
        }
        const data = (await response.json()) as ProjectSettings
        set((state) => {
          state.settings[projectId] = data ?? DEFAULT_SETTINGS
          state.loading[projectId] = false
        })
        return data
      } catch (error) {
        set((state) => {
          state.settings[projectId] = state.settings[projectId] ?? DEFAULT_SETTINGS
          state.loading[projectId] = false
          state.error = parseError(error)
        })
        return null
      }
    },

    updateSettings: async (projectId: string, update: Partial<ProjectSettings>) => {
      if (!projectId) return null

      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/settings`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(update),
        })
        if (!response.ok) {
          const text = await response.text().catch(() => "")
          throw new Error(text || `Failed to update settings (${response.status})`)
        }
        const data = (await response.json()) as ProjectSettings
        set((state) => {
          state.settings[projectId] = data
        })
        return data
      } catch (error) {
        set((state) => {
          state.error = parseError(error)
        })
        return null
      }
    },
  }))
)

export const useProjectSettings = (projectId: string | undefined) =>
  useProjectSettingsStore((state) => (projectId ? state.settings[projectId] : undefined))

export const getDefaultSettings = () => DEFAULT_SETTINGS
