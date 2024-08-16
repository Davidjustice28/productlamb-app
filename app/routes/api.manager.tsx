import { ActionFunction, json, redirect } from '@remix-run/node';
import { SpeechClient } from '@google-cloud/speech';
import { account } from '~/backend/cookies/account';
import { encrypt } from '~/utils/encryption';
import { createClerkClient } from '@clerk/remix/api.server';
import { getAuth } from '@clerk/remix/ssr.server';

export const action: ActionFunction = async (args) => {
  const request = args.request
  const baseUrl = process.env.SERVER_ENVIRONMENT === 'production' ? process.env.SPRINT_MANAGER_URL_PROD : process.env.SPRINT_MANAGER_URL_DEV
  const cookies = request.headers.get('Cookie')
  const accountCookie = (await account.parse(cookies))
  const applicationId = accountCookie?.selectedApplicationId as number| undefined
  const accountId = accountCookie?.accountId as number| undefined

  if (!applicationId || !accountId) return json({ message: 'No file uploaded.' }, { status: 401 });
  const sprintManagerUrl = `${baseUrl}/manager/request/${applicationId}`

  const {userId} = await getAuth(args)
  if (!userId) return json({ message: 'not logged in' }, { status: 403 });
  const formData = await request.formData();
  const file = formData.get('audio') as Blob;

  if (!file) {
    console.error('No file uploaded');
    return json({ message: 'No file uploaded.' }, { status: 400 });
  }

  // Convert Blob to Buffer and then to Base64 string
  const buffer = Buffer.from(await file.arrayBuffer());
  const audioBytes = buffer.toString('base64');

  try {
    // Configure the request
    const requestConfig = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: 'OPUS' as any, // Make sure this matches your audio file's encoding
        sampleRateHertz: 48000, // Adjust this based on your audio file
        languageCode: 'en-US', // Change as needed
      },
    };

    // Initialize the Speech-to-Text client
    const client = new SpeechClient({
      credentials: JSON.parse(process.env.GCP_CREDENTIALS || "{}"),
    });

    // Call the Speech-to-Text API
    const [response] = await client.recognize(requestConfig);

    // Check and handle the response
    if (!response.results || response.results.length === 0) {
      return json({ error: 'No transcription results found' }, { status: 400 });
    }

    const transcript = response.results
      .map(result => {
        if (!result.alternatives) return '';
        return result.alternatives[0].transcript;
      })
      .filter(v => v?.length)
      .join('\n');

    const iv = process.env.ENCRYPTION_IV as string
    const key = process.env.ENCRYPTION_KEY as string
    const authToken = encrypt(process.env.SPRINT_GENERATION_SECRET as string, key, iv)

    // return failure if not a sentence
    if (transcript.length < 10) return json({ transcript: '' }, { status: 200 });
    const result: {manager_response: string, success: boolean} | null = await fetch(sprintManagerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_request: transcript,
        clerk_user_id: userId,
        account_id: accountId
      })
    }).then(res => res.json()).catch((e) => {
      return null
    })

    if (!result || !result?.success) return json({ error: 'Sprint manager error' }, { status: 400 });
    
    return json({ transcript:  result.manager_response});

  } catch (error) {
    console.error('transcibe audio error:', error)
    return json({ error: 'Unknown error occurred while transcribing audio' }, { status: 500 });
  }
};
