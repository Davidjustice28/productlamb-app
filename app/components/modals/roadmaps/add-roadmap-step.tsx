import React, { useState, useEffect } from 'react';
import { roadmap_item } from '@prisma/client';
import { PLBaseModal, PLModalFooter } from '../base';
import { PLIconButton } from '~/components/buttons/icon-button';
import { PLBasicButton } from '~/components/buttons/basic-button';
import {v4 as uuid } from 'uuid'

// Example RoadmapItem component to render individual items
type RoadmapEntry = roadmap_item & {temporaryEntryId?: string};
export function PLManagedRoadmapModal({ open, onClose, setOpen, roadmapItems, roadmap_id, setRoadmapItems }: { open: boolean, onClose: () => void, setOpen: (open: boolean) => void, roadmapItems: roadmap_item[], roadmap_id: number, setRoadmapItems: (items: roadmap_item[]) => void }) {
  const [items, setItems] = useState<RoadmapEntry[]>(roadmapItems);
  function addItem() {
    const start_date = items.length > 0 ? new Date(items[items.length - 1].end_date) : new Date();
    // -1 is a temporary id to indicate that this is a new item that is not yet saved
    const blankItem: RoadmapEntry = { initiative: '', start_date: start_date.toISOString(), end_date: start_date.toISOString(), description: '', order: items.length + 1, roadmap_id, id: -1, temporaryEntryId: uuid() };
    setItems([...items, blankItem]);
  }

  async function saveItem(item: roadmap_item) {
    const { id, ...newItem } = item;
    await fetch('/api/roadmaps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ item: newItem, action: 'add' })
    }).then(async res => {
      const data = await res.json();
      if ('items' in data) {
        setItems(data.items);
        setRoadmapItems(data.items);
      }
    }).catch(err => console.error(err));
  }

  async function deleteItem(item: RoadmapEntry) {
    if (item.id === -1) {
      const index = items.findIndex(r => r.id === -1 && r.temporaryEntryId === item?.temporaryEntryId);
      if (index !== -1) {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
      }
    } 
    
    if (item.id !== -1) {
      await fetch('/api/roadmaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ item, action: 'delete' })
      }).then(async res => {
        const data = await res.json();
        if ('items' in data) {
          setItems(data.items);
          setRoadmapItems(data.items);
        }
      }).catch(err => console.error(err));
    }
  }

  return (
    <PLBaseModal title='Manage Roadmap' open={roadmap_id === -1 ? false : open} onClose={onClose} setOpen={setOpen}>
      <div className='p-5 flex flex-col gap-3 h-[500px] overflow-scroll'>
        <div className="flex flex-col items-center bg-white dark:bg-neutral-800 w-full rounded-md justify-evenly gap-2">
          {items.map((r, i) => {
            if (r.id !== -1) {
              return (
                <div key={i} className={"cursor-pointer w-full flex flex-col px-4 rounded-md gap-1 justify-center shadow-lg dark:shadow-black h-[120px]"}>
                  <p className="text-black dark:text-gray-300 font-semibold text-sm">{r.initiative}</p>
                  <p className="text-black dark:text-gray-300 text-xs italic">{new Date(r.start_date).toLocaleDateString()} - {new Date(r.end_date).toLocaleDateString()}</p>
                  <div className='flex flex-row gap-2 items-center mt-2'>
                    <PLIconButton icon="ri-delete-bin-line" onClick={() => deleteItem(r)} />
                  </div>
                </div>
              )
            } else {
              return <NewRoadmapEntry r={r} key={i} saveMethod={saveItem} deleteMethod={deleteItem}/>
            }
          })}
        </div>
      </div>
      <div className='p-5'><PLBasicButton colorClasses="bg-orange-400 hover:bg-orange-500 text-white dark:text-black dark:bg-orange-400 dark:hover:bg-orange-500" onClick={addItem} text='Add Item' icon='ri-add-line' iconSide='left' noDefaultDarkModeStyles/></div>
    </PLBaseModal>
  )
}


function NewRoadmapEntry({ r, saveMethod, deleteMethod }: { r: roadmap_item, saveMethod: (r: roadmap_item) => Promise<void>, deleteMethod: (r: roadmap_item) => Promise<void> }) {
  const initiativeRef = React.createRef<HTMLInputElement>();
  const descriptionRef = React.createRef<HTMLTextAreaElement>();
  const startDateRef = React.createRef<HTMLInputElement>();
  const endDateRef = React.createRef<HTMLInputElement>();
  const formRef = React.createRef<HTMLFormElement>();
  const [isDisabled, setDisabled] = useState(true);

  const getItem = () => {
    const item: roadmap_item = {
      id: r.id,
      initiative: initiativeRef.current!.value,
      description: descriptionRef.current!.value,
      start_date: startDateRef.current!.value,
      end_date: endDateRef.current!.value,
      order: r.order,
      roadmap_id: r.roadmap_id
    };
    return item;
  }

  const checkIfValid = () => {
    const item = getItem();
    if (item.initiative.length > 0 && item.description.length > 0 && item.start_date.length > 0 && item.end_date.length > 0) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }

  useEffect(() => {
    startDateRef.current!.value = new Date(r.start_date).toISOString().split('T')[0];
    endDateRef.current!.value = new Date(r.end_date).toISOString().split('T')[0];
  }, []);
  return (
    <div className={"cursor-pointer w-full flex flex-col px-4 py-3 rounded-md justify-center shadow-lg dark:shadow-black "}>
      <form className="flex flex-col gap-3" ref={formRef}>
        <input className="text-black dark:text-gray-300 dark:bg-transparent dark:border-neutral-700 font-semibold text-sm border-2 p-2" placeholder="What is the goal for this period of time?" ref={initiativeRef} onChange={checkIfValid}/>
        <textarea className="text-black dark:bg-transparent dark:border-neutral-700 dark:text-gray-300 text-xs italic resize-none h-[50px] border-2 p-2" placeholder="Provide a more elaborate description of what will take place" ref={descriptionRef} onChange={checkIfValid}/>
        <div className="flex flex-row gap-2 items-center">
          <label className="text-black dark:text-gray-300 text-xs italic">Start Date:</label>
          <input type='date' className="text-black dark:text-gray-300 text-xs italic w-[110px] border-2 p-1 dark:bg-transparent dark:border-neutral-700" ref={startDateRef} onChange={checkIfValid}/>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <label className="text-black dark:text-gray-300 text-xs italic">End Date:</label>
          <input type='date' className="text-black dark:text-gray-300 text-xs italic w-[110px] border-2 p-1 dark:bg-transparent dark:border-neutral-700 ml-[7px]" ref={endDateRef} onChange={checkIfValid}/>
        </div>
        <div className='flex flex-row gap-2 items-center'>
          <PLIconButton icon="ri-delete-bin-line" onClick={() => deleteMethod(r)} />
          <PLIconButton icon="ri-check-line" onClick={() => {saveMethod(getItem())}} disabled={isDisabled}/>
        </div>
      </form>
    </div>
  )
}