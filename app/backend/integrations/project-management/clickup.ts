import { ClickUpNewListData } from "../../../types/integrations.types";

// TODO: Create types for ClickUp API responses

export class ClickUpClient {
  private baseUrl: string = 'https://api.clickup.com/api/v2';
  public token: string;
  constructor(api_token: string) {
    this.token = api_token;
  }

  public async getLists(folderId: number) {
    try {
      const resp = await fetch(
        `${this.baseUrl}/folder/${folderId}/list`,
        {
          method: 'GET',
          headers: {
            Authorization: this.token
          }
        }
      );
    
      const data = await resp.json();
      return data;
    } catch (e) {
      throw e
    }
  }

  public async getListTasks(listId: number) {
    const query = new URLSearchParams({archived: 'false'}).toString();
    
    try {
      const resp = await fetch(
        `${this.baseUrl}/list/${listId}/task?${query}`,
        {
          method: 'GET',
          headers: {
            Authorization: this.token
          }
        }
      );

      const data = await resp.json();
      return data;
      
    } catch (e) {
      throw e
    }
  }

  public async createList(folderId: number, listData: ClickUpNewListData) {
    const { content, due_date, due_date_time, priority, name } = listData;
    try {
      const resp = await fetch(
      `${this.baseUrl}/folder/${folderId}/list`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.token
        },
        body: JSON.stringify({ content, due_date, due_date_time, priority, name })
      }
      );
    
      const data = await resp.json();
      return data;
    } catch (e) {
      throw e
    }
  }

  public async createTaskInList(listId: number, task: any) {
    try {
      const { name, description, tags=[], priority, due_date_time=false } = task;
      const resp = await fetch(
        `${this.baseUrl}/list/${listId}/task?`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.token
          },
          body: JSON.stringify({
            name,
            description,
            tags: ['ProductLamb AI', ...tags],
            priority,
            due_date_time,
            notify_all: true,
          })
        }
      );

      const data = await resp.json();
      return data;
    } catch (e) {
      throw e
    }
  }

  public async createTasksInList(listId: number, tasks: any) {
    try {
      const response = await Promise.all(tasks.map((task: any) => this.createTaskInList(listId, task)));
      return response;
    } catch (e) {
      return e;
    }
  }
}