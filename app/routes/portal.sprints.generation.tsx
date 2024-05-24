import { useState } from "react"
import { PLBasicButton } from "~/components/buttons/basic-button"

export default function SprintGenerationPage() {
  const [selectedInitiative, setSelectedInitiative] = useState<string|null>()
  const [initiatives, setInitiatives] = useState<Array<string>>(["Fix bugs related to login issue, profile picture update, and app crashes","Improve onboarding process to provide more guidance to new users","Optimize app performance to reduce bugs and increase user engagement"])
  return (
    <div className="w-full flex flex-col">
      <p className="font-semibold text-black dark:text-white">Choose an overall initiative for the sprint you wish to generate.</p>
      <div className="mt-5 flex flex-row gap-3">
        {initiatives.map((initiative, index) => {
          return (<button key={index} className="w-full border-2 border-black dark:border-neutral-400 p-2 rounded-xl font-medium dark:text-neutral-400 text-black flex flex-col justify-center items-start" onClick={() => setSelectedInitiative(initiative)}>
            <p>Option #{index + 1}</p>
            <p>{initiative}</p>
          </button>)
        })}
      </div>
      {
        selectedInitiative &&
      <PLBasicButton text="Generate Sprint" onClick={() => console.log({selectedInitiative})}/>
      }
    </div>
  )
}