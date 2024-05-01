export type PLButtonIcons = string | 'ri-add-line' | 'ri-equalizer-line' | 'ri-pencil-line' | 'ri-delete-bin-line' | 'ri-archive-line' | 'ri-restore-line' | 'ri-check-line' | 'ri-close-line' | 'ri-information-line' | 'ri-external-link-line' | 'ri-arrow-up-line' | 'ri-arrow-down-line' | 'ri-arrow-left-line' | 'ri-arrow-right-line' | 'ri-arrow-up-line' | 'ri-arrow-down-line' | 'ri-arrow-left-line' | 'ri-arrow-right-line' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-s-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-s-fill' | 'ri-arrow-right-s-fill' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-s-fill' | 'ri-arrow-down-s-fill' | 'ri-arrow-left-s-fill' | 'ri-arrow-right-s-fill' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-s-fill' | 'ri-arrow-down-s-fill' | 'ri-arrow-left-s-fill' | 'ri-arrow-right-s-fill' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-s-fill' | 'ri-arrow-down-s-fill' | 'ri-arrow-left-s-fill' | 'ri-arrow-right-s-fill' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-s-fill' | 'ri-arrow-down-s-fill' | 'ri-arrow-left-s-fill' | 'ri-arrow-right-s-fill' | 'ri-arrow-up-fill' | 'ri-arrow-down-fill' | 'ri-arrow-left-fill' | 'ri-arrow-right-fill' | 'ri-arrow-up-s-fill' | 'ri-arrow-down-s-fill' | 'ri-arrow-left-s-fill' | 'ri-arrow-right'

export interface PLBasicButtonProps {
  icon?: PLButtonIcons
  text: string
  onClick?: () => void
  colorClasses?: string
}

export interface PLIconButtonProps {
  icon: PLButtonIcons
  onClick?: () => void
  colorClasses?: string
}