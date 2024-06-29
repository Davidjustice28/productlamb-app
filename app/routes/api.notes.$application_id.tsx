import { ApplicationNote, PrismaClient } from "@prisma/client";
import { ActionFunction, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request, params }) => {
  const application_id = params.application_id;
  if (!application_id) {
    console.error('No application_id provided');
    return new Response(null, { status: 400 });
  }
  const id = parseInt(application_id);
  const client = new PrismaClient()
  const notes = await client.applicationNote.findMany({
    where: {
      applicationId: id,
    },
  });

  const sorted = mergeSort([...notes]);
  function mergeSort(arr: ApplicationNote[]): ApplicationNote[] {
    if (arr.length <= 1) return arr;
    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);
    return merge(mergeSort(left), mergeSort(right));
  }

  function merge(left: ApplicationNote[], right: ApplicationNote[]): ApplicationNote[] {
    let resultArray = [], leftIndex = 0, rightIndex = 0;
    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex].id > right[rightIndex].id) {
        resultArray.push(left[leftIndex]);
        leftIndex++;
      } else {
        resultArray.push(right[rightIndex]);
        rightIndex++;
      }
    }
    return resultArray
      .concat(left.slice(leftIndex))
      .concat(right.slice(rightIndex));
  }

  return new Response(JSON.stringify({ notes: sorted }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}