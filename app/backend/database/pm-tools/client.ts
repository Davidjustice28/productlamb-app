import { PrismaClient } from "@prisma/client";
import { wrapAddClickupConfiguration, wrapDeleteClickupConfiguration, wrapUpdateClickupConfiguration } from "./clickup";
import { wrapAddNotionConfiguration, wrapDeleteNotionConfiguration, wrapUpdateNotionConfiguration } from "./notion";
import { wrapAddJiraConfiguration, wrapDeleteJiraConfiguration, wrapUpdateJiraConfiguration } from "./jira";
import { wrapAddGithubConfiguration, wrapDeleteGithubConfiguration, wrapUpdateGithubConfiguration } from "./github";

export const ApplicationPMToolClient = (client: PrismaClient) => {
  return {
    notion: wrapNotionPmTool(client.applicationNotionIntegration),
    clickup: wrapClickupPmTool(client.applicationClickupIntegration),
    jira: wrapJiraPmTool(client.applicationJiraIntegration),
    github: wrapGithubPMTool(client.applicationGithubIntegration)
  }
}

function wrapClickupPmTool(client: PrismaClient['applicationClickupIntegration']) {
  const addConfig = wrapAddClickupConfiguration(client)
  const updateConfig = wrapUpdateClickupConfiguration(client)
  const deleteConfig = wrapDeleteClickupConfiguration(client)
  return {
    addConfig,
    updateConfig,
    deleteConfig
  }
}

function wrapNotionPmTool(client: PrismaClient['applicationNotionIntegration']) {
  const addConfig = wrapAddNotionConfiguration(client)
  const updateConfig = wrapUpdateNotionConfiguration(client)
  const deleteConfig = wrapDeleteNotionConfiguration(client)
  return {
    addConfig,
    updateConfig,
    deleteConfig
  }
}

function wrapJiraPmTool(client: PrismaClient['applicationJiraIntegration']) {
  const addConfig = wrapAddJiraConfiguration(client)
  const updateConfig = wrapUpdateJiraConfiguration(client)
  const deleteConfig = wrapDeleteJiraConfiguration(client)
  return {
    addConfig,
    updateConfig,
    deleteConfig
  }
}

function wrapGithubPMTool(client: PrismaClient['applicationGithubIntegration']) {
  const addConfig = wrapAddGithubConfiguration(client)
  const updateConfig = wrapUpdateGithubConfiguration(client)
  const deleteConfig = wrapDeleteGithubConfiguration(client)
  return {
    addConfig,
    updateConfig,
    deleteConfig
  }
}