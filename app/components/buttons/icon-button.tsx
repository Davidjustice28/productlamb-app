import { PLIconButtonProps } from "~/types/component.types";

export function PLIconButton({ icon, onClick, colorClasses='bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-neutral-800 dark:hover:bg-neutral-900 dark:text-neutral-400 ' }: PLIconButtonProps) {
  return (
    <button onClick={onClick} className={`flex flex-row justify-center items-center gap-2 rounded-full p-4 w-5 h-5 ${colorClasses}`}>
      <i className={icon + ' inline-block'}></i>
    </button>
  )
}