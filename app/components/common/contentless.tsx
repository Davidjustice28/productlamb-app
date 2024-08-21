type ListItemType = 'application' | 'sprint' | 'task' | 'goals' | 'bugs' | 'backlog' | 'integration' | 'feedback' | 'document'

export function PLContentLess({additionMessage, itemType}: {itemType: ListItemType, additionMessage?: string}) {
  return (
    <p className="font-sm italic text-red-400  dark:text-red-400 mt-4">You have no {itemType}s. {additionMessage ?? getDefaultNoContentMessage(itemType)}</p>
  )
}

function getDefaultNoContentMessage(itemType: string) {
  switch (itemType) {
    case 'application':
      return 'Click add button to add a new application.'
    case 'feedback':
      return 'If you have any feedback for this application, consider uploading it.'
    case 'integration':
      return 'Considering configuring an integration for this application to extend ProductLamb.'
    case 'sprint':
      return 'Check to make sure sprint generation is enabled for the selected application.'
    case 'task':
      return 'Make sure to selected a task next sprint during sprint planning.'
    case 'goals':
      return "Add a goal for this application in your app's settings."
    case 'bugs':
      return 'If there are bugs in your application, create a new bug item.'
    case 'backlog':
      return 'If you have any tasks that you would like to work on in the future, add them to your backlog.'
    case 'document':
      return 'If you have any documents that you would like to keep track of, add them to your documents.'
    default:
      return 'Create a new item to get started'
  }
}