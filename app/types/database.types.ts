export enum BugGroup {
  ALL = "all",
  COMPLETED = "completed",
  DELETED = "deleted",
  MANUAL = "manual",
  EXTERNAL = "external"
}

export enum SettingsTabGroup {
  PREFERENCES = "preferences",
  NOTIFICATIONS = "notifications",
  BILLING = "billing",
}


export interface NewApplicationData {
  name: string
  summary: string
  siteUrl: string
  type: "web" | "mobile" | "desktop"
  goals: string
}