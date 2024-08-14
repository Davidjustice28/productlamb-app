import { useState } from "react";


export const PLAccordianItem = ({label, body, iconCombo}: {label: string, body: string, iconCombo: "arrows" | "plus-minus"}) => {
 const [open, setOpen] = useState(false);

const closedIcon = iconCombo === "arrows" ? "ri-arrow-down-s-line" : "ri-add-line";
const openIcon = iconCombo === "arrows" ? "ri-arrow-up-s-line" : "ri-subtract-line";

 return (
   <div className="w-full">
      <input
       id="expandCollapse"
       type="checkbox"
       checked={open}
       onChange={() => setOpen(!open)}
       className="peer sr-only"
      />
      <label
        htmlFor="expandCollapse"
        className={"w-full font-bold flex justify-between items-center bg-white dark:bg-neutral-800 dark:text-neutral-300 text-black p-3 " + (open ? "rounded-t-md" : "rounded-md")}
        onClick={() => setOpen(!open)}
      >
        <span className="inline-block">
          {label}
        </span>
        <button>
          <i className={open ? openIcon : closedIcon }></i>
        </button>
     </label>
      <p className={"w-full text-black dark:text-neutral-300 p-3 bg-white dark:bg-neutral-800 font-light " + (open ? "rounded-b-md" : "hidden")}>
        {body}
      </p>
   </div>
 );
};

export const PLAccordian = ({items}: {items: Array<{label: string, body: string, iconCombo?: "arrows" | "plus-minus"}>}) => {
  const iconCombo = items[0].iconCombo || "arrows";
  return (
    <div className="flex flex-col gap-3 w-full">
      { items.map((item, index) => <PLAccordianItem key={index} label={item.label} body={item.body} iconCombo={iconCombo}/>) }
    </div>
  )
}
