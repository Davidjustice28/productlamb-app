import { Octokit } from "octokit";
import { GithubIssueData } from "~/types/integrations.types";

export class GithubClient {
  public client: Octokit;

  constructor(api_token: string) {
    this.client = new Octokit({
      auth: api_token
    })
  }

  /**
   * Get all open issues in a github repository
   * @param owner Owner of the repository; Can be github username or organization name
   * @param repository Name of the repository
   */
  public async getIssues(owner: string, repository: string): Promise<GithubIssueData[]> {
    try {
      const { data } = await this.client.rest.issues.listForRepo(
        {
          owner: owner,
          repo: repository,
          state: 'open'
        }
      )
      const issues = data.map((issue) => {
        const { url, repository_url, title, body, number, user } = issue;
        return { url, repository_url, title, body, user: user?.login, number}
      })
      return issues
    } catch (e) {
      throw e;
    }
  }

  public async getRepo(owner: string, repository: string) {
    try {
      const repo = await this.client.rest.repos.get({
        owner,
        repo: repository
      })
      return repo;
    } catch (e) {
      throw e;
    }
  }
}