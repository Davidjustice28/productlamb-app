export interface Bug {
  id: number,
  title: string,
  description: string,
  status: 'In Progress' | 'Fixed' | 'Archived' | 'Not Started'
  priority: 'Low' | 'Medium' | 'High',
  type: 'Manual' | 'External',
  source: 'Github Issue' | 'Gitlab Issue' | 'Jira Issue' | 'Notion Task' | 'Clickup Task' | 'ProductLamb' | 'Platform User'| 'Other',
  created_date: string
}

export const mockBugs: Array<Bug> = [
  {
    id: 0,
    title: "User authentication not working",
    description: "Admin users are unable to login to the platform",
    status: 'Not Started',
    priority: 'High',
    type: 'Manual',
    source: 'Platform User',
    created_date: "2021-03-01"
  },
  {
    id: 1,
    title: "User profile not updating",
    description: "User profile data is not updating after changes are made",
    status: 'In Progress',
    priority: 'Medium',
    type: 'Manual',
    source: 'Platform User',
    created_date: "2021-03-17"
  },
  {
    id: 2,
    title: "Sidebar state not held on dark mode toggle",
    description: "Sidebar resets to expanded state when dark mode is toggled",
    status: 'Not Started',
    priority: 'Low',
    type: 'Manual',
    source: 'Platform User',
    created_date: "2021-03-01"
  },
  {
    id: 3,
    title: "Navbar logo flashes on page load",
    description: "One first render of the page, the productlamb logo flashes when expanding sidebar",
    status: 'Not Started',
    priority: 'Low',
    type: 'Manual',
    source: 'Platform User',
    created_date: "2021-03-01"
  },
  {
    id: 4,
    title: "Several empty pages",
    description: "Multiple pages in the platform are empty and do not display any content",
    status: 'In Progress',
    priority: 'High',
    type: 'Manual',
    source: 'Platform User',
    created_date: "2021-03-01"
  },
  {
    id: 5,
    title: "No landing page for marketing",
    description: "Currently no matter the auth state, the user is logged in and redirected to the dashboard",
    status: 'Not Started',
    priority: 'High',
    type: 'Manual',
    source: 'Platform User',
    created_date: "2021-03-17"
  }
]