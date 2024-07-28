export function PLOptionsButtonGroup({groups, current, handleGroupChange, vertical, customButtonClasses='', disabledList=[]}:{groups: Array<string>, current: string, handleGroupChange?: (group: string) => void, vertical?: boolean, customButtonClasses?: string, disabledList?: string[]}) {
  const onClick = (group: string) => {
    if(disabledList.includes(group)) return
    if (handleGroupChange) handleGroupChange(group)
  }
  const isdisabled = (group: string) => {
    return disabledList.includes(group) ? 'cursor-not-allowed opacity-50' : ''
  }

  return (
    <div className={"flex flex-row dark:divide-transparent " + (vertical ? 'flex-col divide-y-2' : 'flex-row divide-x-2') }>
      {groups.map((group, index) => {
        const selected = group === current ? 'dark:bg-[#F28C28] bg-black text-white' : 'dark:bg-neutral-800 bg-white dark:text-neutral-400 text-black'
        return (
          <button key={index} onClick={() => onClick(group)}>
            <div className={'font-semibold text-sm py-2 px-4 rounded ' + selected + (" " + customButtonClasses + isdisabled(group))}>{group.toUpperCase()}</div>
          </button>
        )
      })}
    </div>
  )
}