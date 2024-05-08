import { IntegrationOptions } from "~/types/component.types";

export const availableIntegrations: Array<IntegrationOptions>= [
  {
    id: 0,
    name: "Discord",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/discord.svg',
    description: 'Get updates on various events related to sprints on your Discord server and notify your audience of changes in open source projects.',
    requiredFields: {
      
    }
  },
  {
    id: 1,
    name: "Slack",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/slack.svg',
    description: 'Get updates on various events related to sprints on your Slack workspace.',
    requiredFields: {
      
    }
  },
  {
    id: 2,
    name: "Google Calendar",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/google-calendar.svg',
    description: 'See when sprints start and when they end on your Google Calendar.',
    requiredFields: {
      
    }
  },
  {
    id: 3,
    name: "Gmail",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/gmail.svg',
    description: 'ProductLamb will send updates related to sprints to your Gmail mailbox.',
    requiredFields: {
      
    }
  },
  {
    id: 5,
    name: "Google Drive",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/google-drive.svg',
    description: 'File storage and synchronization service developed by Google.',
    requiredFields: {

    }
  },
  {
    id: 6,
    name: "Google Sheets",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/google-sheets.svg',
    description: 'Export and import your data to and from Google sheets for easy access and analysis.',
    requiredFields: {

    }
  },
  {
    id: 7,
    name: "Google Forms",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/google-forms.svg',
    description: 'Pull user feedback and data from Google Forms.',
    requiredFields: {

    }
  },
  {
    id: 8,
    name: "Excel",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/file-type-excel.svg',
    description: 'Integrate to import/export data anytime to/from excel sheets.',
    requiredFields: {

    }
  },
  {
    id: 9,
    name: "Typeform",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/typeform.svg',
    description: 'Pull user feedback and data from Typeform.',
    requiredFields: {

    },
  },
    {
    id: 10,
    name: "Jotform",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/jotform.svg',
    description: 'Pull user feedback and data from Jotform.',
    requiredFields: {

    }
  }
]