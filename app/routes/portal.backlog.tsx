import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { GeneratedTask, PrismaClient } from "@prisma/client";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { account } from "~/backend/cookies/account";
import { GeneratedTasksClient } from "~/backend/database/tasks/client";
import { PLTable } from "~/components/common/table";


export const loader: LoaderFunction = args => {
  return rootAuthLoader(args, async ({ request }) => { 
    const cookieHeader = request.headers.get("Cookie");
    const accountCookie = (await account.parse(cookieHeader) || {});
    let accountId: number = accountCookie.accountId
    let selectedApplicationId: number = accountCookie.selectedApplicationId
    const taskDbClient = new PrismaClient().generatedTask
    const backlog = await taskDbClient.findMany({where: {applicationId: selectedApplicationId, backlog: true}})
    return json({backlog})
  })
}

export default function BacklogPage() {
  const { backlog } = useLoaderData() as {backlog: GeneratedTask[]}
  return (
    <div className="w-full flex flex-col text-black">
      <p className="font-sm italic text-neutral-800 dark:text-neutral-400 mt-5">Review and edit your backlog of tasks</p>
      {
        backlog.length === 0 && <p className="font-sm italic text-red-400  mt-5 mb-5">No tasks in the backlog</p>
      }
      {
        backlog.length > 0 && (
          <div className="mt-5"> 
            <PLTable data={backlog} columnsVisible checked={[]}  columns={[{key: 'title', type: 'text'}, {key: 'points', type: 'text'}, {key: 'category', type: 'status'}]}/>
          </div>
        )
      }
    </div>
  )
}