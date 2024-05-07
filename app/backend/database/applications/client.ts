import { PrismaClient } from "@prisma/client"
import { wrapAddAccountApplication } from "./createApplication"
import { wrapDeleteAccountApplication } from "./deleteApplication"
import { wrapGetAccountApplications, wrapGetApplicationById } from "./getApplications"
import { wrapUpdateApplication } from "./updateApplication"

export const ApplicationsClient = (client: PrismaClient['accountApplication']) => {
  const addApplication = wrapAddAccountApplication(client)
  const deleteApplication = wrapDeleteAccountApplication(client)
  const getAccountApplications = wrapGetAccountApplications(client)
  const getApplicationById = wrapGetApplicationById(client)
  const updateApplication = wrapUpdateApplication(client)
  return  {
    addApplication,
    deleteApplication,
    getAccountApplications,
    getApplicationById,
    updateApplication
  }
}
