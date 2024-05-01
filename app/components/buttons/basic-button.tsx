import { PLBasicButtonProps } from "~/types/component.types";

export function PLBasicButton({icon="", text, onClick, colorClasses="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-neutral-800 dark:hover:bg-neutral-900 dark:text-neutral-400 "}: PLBasicButtonProps) {
  return (
    <button className={colorClasses + " font-bold py-2 px-4 rounded inline-flex items-center"} onClick={onClick}>
      <i className={icon + " mr-2"}></i>
      <span>{text}</span>
    </button>
  )
}