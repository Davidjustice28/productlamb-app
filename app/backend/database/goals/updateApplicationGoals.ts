import { AddApplicationGoals, DeleteApplicationGoals } from "~/types/function.types";

export function wrapUpdateApplicationGoals(addGoals: AddApplicationGoals, deleteApplicationGoals: DeleteApplicationGoals) {
    return updateApplicationGoals;
    async function updateApplicationGoals(application_id: number, newGoals: Array<{ goal: string, isLongTerm: boolean }>) {
      const deleteResult = await deleteApplicationGoals(application_id);
      if (!deleteResult.data) {
          return { data: false, errors: [1] };
      } else if (deleteResult.errors.length) {
          return { data: false, errors: [...deleteResult.errors, 4] };
      } else {
          return addGoals(application_id, newGoals);
      }
    }
}