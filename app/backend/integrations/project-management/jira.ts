import { AgileClient, Version2Client } from 'jira.js';
import { IssueUpdateDetails } from 'jira.js/out/version2/models';
import { CreateIssue } from 'jira.js/out/version2/parameters/createIssue';

export class JiraClient {
  public agileClient: AgileClient;
  public version2Client: Version2Client;
  constructor(api_token: string, email: string) {
    this.agileClient = new AgileClient({
      host: 'https://jira.atlassian.com',
      authentication: {
        basic: {
          apiToken: api_token,
          email
        }
      }
    })

    this.version2Client = new Version2Client({
      host: 'https://jira.atlassian.com',
      authentication: {
        basic: {
          apiToken: api_token,
          email
        }
      }
    })
  }

  public async getBoardIssues(boardId: number){
    try {
      const response = await this.agileClient.board.getIssuesForBoard({boardId})
      return response.issues
    } catch (e) {
      throw e
    }
  }
  public async getBoard(boardId: number){
    try {
      const response = await this.agileClient.board.getIssuesForBoard({boardId})
      return response
    } catch (e) {
      throw e
    }    
  }

  public async getSprint(sprintId: number){
    try {
      const response = await this.agileClient.sprint.getSprint({sprintId})
      return response
    } catch (e) {
      throw e
    }
  }
  public async getSprintIssues(sprintId: number){
    try {
      const response = await this.agileClient.sprint.getIssuesForSprint({sprintId})
      return response.issues
    } catch (e) {
      throw e
    }
  }
  public async createIssues(issues: IssueUpdateDetails[]) {
    try {
      const response = await this.version2Client.issues.createIssues({issueUpdates: issues})
      if (response.errors) throw new Error('Error creating issues')
      if (!response.issues) throw new Error('No issues created')
      return response.issues
    } catch (e) {
      throw e
    }
  }
}