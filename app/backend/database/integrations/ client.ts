import { PrismaClient } from "@prisma/client";
import { wrapGetApplicationIntegrations, wrapGetIntegration } from "./getIntegration";
import { wrapAddIntegration } from "./addIntegration";
import { wrapDeleteIntegration } from "./deleteIntegration";

export const IntegrationClient = (client: PrismaClient['applicationIntegration']) => {
  const getIntegration = wrapGetIntegration(client);
  const getAllApplicationIntegrations = wrapGetApplicationIntegrations(client);
  const deleteIntegration = wrapDeleteIntegration(client);
  const addIntegration = wrapAddIntegration(client);

  return {
    getIntegration,
    getAllApplicationIntegrations,
    deleteIntegration,
    addIntegration
  }
}