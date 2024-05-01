export interface ClickUpNewListData {
  name: string
  content: string 
  due_date: number 
  due_date_time: boolean 
  priority: number 
}

export interface GithubIssueData {
  url: string, 
  repository_url: string, 
  title: string, 
  number: number, 
  body?:string|null,
  user?: string
}