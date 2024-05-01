export interface User {
  id: number,
  name: string,
  email: string,
  role: string,
  date_added: string,
  type: "owner" | "admin" | "user",
  active: boolean,
  image?: string
}

export const mockUsers: Array<User> = [
  {
    id: 0,
    name: "David Justice",
    email: "davidjustice28@gmail.com",
    role: "Founder",
    date_added: "2021-04-28",
    type: "owner",
    active: true,
    image: "https://storage.googleapis.com/talo_profile_images/IMG_4465.jpg"
  },
  {
    id: 1,
    name: "Lina Justice",
    email: "saveligaf@gmail.com",
    role: "Beta Tester",
    date_added: "2021-04-28",
    type: "user",
    active: true,
  },{
    id: 2,
    name: "Christian Wilson",
    email: "christian@email.com",
    role: "Beta Tester",
    date_added: "2021-04-28",
    type: "user",
    active: false,
  }
]