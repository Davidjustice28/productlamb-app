export interface Feedback {
  id: number,
  comment: string,
  acknowledged: boolean,
  type: 'manual' | 'integration' | 'csv',
  uploaded_date: string,
  creator_name: string
  source_img?: string
  source_icon?: string
}

export const mockFeedback: Array<Feedback> = [
  {
    id: 0,
    comment: "The site looks amazing, but the login page is not working. It would be nice to just user OAuth or single sign-on",
    acknowledged: false,
    type: 'integration',
    uploaded_date: "2024-03-01",
    creator_name: 'John Doe',
    source_img: 'https://storage.googleapis.com/product-lamb-images/mobile-app-icon%402x.png'
  },
  {
    id: 1,
    comment: 'Wish I could upload feedback from a csv or excel file. I have a lot of feedback to upload',
    acknowledged: false,
    type: 'integration',
    uploaded_date: "2024-03-17",
    creator_name: 'Paul Smith',
    source_img: 'https://storage.googleapis.com/talo_profile_images/IMG_4465.jpg'
  },
  {
    id: 2,
    comment: 'Loving the easy setup process. Would love to see more integrations with other project management tools like Asana and Trello',
    acknowledged: false,
    type: 'manual',
    uploaded_date: "2024-03-22",
    creator_name: 'Linda Johnson',
  },
  {
    id: 3,
    comment: 'Would love to see a mobile app for this platform. I am always on the go and would love to be able to access my feedback on my phone',
    acknowledged: false,
    type: 'manual',
    uploaded_date: "2024-04-07",
    creator_name: 'Bobby Brown',
  }, 
  {
    id: 5,
    comment: 'The platform could use more documentation. I am having trouble setting up my account and would love to see a step-by-step guide',
    acknowledged: false,
    type: 'manual',
    uploaded_date: "2024-04-12",
    creator_name: 'Jessica White',
  }
]