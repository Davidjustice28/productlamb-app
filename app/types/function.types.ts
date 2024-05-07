import { ApplicationGoal } from "@prisma/client"
import { BaseResponse } from "./base.types"

export type AddApplicationGoals = (application_id: number, goals: Array<{goal: string, isLongTerm: boolean}>) => Promise<BaseResponse<Array<ApplicationGoal>>>
export type DeleteApplicationGoals = (application_id: number, ids?: number[]) => Promise<{data: boolean, errors: number[]}>
