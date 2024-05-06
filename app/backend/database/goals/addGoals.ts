import { NewApplicationData } from '~/types/database.types'
import { BaseResponse } from '../../../types/base.types'
import { PrismaClient, Account, AccountApplication, ApplicationGoal } from '@prisma/client'

export function wrapAddApplicationGoal(client: PrismaClient['applicationGoal']) {
  return addApplicationGoal

  async function addApplicationGoal(application_id: number, goal: string, isLongTerm: boolean ): Promise<BaseResponse<ApplicationGoal>> {
    try {
      const entry = await client.create({data: {
        applicationId: application_id,
        goal,
        isLongTerm
      }})
      return {data: entry, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}

export function wrapAddApplicationGoals(client: PrismaClient['applicationGoal']) {
  return addApplicationGoals

  async function addApplicationGoals(application_id: number, goals: Array<{goal: string, isLongTerm: boolean}>): Promise<BaseResponse<Array<ApplicationGoal>>> {
    try {
      await client.createMany({data: goals.map(item => ({
        applicationId: application_id,
        goal: item.goal,
        isLongTerm: item.isLongTerm
      }))})
      const entries = await client.findMany({where: {applicationId: application_id}})
      return {data: entries, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}

