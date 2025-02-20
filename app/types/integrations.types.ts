

export interface GithubIssueData {
  url: string, 
  repository_url: string, 
  title: string, 
  number: number, 
  body?:string|null,
  user?: string
}

export interface TypeformFeedbackPayload {
  event_id: string;
  event_type: string;
  form_response: TypeformApiFormResponse;
}

interface TypeformApiFormResponse {
  form_id: string;
  token: string;
  submitted_at: string;
  landed_at: string;
  calculated: {
    score: number;
  };
  variables: TypeformVariable[];
  hidden: {
    user_id: string;
  };
  definition: TypeformDefinition;
  answers: TypeformAnswer[];
  ending: {
    id: string;
    ref: string;
  };
}

interface TypeformVariable {
  key: string;
  type: string;
  number?: number;
  text?: string;
}

interface TypeformDefinition {
  id: string;
  title: string;
  fields: TypeformField[];
  endings: TypeformEnding[];
}

interface TypeformField {
  id: string;
  title: string;
  type: string;
  ref: string;
  allow_multiple_selections: boolean;
  allow_other_choice: boolean;
  choices?: TypeformChoice[];
  properties?: any; // for handling properties in "calendly" type
}

interface TypeformChoice {
  id: string;
  ref: string;
  label: string;
}

interface TypeformEnding {
  id: string;
  ref: string;
  title: string;
  type: string;
  properties: {
    button_text: string;
    show_button: boolean;
    share_icons: boolean;
    button_mode: string;
  };
}

interface TypeformAnswer {
  type: string;
  text?: string;
  email?: string;
  date?: string;
  number?: number;
  boolean?: boolean;
  url?: string;
  field: {
    id: string;
    type: string;
  };
  choices?: {
    ids: string[];
    labels: string[];
    refs: string[];
  };
  choice?: {
    id: string;
    label: string;
    ref: string;
  };
}

export interface BaseIntegrationSetupFormData {
  integration_name: string
}

export interface TypeformIntegrationSetupFormData extends BaseIntegrationSetupFormData {
  integration_name: 'Typeform'
  api_token: string
  typeform_form_id: string
}

export interface GithubIntegrationSetupFormData extends BaseIntegrationSetupFormData {
  integration_name: 'Github'
  api_token: string
  repo_name: string
  repo_owner: string
}

export interface GitlabIntegrationSetupFormData extends BaseIntegrationSetupFormData {
  integration_name: 'Gitlab'
  api_token: string
  project_id: number
}

export interface TypeformIntegrationMetaData {
  tag_name: string
  form_id: string
  webhook_id?: string
}


export interface TypeformFormResponseEntry {
  answers: Array<
    | {
        field: {
          id: string;
          ref: string;
          type: 'dropdown' | 'short_text' | 'long_text' | 'email' | 'number' | 'rating' | 'opinion_scale' | 'date' | 'picture_choice' | 'ranking' | 'multiple_choice' | 'file_upload' | 'legal' | 'yes_no';
        };
        type: 'text' | 'boolean' | 'email' | 'number' | 'choices' | 'date' | 'choice' | 'file_url';
        text?: string;
        boolean?: boolean;
        number?: number;
        choices?: {
          labels: string[];
        };
        choice?: {
          label: string;
        };
        date?: string;
        file_url?: string;
      }
  >;
  calculated: {
    score: number;
  };
  hidden: Record<string, unknown>;
  landed_at: string;
  landing_id: string;
  metadata: {
    browser: string;
    network_id: string;
    platform: string;
    referer: string;
    user_agent: string;
  };
  response_id: string;
  submitted_at: string;
  token: string;
  variables: Array<{
    key: string;
    type: 'number' | 'text';
    number?: number;
    text?: string;
  }>;
}

export interface TypeformWebhookEntry {
  created_at: string;
  enabled: boolean;
  form_id: string;
  id: string;
  tag: string;
  updated_at: string;
  url: string;
  verify_ssl: boolean;
}
export interface TypeformListResponse<T=any>{
  items: Array<T>;
  page_count: number;
  total_items: number;
}