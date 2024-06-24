import { ApplicationSuggestion } from "@prisma/client";

export const mockSuggestions: Array<ApplicationSuggestion> = [
  {
    id: 0,
    suggestion: "You have been completing mostly features. Try to work on some bugs to create a better platform for users",
    applicationId: 1,
  },
  {
    id: 1,
    suggestion: "Typically, the team completes about 5 tasks a sprint. Try to increase that to 6 or 7 to increase your productivity",
    applicationId: 1,
  },
  {
    id: 2,
    suggestion: "You are regularly not completing 60% of your tasks. You may want to lower the workload for the next sprint ",
    applicationId: 1,
  },
]