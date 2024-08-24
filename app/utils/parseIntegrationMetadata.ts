import { PLAvailableIntegrationNames } from "~/types/database.types";
import { TypeformIntegrationMetaData } from "~/types/integrations.types";

export function parseIntegrationMetadata(metadata: string, integrationName: PLAvailableIntegrationNames) {
  switch (integrationName) {
    case 'typeform':
      return JSON.parse(metadata) as TypeformIntegrationMetaData;
    default:
      return JSON.parse(metadata) as { [key: string]: any};
  }
}