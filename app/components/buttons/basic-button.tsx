import { PLBasicButtonProps } from "~/types/component.types";

export function PLBasicButton({rounded=false, icon="", text, onClick, colorClasses, disabled=false, useStaticWidth, noDefaultDarkModeStyles, iconSide= 'left', iconColorClass=''}: PLBasicButtonProps) {
  const defaultColorClasses = "bg-gray-300 text-gray-800 group" + (noDefaultDarkModeStyles ? ' ' : ' dark:bg-neutral-800 dark:text-neutral-400 ') + (disabled ? ' cursor-not-allowed opacity-50' : ' cursor-pointer hover:bg-gray-400 dark:hover:bg-neutral-900');
 
  return (
    <button className={defaultColorClasses + " font-bold py-2 px-4 inline-flex items-center " + (rounded ? ' rounded-xl ' : ' rounded ' ) + (colorClasses ? ' ' + colorClasses : '') + (useStaticWidth ? ' w-40 text-center' : '')} onClick={onClick} disabled={disabled}>
      {icon.length && iconSide === 'left' ? <i className={icon + " mr-2 " + iconColorClass}></i> : null}
      <span className={(useStaticWidth ? 'mx-auto' : '')}>{text}</span>
      {icon.length && iconSide === 'right' ? <i className={icon + " ml-2 " + iconColorClass}></i> : null}
    </button>
  )
}