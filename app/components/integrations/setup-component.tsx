import { IntegrationOptions } from "~/types/component.types"
import { PLIconButton } from "../buttons/icon-button"
import { Form } from "@remix-run/react"

export function IntegrationSetupComponent({integration, onBackButtonClick, showBackButton=true}:{integration: IntegrationOptions, onBackButtonClick?: any, showBackButton?: boolean}) {
  const keys = Object.keys(integration.requiredFields)
  return (
    <div className="p-5" style={{height: "550px"}}>
      <div className="flex items-center justify-between gap-4 p-4 border-b dark:border-neutral-700">
        <div className="flex items-center justify-left gap-4 ">
          <img src={integration.img_url} alt="app icon" className="w-10 h-10 rounded-full" />
          <h2 className="text-lg font-semibold text-gray-700 dark:text-neutral-300">Setup {integration.name}</h2>
        </div>
        {showBackButton && <PLIconButton icon="ri-arrow-left-line" colorClasses="text-black hover:bg-gray-100 dark:hover:bg-neutral-700 border-neutral-300 border-2 rounded-full" onClick={onBackButtonClick}/>}
      </div>
      <Form>
        {
          keys.map((key, index) => {
            const field = integration.requiredFields[key]
            return (
              <div key={index} className="flex flex-col gap-2">
                <label htmlFor={key} className="text-gray-700 dark:text-neutral-300">{field.label}</label>
                <input type="text" name={key} id={key} placeholder={field.placeholder} className="p-2 border border-gray-300 dark:border-neutral-700 rounded-lg" />
              </div>
            )
          })
        }
      </Form>
    </div>
  )
}