export interface ClickUpNewListData {
  name: string
  content: string 
  due_date: number 
  due_date_time: boolean 
  priority: number 
}

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
