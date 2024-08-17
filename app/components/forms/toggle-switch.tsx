import { useLoaderData } from '@remix-run/react'
import { ChangeEventHandler } from 'react'

export const ToggleSwitch = ({onChangeHandler, darkMode, disabled=false}: {darkMode: boolean, onChangeHandler: ChangeEventHandler<HTMLInputElement>, disabled?: boolean} ) => {
  return (
    <label className="relative flex justify-between items-center group p-2 text-xl">
      <input type="checkbox" className={"absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md"} onChange={onChangeHandler} checked={darkMode} disabled={!!disabled}/>
      <span className={"w-11 h-6 flex items-center flex-shrink-0 ml-4 p-1 bg-gray-300 rounded-full duration-300 ease-in-out peer-checked:bg-[#F28C28] after:w-5 after:h-5 after:bg-white peer-checked:after:bg-white after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-4 group-hover:after:translate-x-1 " + (disabled ? ' opacity-50' : '')}> </span>
    </label>
  )
}