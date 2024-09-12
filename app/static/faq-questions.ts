import { FAQQuestion } from "~/types/base.types"

export const generalQuestions: FAQQuestion[] = [
  {
    question: "What does ProductLamb actually do?",
    answer: "ProductLamb is a product management platform that 1) provides an ai product manager that can do things on your behalf and 2) automates tedious tasks related to agile project management including planning, analysis, and tracking development progress." 
  }, 
  {
    question: "What is the mission of ProductLamb?",
    answer: "To enabled software companies to build better software faster and to increase the productivity of small software teams."
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
    answer: "ProductLamb integrates with Notion, ClickUp, GitHub Projects, and Jira. Coming soon: Trello."
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
  },
  {
    question: "I want to switch from my current project management tool to another?",
    answer: "Currently you can only switch between project management tools when you create a new application. We are working on a feature that will allow you to switch between project management tools for an existing application."
  },
  
]

export const featuresQuestions: FAQQuestion[] = [
  {
    question: `How do I interact with my product manager?`,
    answer: 'If your account is setup, at the top right of the portal, you will see a "person speaking" icon. Click on it to start a conversation with your product manager.'
  },
  {
    question: "What can my product manager do for me?",
    answer: "Currently, the product manager can answer questions related to your account/portal data, schedule meetings, email team members, create tasks for you in your sprint, add tasks to backlog, and report bugs. More abilities are in development."
  },
  {
    question: "I have put a pause a project, but I want to keep the data. Can I stop sprint generation for this application?",
    answer: "Yes you can. Go to the settings page for the application you want to pause and toggle the 'Sprint Generation' switch. This will stop sprint generation for this application."
  },
  {
    question: "Can I switch between applications?",
    answer: "Absolutely! You can switch between applications by clicking the star icon button next to the application name on the application page. By default on login we select the first application you created."
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