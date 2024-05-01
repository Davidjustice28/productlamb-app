export function PLTutorial(props : {title: string, children: React.ReactNode}){
  return (
    <div className="w-full flex flex-col gap-5 px-5 py-5 text-black dark:text-white">
      <h2 className="text-2xl font-bold text-black dark:text-white">{props.title}</h2>
      {props.children}
    </div>
  )
}