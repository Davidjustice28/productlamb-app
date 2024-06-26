import { GeneratedTask, PrismaClient } from "@prisma/client"

export type PLButtonIcons = string | 'ri-add-line' | 'ri-equalizer-line' | 'ri-pencil-line' | 'ri-delete-bin-line' | 'ri-archive-line' | 'ri-restore-line' | 'ri-check-line' | 'ri-close-line' | 'ri-information-line' | 'ri-external-link-line' | 'ri-arrow-up-line' | 'ri-arrow-down-line' | 'ri-arrow-left-line' | 'ri-arrow-right-line' | 'ri-arrow-up-line' | 'ri-arrow-down-line' | 'ri-arrow-left-line' | 'ri-arrow-right-line' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-s-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-s-fill' | 'ri-arrow-right-s-fill' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-s-fill' | 'ri-arrow-down-s-fill' | 'ri-arrow-left-s-fill' | 'ri-arrow-right-s-fill' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-s-fill' | 'ri-arrow-down-s-fill' | 'ri-arrow-left-s-fill' | 'ri-arrow-right-s-fill' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-s-fill' | 'ri-arrow-down-s-fill' | 'ri-arrow-left-s-fill' | 'ri-arrow-right-s-fill' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-s-fill' | 'ri-arrow-down-s-fill' | 'ri-arrow-left-s-fill' | 'ri-arrow-right-s-fill' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-s-fill' | 'ri-arrow-down-s-fill' | 'ri-arrow-left-s-fill' | 'ri-arrow-right'

export interface PLBasicButtonProps {
  icon?: PLButtonIcons
  iconSide?: 'left' | 'right'
  iconColorClass?: string
  text: string
  onClick?: () => void
  colorClasses?: string
  rounded?: boolean
  disabled?: boolean
  useStaticWidth?: boolean
  noDefaultDarkModeStyles?: boolean
}

export interface PLLabelButtonProps {
  icon: PLButtonIcons
  text: string
  onClick?: () => void
  colorClasses?: string
  rounded?: boolean
  img?: string
}

export interface PLIconButtonProps {
  icon: PLButtonIcons
  onClick?: (...args:any[]) => void
  colorClasses?: string
}

export interface PLTableProps<T> {
  data: Array<T>
  columns?: Array<{key: string, type: "text" | "status" | "image"| "date", sortable?: boolean}>
  actionsAvailable?: boolean
  checked: Array<number>
  columnsVisible?: boolean
  component?: React.ComponentType<{data: T}>
  tableModalName?: string
  onCheck?: (ids: Array<number>) => void
}

export interface PLAddBugModalProps {
  open: boolean,
  onClose: () => void,
  setOpen: (open: boolean) => void
}


export interface IntegrationOptions{
  id: number, 
  name: string, 
  img_url: string, 
  description: string, 
  requiredFields: {[field:string]: {label: string, placeholder?: string, type: React.HTMLInputTypeAttribute }},
  available: boolean
}

export interface PLSelectorModalOption<T=any> {
  name: string,
  iconClass?: string,
  logo_url?: string
  value: T
  available: boolean
}

export type ManualTaskData = Pick<GeneratedTask, 'title'|'description'| 'reason'| 'category'> & {id: number, points: string}


export enum FeedbackIntegrations {
  TYPEFORM = 'typeform',
  JOTFORM = 'jotform',
  GOOGLE_FORMS = 'google forms'
}

export interface PLChartProps {
  data: Array<any>;
  darkMode?: boolean;
}