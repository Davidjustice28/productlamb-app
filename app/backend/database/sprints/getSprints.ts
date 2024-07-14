import { ApplicationSprint, PrismaClient } from "@prisma/client";
import { BaseResponse } from "~/types/base.types";



export function wrapGetAllApplicationSprints(client: PrismaClient['applicationSprint']) {
  return getAllApplicationSprints

  async function getAllApplicationSprints(application_id: number) {
    try {
      const sprints =(await client.findMany({where: {applicationId: application_id}, include: {GeneratedTask: true}}))
      return {data: sprints, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}

export function wrapGetSprintById(client: PrismaClient['applicationSprint']) {
  return getApplicationById

  async function getApplicationById(application_id: number): Promise<BaseResponse<ApplicationSprint>> {
    try {
      const sprints = await client.findUnique({where: {id: application_id}})
      if (!sprints) {
        return {data: undefined, errors: [2]}
      }
      return {data: sprints, errors: []}
    } catch (e) {
      return {data: undefined, errors: [1]}
    }
  }
}