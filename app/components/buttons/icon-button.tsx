import { PLIconButtonProps } from "~/types/component.types";

export function PLIconButton({ icon, onClick, colorClasses='bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-neutral-800 dark:hover:bg-neutral-900 dark:text-neutral-400 ', disabled}: PLIconButtonProps) {
  const handleClick = (e: any) => {
    e.preventDefault()
    if (onClick) {
      onClick()
    }
  }
  return (
    <button 
      onClick={(handleClick)}
      disabled={disabled}
      className={`flex flex-row justify-center items-center gap-2 rounded-full p-4 w-5 h-5 ` + colorClasses + (disabled ? ' cursor-not-allowed opacity-50' : ' cursor-pointer hover:bg-gray-400 dark:hover:bg-neutral-900')}
    >
      <i className={icon + ' inline-block'}></i>
    </button>
  )
}