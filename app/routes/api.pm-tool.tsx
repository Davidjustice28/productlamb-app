import { ActionFunction, json } from "@remix-run/node";
import { ApplicationsClient } from "~/backend/database/applications/client";
import { ApplicationPMToolClient } from "~/backend/database/pm-tools/client";
import { DB_CLIENT } from "~/services/prismaClient";
import { ClickUpData, NotionData, JiraData, GithubData } from "~/types/database.types";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json() as {tool_data?: ClickUpData | NotionData | JiraData, application_id?: number, remove_config?: boolean};
  if (!('application_id' in body) ) {
    return json({}, {status: 400});
  }

  if (!('tool_data' in body) && !('remove_config' in body)) {
    return json({}, {status: 400});
  }

  if ("remove_config" in body) {
    const application = await DB_CLIENT.accountApplication.findFirst({where: {id: body.application_id}})
    if (!application) {
      return json({}, {status: 404})
    }
    if (application.clickup_integration_id) {
      await DB_CLIENT.applicationClickupIntegration.deleteMany({where: {id: application.clickup_integration_id}})
    }
    if (application.jira_integration_id) {
      await DB_CLIENT.applicationJiraIntegration.deleteMany({where: {id: application.jira_integration_id}})
    }

    if (application.notion_integration_id) {
      await DB_CLIENT.applicationNotionIntegration.deleteMany({where: {id: application.notion_integration_id}})
    }

    if (application.github_integration_id) {
      await DB_CLIENT.applicationGithubIntegration.deleteMany({where: {id: application.github_integration_id}})
    }
     
    await DB_CLIENT.accountApplication.updateMany({ where: {id: body.application_id}, data: {clickup_integration_id: null, jira_integration_id: null, notion_integration_id: null, github_integration_id: null, sprint_generation_enabled: false}})
    const appDbClient = ApplicationsClient(DB_CLIENT.accountApplication)
    const updatedApp = await appDbClient.getApplicationById(body.application_id!)
    if (updatedApp) {
      return json(updatedApp)
    } else {
      return json({}, {status: 500})
    }
  } else {
    const {application_id, tool_data} = body as {application_id: number, tool_data: ClickUpData | NotionData | JiraData | GithubData };
    const pmToolClient = ApplicationPMToolClient(DB_CLIENT)
    const appDbClient = ApplicationsClient(DB_CLIENT.accountApplication)
  
    let pmToolConfigurationResponseId: number| null = null
    let pmToolType: 'clickup' | 'notion' | 'jira' | 'github' | null = null
    if ('parentFolderId' in tool_data) {
      const {parentFolderId, apiToken} = tool_data
      const {data, errors} = await pmToolClient.clickup.addConfig(apiToken, parentFolderId, application_id)
      if (data) {
        pmToolConfigurationResponseId = data.id
        pmToolType = 'clickup'
      }
  
      if (errors) {
        console.log('error adding clickup config', errors)
      }
  
    } else if ('parentBoardId' in tool_data) {
      const {parentBoardId, apiToken, email, hostUrl, projectKey} = tool_data
      const {data, errors} = await pmToolClient.jira.addConfig(apiToken, parentBoardId, email, projectKey, hostUrl, application_id)
      if (data) {
        pmToolConfigurationResponseId = data.id
        pmToolType = 'jira'
      } else {
        console.error('error adding jira config', errors)
      }
  
    } else if('projectId' in tool_data) {
      const {projectId, apiToken, repo, owner} = tool_data
      const {data, errors} = await pmToolClient.github.addConfig(apiToken, projectId, repo, owner, application_id)
      if (data) {
        pmToolConfigurationResponseId = data.id
        pmToolType = 'github'
      } else {
        console.error('error adding github config', errors)
      }
    } else {
      const {parentPageId, apiKey} = tool_data
      let parent_id = '' 
      // ex: PAGETITLE-aba935a7aca940cfb6605de9edd598a8 || aba935a7aca940cfb6605de9edd598a8 || aba935a7-aca9-40cf-b660-5de9edd598a8 
      const sections = parentPageId.split('-')
      if (sections.length === 2) {
        // PAGETITLE-aba935a7aca940cfb6605de9edd598a8 - remove page title and turn into a valid uuid
        const id = parentPageId.split('-')[1]
        const parts = [id.slice(0, 8), id.slice(8, 12), id.slice(12, 16), id.slice(16, 20), id.slice(20)]
        parent_id = parts.join('-')
      } else if (sections.length === 5) {
        // aba935a7-aca9-40cf-b660-5de9edd598a8 - is a valid uuid
        parent_id = parentPageId
      } else if (sections.length === 1) {
        // aba935a7aca940cfb6605de9edd598a8 - turn into a valid uuid
        const id = parentPageId
        const parts = [id.slice(0, 8), id.slice(8, 12), id.slice(12, 16), id.slice(16, 20), id.slice(20)]
        parent_id = parts.join('-')
      } else {
        // invalid id
        console.error(`Invalid Notion Page ID: ${parentPageId}. Please update later`)
        parent_id = parentPageId
      }
      const {data, errors} = await pmToolClient.notion.addConfig(apiKey, parent_id, application_id)
      if (data) {
        pmToolConfigurationResponseId = data.id
        pmToolType = 'notion'
      } else {
        console.error('error adding notion config', errors)
      }
    }
    if (pmToolConfigurationResponseId && pmToolType) {
      await DB_CLIENT.accountApplication.updateMany({ where: {id: application_id}, data: {clickup_integration_id: null, jira_integration_id: null, notion_integration_id: null, github_integration_id: null}})
      if (pmToolType === 'clickup') {
        const response = await appDbClient.updateApplication(application_id, {clickup_integration_id: pmToolConfigurationResponseId})
      } else if(pmToolType === 'jira') {
        const response = await appDbClient.updateApplication(application_id, {jira_integration_id: pmToolConfigurationResponseId})
      } else if (pmToolType === 'github') {
        const response = await appDbClient.updateApplication(application_id, {github_integration_id: pmToolConfigurationResponseId})
      } else {
        const response = await appDbClient.updateApplication(application_id, {notion_integration_id: pmToolConfigurationResponseId})
      }
      const updatedApp = await appDbClient.getApplicationById(application_id)
      if (updatedApp?.data) {
        const application = updatedApp.data
        let data: {type: 'notion' | 'jira' | 'clickup' | 'github', data: JiraData | NotionData | ClickUpData | GithubData} | null = null
        if (application?.clickup_integration_id) {
          const result = await DB_CLIENT.applicationClickupIntegration.findFirst({where: {id: application.clickup_integration_id}})
          if (result) {
            data = {
              type: 'clickup', 
              data: {
                apiToken: result.api_token,
                parentFolderId: Number(result.parent_folder_id)
              }
            }
          }
        }
        if (application?.jira_integration_id) {
          const result = await DB_CLIENT.applicationJiraIntegration.findFirst({where: {id: application.jira_integration_id}})
          if (result) {
            data = {
              type: 'jira',
              data: {
                apiToken: result.api_token,
                parentBoardId: Number(result.parent_board_id),
                email: result.email,
                hostUrl: result.host_url,
                projectKey: result.project_key
              }
            }
          }
        }
        if (application?.notion_integration_id) {
          const result = await DB_CLIENT.applicationNotionIntegration.findFirst({where: {id: application.notion_integration_id}})
          if (result) {
            data = {
              type: 'notion',
              data: {
                apiKey: result.api_token,
                parentPageId: result.parent_page_id
              }
            }
          }
        }

        if (application?.github_integration_id) {
          const result = await DB_CLIENT.applicationGithubIntegration.findFirst({where: {id: application.github_integration_id}})
          if (result) {
            data = {
              type: 'github',
              data: {
                apiToken: result.api_token,
                projectId: result.project_id,
                repo: result.repo,
                owner: result.owner
              }
            }
          }
        }
        return json({application, toolConfigured: data})
      } else {
        return json({}, {status: 500})
      }
    } else {
      return json({}, {status: 500})
    }
  }
  
}