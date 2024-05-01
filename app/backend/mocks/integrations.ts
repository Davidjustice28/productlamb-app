export interface Integration {id: number, name: string, img_url: string, description: string}

export const mockIntegrations: Array<Integration> = [
  {
    id: 0,
    name: "Notion",
    img_url: 'https://storage.googleapis.com/product-lamb-images/notion.svg',
    description: "An all-in-one workspace for your notes, tasks, wikis, and databases."
  },
  {
    id: 1,
    name: "Jira",
    description: 'Comprehensive project management tool that helps teams plan, track, and manage their work efficiently.',
    img_url: 'https://storage.googleapis.com/product-lamb-images/jira.svg',
  },
  {
    id: 2,
    name: "ClickUp",
    img_url: 'https://storage.googleapis.com/product-lamb-images/mobile-app-icon%402x.png',
    description: 'Productivity platform that combines task management, documents, goals, and chat, empowering teams to work collaboratively and efficiently.'
  },
  {
    id: 3,
    name: "Slack",
    img_url: 'https://storage.googleapis.com/product-lamb-images/slack.svg',
    description: 'Messaging platform that brings teams together, streamlining communication and enhancing productivity through channels, integrations, and file sharing.'
  },
  {
    id: 4,
    name: "Google Calendar",
    img_url: 'https://storage.googleapis.com/product-lamb-images/google-calendar.svg',
    description: 'Cloud-based calendar service built on Google technoloy suite.'
  },
  {
    id: 5,
    name: "Trello",
    img_url: 'https://storage.googleapis.com/product-lamb-images/trello.svg',
    description: 'Visual collaboration tool that creates a shared perspective on any project.'
  },
  {
    id: 6,
    name: "Dropbox",
    img_url: 'https://storage.googleapis.com/product-lamb-images/dropbox.svg',
    description: 'File hosting service that offers cloud storage, file synchronization, personal cloud, and client software.'
  }
]
