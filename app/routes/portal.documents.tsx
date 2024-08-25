import { ApplicationDocuments } from "@prisma/client";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useRef } from "react";
import { account } from "~/backend/cookies/account";
import { PLContentLess } from "~/components/common/contentless";
import { PLTable } from "~/components/common/table";
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
    console.log({
      itemsChecked,
      ids
    })
    setItemsSelected(itemsChecked)
    setIdsChecked(ids)
  }

  const idsInputRef = useRef<HTMLInputElement>(null)
  const actionInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div className="w-full flex flex-col text-black">
      <div className="w-full flex justify-between items-center">
        <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">View documents created by your manager</p>
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
    </div>
  )
}