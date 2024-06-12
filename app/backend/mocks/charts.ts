import { ApplicationSprint, GeneratedTask } from "@prisma/client";

export const mockBarChartdata = [
  {
    name: 'Bugs',
    total: 5,
    incomplete: 2,
    completed: 3,
  },
  {
    name: 'Features',
    total: 6,
    incomplete: 1,
    completed: 5,
  },
  {
    name: 'Chores',
    total: 3,
    incomplete: 0,
    completed: 3,
  },
  {
    name: 'Others',
    total: 2,
    incomplete: 1,
    completed: 1,
  },
];


export const mockSprintTaskTotalData: Array<{name: string, taskCount: number}> = [
  {
    name: 'Sprint 1',
    taskCount: 12,
  },
  {
    name: 'Sprint 2',
    taskCount: 20,
  },
  {
    name: 'Sprint 3',
    taskCount: 8,
  },
  {
    name: 'Sprint 4',
    taskCount: 15,
  },
  {
    name: 'Sprint 5',
    taskCount: 10,
  },
  {
    name: 'Sprint 6',
    taskCount: 12,
  },
];

export const mockSprintTaskCompletionPercentageData: Array<{name: string, percentage: number}> = [
  {
    name: 'Sprint 1',
    percentage: 92,
  },
  {
    name: 'Sprint 2',
    percentage: 85,
  },
  {
    name: 'Sprint 3',
    percentage: 100,
  },
  {
    name: 'Sprint 4',
    percentage: 78,
  },
  {
    name: 'Sprint 5',
    percentage: 55,
  },
  {
    name: 'Sprint 6',
    percentage: 30,
  },
];


export function createSprintTaskTotalsChartData(data: Array<{name: string, taskCount: number}>): Array<{name: string, taskCount: number}> {
  return data.map(entry => {
    return {
      name:`Sprint ${entry.name}`,
      taskCount: entry.taskCount,
    }
  })
}

export function createSprintTaskCompletionPercentageChartData(data: Array<{name: string, completed: number, total: number}>): Array<{name: string, completed: number}> {
  return data.map(entry => {
    console.log(entry)
    return {
      name:`Sprint ${entry.name}`,
      completed: entry.completed,
    }
  })
}

export function createCurrentSprintChartsData(data: GeneratedTask[]) {
  const taskTotals = {
    bugs: 0,
    features: 0,
    chores: 0,
    other: 0,
  }

  data.forEach(task => {
    switch(task.category) {
      case 'bug':
        taskTotals.bugs += 1;
        break;
      case 'feature':
        taskTotals.features += 1;
        break;
      case 'chore':
        taskTotals.chores += 1;
        break;
      default:
        taskTotals.other += 1;
    }
  })

  const chartData: {name: string, total: number, incomplete: number, completed: number}[] = Object.entries(taskTotals).map(([category,count]) => {
    return {
      name: category,
      total: count,
      // right now we don't have a way to determine if a task is completed or not
      incomplete: count,
      completed: 0,
    }
  })
  return chartData;
}