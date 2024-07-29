import { IntegrationOptions } from "~/types/component.types";

export const availableIntegrations: Array<IntegrationOptions>= [
  {
    id: 0,
    name: "GitHub",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/github.svg',
    description: 'Allow ProductLamb to pull issues data from your GitHub repositories.',
    requiredFields: {
      api_token: { label: 'API Token', type: 'password'},
      repo_owner: { label: 'Repository Owner', type: 'text'},
      repo_name: { label: 'Repository Name', type: 'text'}
    },
    available: true,
  },
  {
    id: 1,
    name: 'GitLab',
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/gitlab-icon.svg',
    description: 'Allow ProductLamb to pull issues data from your GitLab repositories.',
    requiredFields: {
      api_token: { label: 'API Token', type: 'password'},
      project_id: { label: 'Project ID', type: 'number'},
    },
    available: true,
  },
  {
    id: 2,
    name: "Slack",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/slack.svg',
    description: 'Get updates on various events related to sprints on your Slack workspace.',
    requiredFields: {
      
    },
    available: false,
  },
  {
    id: 3,
    name: "Google Calendar",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/google-calendar.svg',
    description: 'See when sprints start and when they end on your Google Calendar.',
    requiredFields: {
      
    },
    available: true,
  },
  {
    id: 4,
    name: "Google Forms",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/google-forms.svg',
    description: 'Pull user feedback and data from Google Forms.',
    requiredFields: {
      form_id: { label: 'Form ID', type: 'text'},
    },
    available: true,
  },
  {
    id: 5,
    name: "Excel",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/file-type-excel.svg',
    description: 'Integrate to import/export data anytime to/from excel sheets.',
    requiredFields: {

    },
    available: false,
  },
  {
    id: 6,
    name: "Typeform",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/typeform.svg',
    description: 'Pull user feedback and data from Typeform.',
    requiredFields: {
      api_token: { label: 'API Token', type: 'password'},
      typeform_form_id: { label: 'Form ID', type: 'text'}
    },
    available: true,
  },
  {
    id: 7,
    name: "Jotform",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/jotform.svg',
    description: 'Pull user feedback and data from Jotform.',
    requiredFields: {

    },
    available: false,
  },

  // TODO: Add coming soon integrations and get images from gcloud
  {
    id: 8,
    name: "Posthog",
    img_url: 'https://storage.googleapis.com/productlamb_project_images/posthog-logomark-padded.png',
    description: 'Consider session data and traffic analytics in task suggestions and prioritization.',
    requiredFields: {

    },
    available: false,
  },
  {
    id: 9,
    name: "Plausible",
    img_url: 'https://storage.googleapis.com/productlamb_project_images/idk4lfuNlY_1722221813472.png',
    description: 'Incorporate user session data in task suggestions and prioritization.',
    requiredFields: {

    },
    available: false,
  },
  {
    id: 10,
    name: "Google Drive",
    img_url: 'https://storage.googleapis.com/productlamb-platform-images/google-drive.svg',
    description: 'Allow productlamb to create and store documentation and reports in your Google Drive.',
    requiredFields: {

    },
    available: false,
  },
  {
    id: 11,
    name: "Dropbox",
    img_url: 'https://storage.googleapis.com/productlamb_project_images/dropbox%20(1).svg',
    description: 'Enable productlamb to create and share documentation and reports in your Dropbox.',
    requiredFields: {

    },
    available: false,
  },
]