import { ReactElement } from "react"

export interface BaseResponse<T=any> {
  errors: number[]
  data?: T
}

export interface NavLink {
  // Remix icon library class
  iconClass: string
  absoluteHref: string
  text: string
  adminOnly?: boolean
  internalOnly?: boolean
}

export enum Colors {
  GREEN = 'green',
  BLUE = 'blue',
  RED = 'red',
  YELLOW = 'yellow',
  GRAY = 'gray',
  ORANGE = 'orange',
  PURPLE = 'purple',
  PINK = 'pink',
  BLACK = 'black',
  WHITE = 'white'
}

export interface TableColumn {
  key: string,
  label?: string,
  type: "text" | "status" | "image" | "date" | "link",
  sortable?: boolean
  capitalize?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export interface FAQQuestion {
  question: string;
  answer: string;
}
export type ReactFunctionComponent = (...args: Array<any>) => JSX.Element

export interface ModalContextType {
  open: boolean
  title: string
  setModalOpen: (open: boolean) => void
  component: React.FC<any>
  setTitle: (title: string) => void
  setComponent: any

}