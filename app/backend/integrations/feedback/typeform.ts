// import fetch from 'node-fetch';

import { TypeformFormResponseEntry, TypeformListResponse, TypeformWebhookEntry } from '~/types/integrations.types';

// interface TypeformClientInstance {
//   forms: Forms;
//   images: Images;
//   themes: Themes;
//   workspaces: Workspaces;
//   responses: Responses;
//   webhooks: Webhooks;
//   insights: Insights
// }

export class TypeformClient {
  public form_id: string;
  private token: string = ''

  constructor(api_token: string, form_id: string) {
    console.log('api_token: ', api_token)
    this.form_id = form_id;
    this.token = api_token;
  }

  public async getForm() {
    try {
      const response = await fetch(`https://api.typeform.com/forms/${this.form_id}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch typeform forms');
      }
      const data = await response.json() as TypeformFormResponseEntry
      console.log('Form GET data: ', data)
      return data;
    } catch (e) {
      throw e;
    }
      
  }

  public async getFormResponses() {
    try {
      const response = await fetch(`https://api.typeform.com/forms/${this.form_id}/responses`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch typeform forms');
      }
      const data = await response.json() as TypeformListResponse<TypeformFormResponseEntry>
      console.log('Form responses: ', data)
      return data.items;
    } catch (e) {
      throw e;
    }
  }

  public async getFormWebhooks() {
    try {
      const response = await fetch(`https://api.typeform.com/forms/${this.form_id}/webhooks`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch typeform forms');
      }
      const data = await response.json() as TypeformListResponse<TypeformWebhookEntry[]>
      console.log('Form webhooks: ', data)
      return data.items;
    } catch (e) {
      throw e;
    }
  }

  public async verifyIfWebhookAlreadyExists() {
    try {
      const response = await fetch(`https://api.typeform.com/forms/${this.form_id}/webhooks/productlamb-webhook`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch typeform forms');
      }
      const data = await response.json() as TypeformWebhookEntry
      return data ? true : false;
    } catch (e) {
      throw e;
    }
  }

  public async createWebhook(application_id: number, webhookNickname: string) {
    try {
      const response = await fetch(`https://api.typeform.com/forms/${this.form_id}/webhooks/${webhookNickname} `, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({url:`https://productlamb.com/api/feedback/${application_id}`, enabled:true})
      })
      if (!response.ok) {
        throw new Error('Failed to fetch typeform forms');
      }
      const data = await response.json() as TypeformWebhookEntry
      console.log('Webhook created: ', data)
      return data;
    } catch (e) {
      throw e;
    }
  }

  public async deleteWebhook() {
    try {
      const response = await fetch(`https://api.typeform.com/forms/${this.form_id}/webhooks/productlamb-webhook`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch typeform forms');
      }
      const deleted = response.status === 204
      console.log('Webhook deleted: ', deleted)
      return deleted;
    } catch (e) {
      throw e;
    }
  }
}