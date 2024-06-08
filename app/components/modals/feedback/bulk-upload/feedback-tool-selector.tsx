import { PLSelectorModalOption } from "~/types/component.types"

export function FeedbackToolSelector({onClick, availableIntegrations}: {availableIntegrations:Array<"Typeform"| "Jotform" | "Google Forms">, onClick: (item: PLSelectorModalOption) => void}) {
  const modalOptions: Array<PLSelectorModalOption> = [
    {
      name: 'CSV',
      iconClass: 'ri-file-line',
      value: 'manual',
      available: true
    },
    {
      name: 'Typeform',
      value: 'integration',
      logo_url: 'https://storage.googleapis.com/productlamb-platform-images/typeform.svg',
      available: availableIntegrations.includes('Typeform')
    },
    {
      name: 'Jotform',
      value: 'integration',
      logo_url: 'https://storage.googleapis.com/productlamb-platform-images/jotform.svg',
      available: availableIntegrations.includes('Jotform')
    },
    {
      name: 'Google Forms',
      value: 'integration',
      logo_url: 'https://storage.googleapis.com/productlamb-platform-images/google-forms.svg',
      available: availableIntegrations.includes('Google Forms')
    }
  ]


  return (
    <div className="relative p-6 flex-auto rounded px-8 pt-6 pb-10 w-full">
      <p className="text-neutral-700 dark:text-neutral-300 mb-6 text-center">Choose the source you prefer to upload user feedback from.</p>
      <div className="flex gap-5 items-center justify-center">
        {modalOptions.map(o => {
          return (
            <button 
              className={"border-black border-2 rounded-md dark:border-neutral-400 font-2 flex flex-col items-center w-40 gap-3 h-40 justify-center " + (!o.available ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800')} 
              onClick={() => o.available ? onClick(o) : () => {}}
            >
              {
                o.logo_url ? 
                <img src={o.logo_url} className="h-10"/> : 
                <i className={(o.iconClass ?? 'ri-file-line') + ' text-5xl text-black dark:text-neutral-400'}></i>
              }
              <span className="text-black dark:text-white">{o.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}