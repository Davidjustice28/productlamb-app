import { PrismaClient } from "@prisma/client"
import { wrapAddApplicationGoal, wrapAddApplicationGoals } from "./addGoals"
import { wrapGetApplicationGoals } from "./getGoals"


export const ApplicationGoalsClient = (client: PrismaClient['applicationGoal']) => {
  const addGoal = wrapAddApplicationGoal(client)
  const getGoals = wrapGetApplicationGoals(client)
  const addMultipleGoals = wrapAddApplicationGoals(client)
  return {
    addGoal,
    getGoals,
    addMultipleGoals
  }
}
