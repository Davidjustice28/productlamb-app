import { PrismaClient } from "@prisma/client";
import { wrapGetAllApplicationRepositories, wrapGetApplicationRepository } from "./getRepository";
import { wrapDeleteApplicationRepository, wrapDeleteAllApplicationRepositories } from "./deleteRepository";
import { wrapAddApplicationRepository } from "./addRepository";
import { wrapUpdateApplicationRepository } from "./updateRepository";

export const CodeRepositoryInfoClient = (client: PrismaClient['applicationCodeRepositoryInfo']) => {
  const getRepository = wrapGetApplicationRepository(client)
  const getAllApplicationRepositories = wrapGetAllApplicationRepositories(client)
  const deleteRepository = wrapDeleteApplicationRepository(client)
  const deleteAllApplicationRepositories = wrapDeleteAllApplicationRepositories(client)
  const addRepository = wrapAddApplicationRepository(client)
  const updateRepositoryInfo = wrapUpdateApplicationRepository(client)
  return {
    getRepository,
    getAllApplicationRepositories,
    deleteRepository,
    deleteAllApplicationRepositories,
    addRepository,
    updateRepositoryInfo
  }
}