export function PMToolIconComponent({tool, large}: {tool: 'jira' | 'clickup' | 'notion' | 'github' | 'none', large?: boolean}) {
  const jiraImage = 'https://storage.googleapis.com/productlamb_project_images/jira.256x256.png'
  const clickupImage = 'https://storage.googleapis.com/productlamb_project_images/clickup.png'
  const notionImage = 'https://storage.googleapis.com/productlamb_project_images/notion.246x256.png'
  const githubImage = 'https://storage.googleapis.com/productlamb_project_images/github.256x244.png'
  const getIconSize = () => {
    switch (tool) {
      case 'github':
        return large ? 'w-8 h-8' : 'w-4 h-4'
      case 'jira':
        return large ? 'w-10 h-10' : 'w-5 h-5'
      case 'clickup':
        return large ? 'w-12 h-12' : 'w-7 h-7'
      case 'notion':
        return large ? 'w-8 h-8' : 'w-4 h-4'
      default:
        return large ? 'w-10 h-10' : 'w-5 h-5'
    }
  }
  const iconSize = getIconSize()
  switch (tool) {
    case 'github':
      return <img className={iconSize} src={githubImage} alt="Github"/>
    case 'jira':
      return <img className={"shadow-xl " + iconSize} src={jiraImage} alt="Jira"/>
    case 'clickup':
      return <img className={iconSize} src={clickupImage} alt="Clickup"/>
    case 'notion':
      return <img className={"dark:bg-white dark:rounded-lg " + iconSize} src={notionImage} alt="Notion"/>
    default:
      return null
  }
}