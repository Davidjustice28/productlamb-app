import { PrismaClient } from "@prisma/client"
import { wrapGetAllBugs, wrapGetBugById } from "./getBugs"
import { wrapCreateBug, wrapCreateManyBugs } from "./createBug"
import { wrapDeleteBug, wrapDeleteBugs } from "./deleteBugs"

export const ApplicationBugsClient = (client: PrismaClient['applicationBug']) => {
  const getAllBugs = wrapGetAllBugs(client)
  const getBugById = wrapGetBugById(client)
  const createBug = wrapCreateBug(client)
  const createManyBugs = wrapCreateManyBugs(client)
  const deleteBug = wrapDeleteBug(client)
  const deleteBugs = wrapDeleteBugs(client)

  return {
    getAllBugs,
    getBugById,
    createBug,
    createManyBugs,
    deleteBug,
    deleteBugs
  }
}