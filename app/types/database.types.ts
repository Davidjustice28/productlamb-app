export enum BugGroup {
  ALL = "all",
  HIGH_PRIORITY = "high priority",
}

export enum SettingsTabGroup {
  PREFERENCES = "preferences",
  NOTIFICATIONS = "notifications",
  BILLING = "billing",
}

export enum SprintInterval {
  DAILY = "daily",
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
}
export interface NewApplicationData {
  name: string
  summary: string
  siteUrl: string
  type: "web" | "mobile" | "desktop"
  goals: string
  logo_url?: string|null
  repositories: string
  projectManagementTool: string
  clickup_integration_id?: number
  notion_integration_id?: number
  sprint_generation_enabled?: boolean
  sprint_interval: SprintInterval
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

export enum PROJECT_MANAGEMENT_TOOL {
  CLICKUP = "ClickUp",
  // JIRA = "Jira", tbd
  NOTION = "Notion",
}

export interface NotionData {
  apiKey: string
  parentPageId: string
}

export interface ClickUpData {
  apiToken: string
  parentFolderId: number
}

export enum SupportedTimezone {
  EST = "America/New_York",      // Eastern Time (US & Canada)
  CST = "America/Chicago",       // Central Time (US & Canada)
  MST = "America/Denver",        // Mountain Time (US & Canada)
  PT = "America/Los_Angeles",   // Pacific Time (US & Canada)
  WET = "Europe/London",         // Western European Time
  CET = "Europe/Paris",          // Central European Time
  MOSCOWTIME = "Europe/Moscow",         // Moscow Standard Time
  JST = "Asia/Tokyo",            // Japan Standard Time
  AET = "Australia/Sydney"  // Australian Eastern Time
}