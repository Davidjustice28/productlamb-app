export interface Sprint {
  id: number,
  name: string,
  startDate: string,
  endDate: string,
  tasks: number,
  status: 'In Progress' | 'Completed' | 'Under Construction' | 'Canceled',

}
export const mockSprints: Array<Sprint> = [
  {
    id: 4,
    name: "Sprint 5",
    startDate: "2021-03-01",
    endDate: "2021-03-15",
    tasks: 5,
    status: 'Under Construction'
  },
  {
    id: 3,
    name: "Sprint 4",
    startDate: "2021-02-16",
    endDate: "2021-02-28",
    tasks: 5,
    status: 'Canceled'
  },
  {
    id: 2,
    name: "Sprint 3",
    startDate: "2021-02-01",
    endDate: "2021-02-15",
    tasks: 5,
    status: 'Completed'
  },
  {
    id: 1,
    name: "Sprint 2",
    startDate: "2021-01-16",
    endDate: "2021-01-30",
    tasks: 5,
    status: 'Completed'
  },
  {
    id: 0,
    name: "Sprint 1",
    startDate: "2021-01-01",
    endDate: "2021-01-15",
    tasks: 5,
    status: 'Completed'
  },
]