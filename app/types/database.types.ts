export enum BugGroup {
  ALL = "all",
  COMPLETED = "completed",
  DELETED = "deleted",
  HIGH_PRIORITY = "high priority",
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
  logo_url?: string|null
  repositories: string
}

export type BugSource = 'repository' | 'self-identified' | 'productLamb' | 'integration' | 'pm-tool' | 'other'
export type BugStatus = 'not-started' | 'in-progress' | 'fixed' | 'archived'
export type BugPriority = 'low' | 'medium' | 'high'
export interface BugCreateData {
  title: string
  description: string
  source: BugSource
  status: BugStatus
  priority: BugPriority
}

export type FeedbackSource = 'Notion' | 'Google Review' | 'SurveyMonkey' | 'YouTube' | 'Other' | 'Jira' | 'Email'
export type PLAvailableIntegrationNames = 'google calendar' | 'google drive' | 'google sheets' | 'google forms' | 'excel' | 'typeform' | 'jotform' | 'slack' | 'gmail' | 'excel' | 'discord'
