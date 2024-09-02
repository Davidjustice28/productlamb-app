import { ActionFunction, json } from '@remix-run/node';
import { account } from '~/backend/cookies/account';
import { encrypt } from '~/utils/encryption';
import { getAuth } from '@clerk/remix/ssr.server';

export const action: ActionFunction = async (args) => {
  const request = args.request;
  const baseUrl = process.env.SERVER_ENVIRONMENT === 'production'
    ? process.env.SPRINT_MANAGER_URL_PROD
    : process.env.SPRINT_MANAGER_URL_DEV;
  const cookies = request.headers.get('Cookie');
  const accountCookie = await account.parse(cookies);
  const applicationId = accountCookie?.selectedApplicationId as number | undefined;
  const accountId = accountCookie?.accountId as number | undefined;

  if (!applicationId || !accountId) {
    return json({ message: 'No file uploaded.' }, { status: 401 });
  }

  const sprintManagerUrl = `${baseUrl}/manager/request/${applicationId}`;

  const { userId } = await getAuth(args);
  if (!userId) {
    return json({ message: 'Not logged in' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('audio') as Blob;

  if (!file) {
    console.error('No file uploaded');
    return json({ message: 'No file uploaded.' }, { status: 400 });
  }

  // Prepare FormData for OpenAI request
  const uploadFormData = new FormData();
  uploadFormData.append('file', file, 'audio.mp3'); // Append file with a name
  uploadFormData.append('model', 'whisper-1'); // Append the model parameter

  let transcript = '';

  try {
    // Send the FormData to OpenAI using fetch
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error during transcription:', errorText);
      return json({ message: 'Failed to transcribe audio.' }, { status: 500 });
    }

    const result = await response.json();
    transcript = result.text || '';
  } catch (error) {
    console.error('Error during transcription:', error);
    return json({ message: 'Failed to transcribe audio.' }, { status: 500 });
  }

  try {
    const iv = process.env.ENCRYPTION_IV as string;
    const key = process.env.ENCRYPTION_KEY as string;
    const authToken = encrypt(process.env.SPRINT_GENERATION_SECRET as string, key, iv);

    // Return failure if not a sentence
    if (transcript.length < 10) {
      return json({ transcript: '' }, { status: 200 });
    }

    const result: { result_summary: string } | null = await fetch(sprintManagerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_request: transcript,
        clerk_user_id: userId,
        account_id: accountId,
      }),
    }).then(res => res.json()).catch((e) => {
      console.error('### Sprint manager caught an error: ', e);
      return null;
    });

    if (!result || !("result_summary" in result)) {
      console.error('### Sprint manager error: ', result);
      return json({ error: 'Sprint manager error' }, { status: 500 });
    }

    return json({ transcript: result.result_summary }, { status: 200 });
  } catch (error) {
    console.error('Transcribe audio error:', error);
    return json({ error: 'Unknown error occurred while transcribing audio' }, { status: 500 });
  }
};
