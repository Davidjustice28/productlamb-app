import { Projects, Issues } from '@gitbeaker/rest';
import { BaseResourceOptions } from '@gitbeaker/requester-utils'

export class GitlabClient {
  public configuration: BaseResourceOptions<boolean> = {
    host: 'https://gitlab.com',
    token: ''
  }
  constructor(api_token: string) {
    this.configuration = {
      host: 'https://gitlab.com',
      token: api_token
    }
  }

  /**
   * Get all open issues in a gitlab repository
   * @param projectId project id
   */
  public async getIssues(projectId: number) {
    try {
      const issues = await new Issues(this.configuration).all({projectId});
      return issues;
    } catch (e) {
      throw e;
    }
  }

  public async getProject(projectId: number) {
    try {
      const project = await new Projects(this.configuration).show(projectId);
      return project;
    } catch (e) {
      throw e;
    }
  }
}