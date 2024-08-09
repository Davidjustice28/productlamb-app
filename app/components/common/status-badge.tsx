import { Colors } from "~/types/base.types"

function getStatusBadgeStyles(color: Colors = Colors.GRAY): string {
  const statusDefaultStyles = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
  const statusStylesMap: {[color: string]: string} = {
    'green': 'bg-green-50 text-green-700 ring-green-600/20',
    'blue': 'bg-blue-50 text-blue-700 ring-blue-700/10',
    'red': 'bg-red-50 text-red-700 ring-red-600/10',
    'yellow': 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
    'gray': 'bg-gray-50 text-gray-700 ring-gray-500/10',
    'orange': 'bg-orange-50 text-orange-700 ring-orange-700/10',
    'purple': 'bg-purple-50 text-purple-700 ring-purple-700/10',
    'pink': 'bg-pink-50 text-pink-700 ring-pink-700/10',
  }
  return statusDefaultStyles + ' ' + statusStylesMap[color]
}

export function PLStatusBadge({color, text, isActive=true, onClick}: {color: Colors, text: string, isActive?: boolean, onClick?: () => void}) {
  const statusStyles = getStatusBadgeStyles(color)
  return <span className={statusStyles + (isActive ? '' : ' opacity-50 ') + (onClick ? ' cursor-pointer' : '')} onClick={onClick}>{text}</span>
}