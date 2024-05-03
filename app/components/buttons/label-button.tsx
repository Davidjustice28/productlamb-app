import { PLBasicButtonProps } from "~/types/component.types";

export function PLDeveloperButton({rounded=false, icon="", text, onClick}: PLBasicButtonProps) {
  return (
    <button className="rounded-xl hover:bg-neutral-700 bg-black text-white flex-row flex gap-2 items-center justify-center font-bold py-2 px-4 shadow-xl" onClick={onClick}>
      <i className={(icon.length ? icon : 'ri-user-line') + " text-3xl"}></i>
      <span>{text}</span>
      {/* <img className="rounded-full w-6 h-6 object-cover" src="https://storage.googleapis.com/talo_profile_images/6e080f46-3a08-4c93-9910-7fcaed4bfad8-3-19-2024-18-22.jpg" alt="header image"/> */}
    </button>
  )
}