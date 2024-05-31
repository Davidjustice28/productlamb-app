import { PrismaClient } from "@prisma/client"
import { wrapGetAllApplicationSprints, wrapGetSprintById } from "./getSprints"

export const ApplicationSprintsClient = (client: PrismaClient['applicationSprint']) => {
  const getApplicationSprints = wrapGetAllApplicationSprints(client)
  const getSprintById = wrapGetSprintById(client)
  return {
    getApplicationSprints,
    getSprintById
  }
}