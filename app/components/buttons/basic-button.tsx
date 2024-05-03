import { PLBasicButtonProps } from "~/types/component.types";

export function PLBasicButton({rounded=false, icon="", text, onClick, colorClasses}: PLBasicButtonProps) {
  const defaultColorClasses = "bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-neutral-800 dark:hover:bg-neutral-900 dark:text-neutral-400 ";
  return (
    <button className={defaultColorClasses + " font-bold py-2 px-4 inline-flex items-center " + (rounded ? ' rounded-xl ' : ' rounded ' ) + (colorClasses ? ' ' + colorClasses : '')} onClick={onClick}>
      {icon.length ? <i className={icon + " mr-2"}></i> : null}
      <span>{text}</span>
    </button>
  )
}