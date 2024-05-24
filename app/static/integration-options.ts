import { PrismaClient } from "@prisma/client";
import { IntegrationClient } from "~/backend/database/integrations/ client";
import { TypeformClient } from "~/backend/integrations/feedback/typeform";
import { IntegrationOptions } from "~/types/component.types";

export const availableIntegrations: Array<IntegrationOptions>= [
  {
    id: 0,
    name: "discord",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/discord.svg',
    description: 'Get updates on various events related to sprints on your Discord server and notify your audience of changes in open source projects.',
    requiredFields: {
      
    },
    available: false,
    onAdd: null
  },
  {
    id: 1,
    name: "slack",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/slack.svg',
    description: 'Get updates on various events related to sprints on your Slack workspace.',
    requiredFields: {
      
    },
    available: false,
    onAdd: null
  },
  {
    id: 2,
    name: "google calendar",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/google-calendar.svg',
    description: 'See when sprints start and when they end on your Google Calendar.',
    requiredFields: {
      
    },
    available: false,
    onAdd: null
  },
  {
    id: 3,
    name: "gmail",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/gmail.svg',
    description: 'ProductLamb will send updates related to sprints to your Gmail mailbox.',
    requiredFields: {
      
    },
    available: false,
    onAdd: null
  },
  {
    id: 5,
    name: "google drive",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/google-drive.svg',
    description: 'File storage and synchronization service developed by Google.',
    requiredFields: {

    },
    available: false,
    onAdd: null
  },
  {
    id: 6,
    name: "google sheets",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/google-sheets.svg',
    description: 'Export and import your data to and from Google sheets for easy access and analysis.',
    requiredFields: {

    },
    available: false,
    onAdd: null
  },
  {
    id: 7,
    name: "google forms",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/google-forms.svg',
    description: 'Pull user feedback and data from Google Forms.',
    requiredFields: {

    },
    available: false,
    onAdd: null
  },
  {
    id: 8,
    name: "excel",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/file-type-excel.svg',
    description: 'Integrate to import/export data anytime to/from excel sheets.',
    requiredFields: {

    },
    available: false,
    onAdd: null
  },
  {
    id: 9,
    name: "typeform",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/typeform.svg',
    description: 'Pull user feedback and data from Typeform.',
    requiredFields: {
      api_token: { label: 'API Token', type: 'password'},
      typeform_form_id: { label: 'Form ID', type: 'text'}
    },
    available: true,
    onAdd: async (client: PrismaClient['applicationIntegration'], form_id: string, api_token: string, application_id: number) => {
      const integrationClient = IntegrationClient(client)
      const typeform = new TypeformClient(api_token, form_id)
      const webhook = await typeform.createWebhook(`https://productlamb.com/api/feedback/${application_id}`, 'productlamb-webhook')
      return webhook.id!
    }
  },
    {
    id: 10,
    name: "jotform",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/jotform.svg',
    description: 'Pull user feedback and data from Jotform.',
    requiredFields: {

    },
    available: false,
    onAdd: null
  }
]