import { PrismaClient } from "@prisma/client"
import { wrapAddAccountApplication } from "./createApplication"
import { wrapDeleteAccountApplication } from "./deleteApplication"
import { wrapGetAccountApplications } from "./getApplications"

export const ApplicationsClient = (client: PrismaClient['accountApplication']) => {
  const addApplication = wrapAddAccountApplication(client)
  const deleteApplication = wrapDeleteAccountApplication(client)
  const getAccountApplications = wrapGetAccountApplications(client)
  return  {
    addApplication,
    deleteApplication,
    getAccountApplications
  }
}
