import { ActionFunction, json, redirect } from '@remix-run/node';
import { SpeechClient } from '@google-cloud/speech';
import { account } from '~/backend/cookies/account';
import { encrypt } from '~/utils/encryption';
import { createClerkClient } from '@clerk/remix/api.server';
import { getAuth } from '@clerk/remix/ssr.server';
import { IAudioMetadata } from 'music-metadata';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { writeFile, unlink, readFile } from 'fs/promises'
ffmpeg.setFfmpegPath(ffmpegPath!);


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
  let buffer: Buffer
  let audioBytes: string
  let metadata: IAudioMetadata
  try {
    buffer = Buffer.from(await file.arrayBuffer());
    // audioBytes = buffer.toString('base64');
    const { audioBytes: convertedAudioBytes } = await processAudioFile(buffer);
    audioBytes = convertedAudioBytes;
    const { parseBuffer } = await import('music-metadata');
    metadata = await parseBuffer(buffer)
    console.log('audio files metadata: ', JSON.stringify({
      encoding: metadata.format?.codec,
      sampleRate: metadata.format?.sampleRate,
      container: metadata.format?.container
    }, null, 2))
    
  } catch (e) {
    console.error('Error converting audio file to base64:', e);
    return json({ message: 'Looks like I was unable to analyze your request. Pleast try again.' }, { status: 500 });
  }

  function calculateEncoding(codec?: string) {
    if (!codec) return 'OGG_OPUS'
    if (codec.toLowerCase().includes('opus') && metadata?.format?.container === 'OGG') return 'OGG_OPUS'
    if (codec.toLowerCase().includes('opus') && metadata?.format?.container !== 'OGG'){

    }
    if (codec === 'MP3') return 'MP3'
    if (codec === 'MPEG') return 'MP3'
    return 'OGG_OPUS'
  }

  try {
    // Configure the request
    const requestConfig = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding:  calculateEncoding(metadata.format?.codec) as any, // Make sure this matches your audio file's encoding
        sampleRateHertz: metadata.format?.sampleRate || 48000, // Adjust this based on your audio file
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
      console.error('No transcription results found: ', response);
      return json({ error: 'No transcription results found' }, { status: 400 });
    }

    const transcript = response.results
      .map(result => {
        if (!result.alternatives) return '';
        console.log('### result: ', result)
        return result.alternatives[0].transcript;
      })
      .filter(v => v?.length)
      .join('\n');

    const iv = process.env.ENCRYPTION_IV as string
    const key = process.env.ENCRYPTION_KEY as string
    const authToken = encrypt(process.env.SPRINT_GENERATION_SECRET as string, key, iv)

    // return failure if not a sentence
    if (transcript.length < 10) return json({ transcript: '' }, { status: 200 });
    const result: {result_summary: string} | null = await fetch(sprintManagerUrl, {
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
      console.error('### Sprint manager catched an error: ', e)
      return null
    })
    console.log('### Sprint manager request result: ', result)
    if (!result || "result_summary" in result === false) {
      console.error('### Sprint manager error: ', result)
      return json({ error: 'Sprint manager error' }, { status: 500 });
    }
    
    return json({ transcript:  result.result_summary}, { status: 200 });

  } catch (error) {
    console.error('transcibe audio error:', error)
    return json({ error: 'Unknown error occurred while transcribing audio' }, { status: 500 });
  }
};


async function convertWebmToOgg(inputBuffer: Buffer): Promise<Buffer>  {
  return new Promise((resolve, reject) => {
    const inputPath = 'input.webm';
    const outputPath = 'output.ogg';

    // Write the input buffer to a temporary file
    writeFile(inputPath, inputBuffer)
      .then(() => {
        ffmpeg(inputPath)
          .output(outputPath)
          .audioCodec('libopus')
          .on('end', async () => {
            try {
              // Read the output file into a buffer
              const outputBuffer = await readFile(outputPath);
              // Clean up temporary files
              await unlink(inputPath);
              await unlink(outputPath);
              resolve(outputBuffer);
            } catch (error) {
              reject(error);
            }
          })
          .on('error', async (err) => {
            // Clean up temporary files on error
            await unlink(inputPath);
            await unlink(outputPath);
            reject(err);
          })
          .run();
      })
      .catch(reject);
  });
};

async function processAudioFile(buffer: Buffer): Promise<{ audioBytes: string; metadata: IAudioMetadata }> {
  const { parseBuffer } = await import('music-metadata');
  const metadata = await parseBuffer(buffer);
  if (!metadata.format || !metadata.format?.codec || !metadata.format?.container || !metadata.format?.sampleRate) {
    throw new Error('No audio metadata found');
  }
  console.log('Audio files metadata:', JSON.stringify({
    encoding: metadata.format?.codec,
    sampleRate: metadata.format?.sampleRate,
    container: metadata.format?.container,
  }, null, 2));

  let audioBytes: string;

  // Check the format and convert if necessary
  if (metadata.format?.container?.toLowerCase() === 'ebml/webm') {
    console.log('File is in EBML/webm container, converting to OGG_OPUS.');
    const oggBuffer = await convertWebmToOgg(buffer);
    audioBytes = oggBuffer.toString('base64');
  } else if (metadata.format?.codec?.toLowerCase() === 'opus' && metadata.format?.container?.toLowerCase() === 'ogg') {
    console.log('File is already in OGG_OPUS format.');
    audioBytes = buffer.toString('base64');
  } else {
    audioBytes = buffer.toString('base64');
  }

  return { audioBytes, metadata };
};