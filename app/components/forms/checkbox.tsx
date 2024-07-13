export function PLCheckbox({labelText, name, checkedByDefault}: {labelText: string, name: string, checkedByDefault?: boolean}) {
  return (
    <div className="flex gap-2">
      <input defaultChecked={checkedByDefault} type="checkbox" id="some_id" name={name} className="
        relative peer shrink-0
        appearance-none w-4 h-4 border-2 border-transparent rounded-sm bg-white dark:bg-neutral-800
        mt-1
        checked:bg-orange-500 checked:border-0 dark:checked:bg-orange-600
        focus:outline-none focus:ring-offset-0 focus:ring-2 focus:ring-blue-100
        disabled:border-steel-400 disabled:bg-steel-400 shadow-sm shadow-gray-400
      "
      />
      <label htmlFor="some_id" className="text-gray-700 dark:text-neutral-400">{labelText}</label>
      <svg
        className="
          absolute 
          w-3 h-3 mt-[6px] ml-[2px]
          hidden peer-checked:block
          pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  )
}