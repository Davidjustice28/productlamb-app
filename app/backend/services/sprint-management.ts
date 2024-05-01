import { GeneratedInitiative } from "@prisma/client";
import { BaseResponse } from "~/types/base.types";



export class SprintManagementService {
  public generateInitiativeSuggestions(applicationId: number, goals: Array<any> = [], bugs: Array<any> = [], feedback: Array<any> = []): BaseResponse<Pick<GeneratedInitiative, "description"|"applicationId">[]> {
    
    return {
      errors: [],
      data: [
        {
          description: "A new feature that allows users to upload images",
          applicationId
        },
      ]
    }
  }
}