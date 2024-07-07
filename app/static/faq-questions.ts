import { FAQQuestion } from "~/types/base.types"

export const generalQuestions: FAQQuestion[] = [
  {
    question: "What is the purpose of ProductLamb?",
    answer: "ProductLamb is a product management tool that automates tedious tasks related to agile project management including planning, analysis, and tracking development progress. It manages your preferred project management tool, so you can focus on building great products." 
  }, 
  {
    question: "Who is ProductLamb for?",
    answer: "ProductLamb is for early stage startups and dev shops with small developer teams looking to prioritize planning, organization, and efficient development cycles. We believe it will provide the best value to teams of 3-20."
  },
  {
    question: "What is a good sprint duration?",
    answer: "The ideal sprint duration is 2 weeks. This allows for enough time to complete tasks, but not so much time that the team loses focus."
  },
  {
    question: "Is ProductLamb only for managing 1 piece of software?",
    answer: "Technically, no. ProductLamb is designed to help manage multiple applications, whether that is one product with multiple repositories or multiple products, is up to you."
  },
  {
    question: "What project management tools does ProductLamb integrate with?",
    answer: "ProductLamb integrates with Notion, ClickUp, and Jira. Coming soon: Asana, Trello, and Github Projects."
  }
]

export const troubleshootingQuestions: FAQQuestion[] = [
  {
    question: "I only see setup and log out tabs in the sidebar.",
    answer: 'You may have not finished setting up your account. Make sure to click "Finished Setup" button. If you have already done this, try refreshing the page or logging out. You may have some outdated cookies.'
  },
  {
    question: "Team member invite send button is disabled.",
    answer: "We allow you to invite up to 5 team members. In the near future, we will allow you to invite more team members."
  },
  {
    question: "The charts on my dashboard say no data. How do I analyze my teams performance?",
    answer: "Make sure you have started your first sprint. Chart related metrics like completion rate, only show after 2 sprints have been started. But you can still see details related to your current sprint at the bottom of the dashboard."
  },
  {
    question: "Looks like I keep being given the task suggestion related to feedback I already addressed.",
    answer: "Go to feedback page, select the feedback you have already addressed, and click the 'sleep' icon button. This will ignore the feedback and you will not be given the task suggestion related to it."
  },
  {
    question: "I can't access my account settings or team page.",
    answer: 'Only the account admin can access these pages. If you are the account admin and still can\'t access these pages, try refreshing the page or logging out. You may have some outdated cookies. Otherwise ask your account admin to give you admin permissions.'
  }
]

export const featuresQuestions: FAQQuestion[] = [
  {
    question: "What is the difference between bugs and backlog? Some backlog items have a bug category.",
    answer: "Bugs are just for tracking issues know that are currently affecting your product. Backlog items are tasks that you know you want to do, but at the moment are not a priority. If a backlog item has a bug category, it means that the backlog item is related to a bug that you have already identified."
  },
  {
    question: "Can I switch between applications?",
    answer: "Absolutely! You can switch between applications by clicking the star icon button next to the application name on the application page. By default on login we select the first application you created."
  },
  {
    question: "What if I want to switch from a project management tool to another?",
    answer: "Currently you can only switch between project management tools when you create a new application. We are working on a feature that will allow you to switch between project management tools for an existing application."
  },
  {
    question: `What are Suggestion Actions?`,
    answer: 'ProductLamb analyzes your previous sprint statistics and gives 4 suggestions each sprint on things you can do to improve your team\'s performance and planning process.'
  },
  {
    question: "I have feature I really need or want? How do I get in touch?",
    answer: "If you have a feature suggestion or bug to report, please reach out! You can email us at support@productlamb.com and we will get back to you as soon as we can. A response can be expected with 24-72 hours."
  }
]