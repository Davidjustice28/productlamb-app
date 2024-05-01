export type PlatformEvent = {
  id: number,
  type: string,
  originator: string,
  date: string,
  description: string,
  creator_img_url: string

}

export const mockEvents: Array<PlatformEvent> = [
  {
    id: 0,
    type: "integration",
    originator: "Github",
    date: "2021-03-01",
    description: "New issue created in repository",
    creator_img_url: 'https://storage.googleapis.com/product-lamb-images/github-mark.png'
  },
  {
    id: 1,
    type: "task",
    originator: "@davidjustice",
    date: "2021-03-17",
    description: "Task 164 assigned to user",
    creator_img_url: 'https://storage.googleapis.com/product-lamb-images/user-circle.svg'
  },
  {
    id: 3,
    type: "task",
    originator: "Notion",
    date: "2021-03-01",
    description: "Task with id 1423425g3t3443sgf updated by user",
    creator_img_url: 'https://storage.googleapis.com/product-lamb-images/notion.svg'
  },
  {
    id: 2,
    type: "platform",
    originator: "ProductLamb",
    date: "2021-03-19",
    description: "All task done. Sprint 12 marked as completed.",
    creator_img_url: 'https://storage.googleapis.com/product-lamb-images/tasks.svg'
  },
  {
    id: 7,
    type: "task",
    originator: "@davidjustice",
    date: "2021-03-17",
    description: "Task 59 assigned to user",
    creator_img_url: 'https://storage.googleapis.com/product-lamb-images/user-circle.svg'
  },
  {
    id: 6,
    type: "integration",
    originator: "Github",
    date: "2021-03-01",
    description: "New issue created in repository",
    creator_img_url: 'https://storage.googleapis.com/product-lamb-images/github-mark.png'
  },
]