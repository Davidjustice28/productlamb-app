import { ApplicationDocuments } from "@prisma/client";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useRef } from "react";
import { account } from "~/backend/cookies/account";
import { PLIconButton } from "~/components/buttons/icon-button";
import { PLContentLess } from "~/components/common/contentless";
import { PLTable } from "~/components/common/table";
import { PLConfirmModal } from "~/components/modals/confirm";
import { DB_CLIENT } from "~/services/prismaClient";


export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "ProductLamb | Documents" },
    {
      property: "og:title",
      content: "ProductLamb | Documents",
    },
  ];
};


export const loader: LoaderFunction = async ({request}) => {
  const cookieHeader = request.headers.get("Cookie");
  const accountCookie = (await account.parse(cookieHeader) || {});
  let selectedApplicationId: number = accountCookie.selectedApplicationId
  const documents = await DB_CLIENT.applicationDocuments.findMany({where: {applicationId: selectedApplicationId}})
  return json({documents})
}

export default function DocumentsPage() {
  const { documents: loadedDocuments} = useLoaderData() as {documents: ApplicationDocuments[]}
  const [documents, setDocuments] = useState<ApplicationDocuments[]>(loadedDocuments ?? [])
  const [itemsSelected, setItemsSelected] = useState<boolean>(false)
  const [idsChecked, setIdsChecked] = useState<Array<number>>([])
  const [open, setOpen] = useState<boolean>(false)

  function onCheck(ids:Array<number>) {
    const itemsChecked = ids.length > 0
    setItemsSelected(itemsChecked)
    setIdsChecked(ids)
  }

  async function deleteDocuments() {
    const docs = await fetch('/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({documents: documents.filter(doc => idsChecked.includes(doc.id)).map(doc => ({id: doc.id, url: doc.document_url}))})
    }).then(res => res.json()).then(data => data.documents).catch(err => null)
    
    if(docs) {
      setDocuments(documents.filter(doc => !idsChecked.includes(doc.id)))
      setItemsSelected(false)
      setOpen(false)
    }

    //FIXME: Add error handling by showing a toast message
  }

  const idsInputRef = useRef<HTMLInputElement>(null)
  const actionInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div className="w-full flex flex-col text-black">
      <div className="w-full flex flex-row justify-between items-center h-10">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400">View documents created by your manager</p>
        {itemsSelected ? <PLIconButton icon="ri-delete-bin-line" onClick={() => setOpen(true)}/> : null}
      </div>
      {
        documents.length === 0 && <PLContentLess itemType="document"/>
      }
      {
        documents.length > 0 && (
          <div className="mt-5"> 
            <form method="post" ref={formRef}>
              <input type="hidden" name="ids" ref={idsInputRef}/>
              <input type="hidden" name="action" ref={actionInputRef}/>
            </form>
            <PLTable data={documents} columnsVisible checked={[]}  columns={[{key: 'name', type: 'text'}, {key: 'type', type: 'status', size: 'md'}, {key: 'document_url', type: 'link', label: 'link', size: 'md'}]} tableModalName="document" actionsAvailable={true} onCheck={onCheck}/>
          </div>
        )
      }
      <PLConfirmModal open={open} setOpen={setOpen} message="Are you sure you want to delete the selected documents? This can't be undone." onConfirm={deleteDocuments}/>
    </div>
  )
}