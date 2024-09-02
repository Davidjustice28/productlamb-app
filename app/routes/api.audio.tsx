import { ActionFunction, json } from "@remix-run/node";
import OpenAI from "openai";
import { uploadToMP3ToCloudStorage } from "~/services/gcp/upload-file";
import { account } from "~/backend/cookies/account";
import { deleteFileFromCloudStorage } from "~/services/gcp/delete-file";

export const action: ActionFunction = async ({request}) => {
  const cookies = request.headers.get('Cookie');
  const accountCookie = await account.parse(cookies)
  const account_id = accountCookie.accountId as number
  const body = await request.json() as {text?: string, url?: string};

  if (body?.url) {
    if (!body?.url.length) return json({error: 'Invalid request'}, {status: 400});
    await deleteFileFromCloudStorage(body.url);
    return json({url: body.url});
  } else {
    if (!body?.text) return json({error: 'Invalid request'}, {status: 400});
    if (!body?.text?.length) return json({error: 'Invalid request'}, {status: 400});
    
    const openai = new OpenAI({
      dangerouslyAllowBrowser: true,
      apiKey: process.env.OPENAI_API_KEY,
    });
  
  
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: body.text,
    });
    
    const buffer = Buffer.from(await mp3.arrayBuffer());
    const speechFile = `${account_id}-speech-${Date.now()}.mp3`
    const fileStoreResult = await uploadToMP3ToCloudStorage(buffer, speechFile);
    if (!fileStoreResult.data) {
      return json({error: 'Failed to store file'}, {status: 500});
    }
    return json({url: fileStoreResult.data});
  }
}
  
