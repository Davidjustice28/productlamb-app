import { PrismaClient } from "@prisma/client"
import { wrapAddApplicationGoal, wrapAddApplicationGoals } from "./addGoals"
import { wrapGetApplicationGoals } from "./getGoals"
import { wrapDeleteApplicationGoal, wrapDeleteApplicationGoals } from "./deleteGoals"
import { wrapUpdateApplicationGoals } from "./updateApplicationGoals"


export const ApplicationGoalsClient = (client: PrismaClient['applicationGoal']) => {
  const addGoal = wrapAddApplicationGoal(client)
  const getGoals = wrapGetApplicationGoals(client)
  const addMultipleGoals = wrapAddApplicationGoals(client)
  const deleteGoal = wrapDeleteApplicationGoal(client)
  const deleteGoals = wrapDeleteApplicationGoals(client)
  const updateApplicationGoals = wrapUpdateApplicationGoals(addMultipleGoals, deleteGoals)
  return {
    addGoal,
    getGoals,
    addMultipleGoals,
    deleteGoal,
    deleteGoals,
    updateApplicationGoals
  }
}
