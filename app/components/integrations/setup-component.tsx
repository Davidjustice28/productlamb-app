import { IntegrationOptions } from "~/types/component.types"
import { PLIconButton } from "../buttons/icon-button"
import { PLBasicButton } from "../buttons/basic-button"
import { useRef, useState } from "react"

export function IntegrationSetupComponent({integration, onBackButtonClick, showBackButton=true, onSubmit, applicationId, hasGoogleOAuth}:{applicationId: number, integration: IntegrationOptions, onBackButtonClick?: any, showBackButton?: boolean, onSubmit?: (data: any) => void, hasGoogleOAuth?: boolean}) {
  const keys = Object.keys(integration.requiredFields)
  const [formIsValid, setFormIsValid] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const onFormSubmit = async () => {
    const formData = new FormData(formRef.current!)
    const data = Object.fromEntries(formData.entries())
    if (onSubmit) { 
      onSubmit(data)
    } else { 
      formRef.current?.submit()
    }
  }

  const checkIfFormValid = () => {
    const isValid = formRef.current?.checkValidity()
    setFormIsValid(isValid as boolean)
  }

  const googleFormRef = useRef<HTMLFormElement>(null)

  const connectGoogleAccount = async () => {
    const formData = new FormData(googleFormRef.current!)
    const data = Object.fromEntries(formData.entries())
    googleFormRef.current?.submit()
  }

  const initializeSlackOAuthFlow = async () => {
    window.location.href = `https://slack.com/oauth/v2/authorize?client_id=7605129512289.7592468667554&scope=chat:write,channels:history,users:read&redirect_uri=https://sprint-manager.onrender.com/integrations/slack/redirect`
  }
 
  return (
    <div className="p-5 text-black dark:text-white" style={{height: "550px"}}>
      <div className="flex items-center justify-between gap-4 p-4 border-b dark:border-neutral-700">
        <div className="flex items-center justify-left gap-4 ">
          <img src={integration.img_url} alt="app icon" className="w-10 h-10 rounded-full" />
          <h2 className="text-lg font-semibold text-gray-700 dark:text-neutral-300">Setup {integration.name}</h2>
        </div>
        {showBackButton && <PLIconButton icon="ri-arrow-left-line" colorClasses="text-black hover:bg-gray-100 dark:hover:bg-neutral-700 border-neutral-300 border-2 rounded-full" onClick={onBackButtonClick}/>}
      </div>
      {
        integration.name.includes('Google') ? (
          <>
            <form method="POST" ref={googleFormRef} action="/portal/integrations">
              <input type="hidden" name="google_type" value={integration.name.toLowerCase()}/>
              <input type="hidden" name="application_id" value={applicationId}/>
              {integration.name.includes('Google Form') && (
                <div className="flex flex-col gap-2 w-60 mt-5 mb-2">
                  <label className="text-gray-700 dark:text-neutral-300">Form ID</label>
                  <input 
                    required={true} 
                    type='text' 
                    name='form_id' 
                    placeholder='Form ID'
                    className="p-2 border border-gray-300 dark:border-neutral-700 rounded-lg" 
                    autoComplete={"off"}
                  />
                </div>
              )}
            </form>
            <PLBasicButton text={hasGoogleOAuth ? 'Enable' : "Connect with Google"} colorClasses="bg-orange-400 hover:bg-orange-500 text-white w-52 mt-5" rounded={true} onClick={connectGoogleAccount} noDefaultDarkModeStyles/> 
          </>
        ) : integration.name.includes('Slack') ? (
          <PLBasicButton text='Enable App' colorClasses="bg-orange-400 hover:bg-orange-500 text-white w-52 mt-5" rounded={true} onClick={initializeSlackOAuthFlow} noDefaultDarkModeStyles/> 

        ) :
        (
          <>
          <form className="flex flex-col mt-5 justify-between h-5/6" ref={formRef} method="POST">
            <input type="hidden" name="integration_name" value={integration.name.toLowerCase()}/>
            <div className="flex flex-col gap-2">
              {
                keys.map((key, index) => {
                  const field = integration.requiredFields[key]
                  return (
                    <div key={index} className="flex flex-col gap-2">
                      <label htmlFor={key} className="text-gray-700 dark:text-neutral-300">{field.label}</label>
                      <input 
                        required={true} 
                        type={field.type} 
                        name={key} 
                        placeholder={field.placeholder} 
                        className="p-2 border border-gray-300 dark:border-neutral-700 rounded-lg" 
                        onChange={checkIfFormValid}
                        autoComplete={"off"}
                      />
                    </div>
                  )
                })
              }
            </div>
          </form>
          <PLBasicButton text="Enable Integration" colorClasses="bg-orange-400 hover:bg-orange-500 text-white w-52" rounded={true} onClick={onFormSubmit} disabled={!formIsValid} noDefaultDarkModeStyles/>
        </>
        )
      }
    </div>
  )
}