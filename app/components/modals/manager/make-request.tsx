import { useState, useRef, useEffect } from 'react';
import { PLBaseModal } from '../base';


function AudioRecorder({open}: {open: boolean}) {
  const [isRecording, setIsRecording] = useState(false);
  const [requestMade, setRequestMade] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [volumes, setVolumes] = useState<Array<number>>([]);
  const [avgVolume, setAvgVolume] = useState<number>(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Set up MediaRecorder
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
        }
    };
    mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setBlob(blob);
        
        if (open) {
          await sendAudioFileToServer(blob, url);
        } else {
          console.log('canceled request')
        }
          
        audioChunksRef.current = [];
    };

    // Set up Web Audio API for volume feedback
    audioContextRef.current = new (window.AudioContext || window.AudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    let silenceTimeoutId: NodeJS.Timeout | null = null;
    const SILENCE_DURATION = 1500; // 3 seconds

    // Function to handle detected silence
    const handleSilence = () => {
      if (silenceTimeoutId) {
        clearTimeout(silenceTimeoutId);
      }
      silenceTimeoutId = setTimeout(async () => {
        stopRecording(); // Stop recording if silence detected
      }, SILENCE_DURATION);
    };

    // Function to update volume level and check for silence
    const updateVolume = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / dataArray.length;
        const frequencies = Array.from(dataArray).slice(0, 16);
        setVolumes(frequencies);
        setAvgVolume(average);

        if (average > 30) {
          handleSilence(); // Reset silence timeout if audio is detected
        }

        animationFrameIdRef.current = requestAnimationFrame(updateVolume);
      }
    };

    updateVolume();
    mediaRecorderRef.current.start();
    setIsRecording(true);
    setRequestMade(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    audioContextRef.current?.close();
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (audioURL && !requestMade) {
      setRequestMade(true);
    }
  };

  async function sendAudioFileToServer(blob?: Blob, audioURL?: string) {
    if (!blob || !audioURL || !audioURL?.length || audioURL === 'blob:' || blob?.size === 181925) {
      setTranscript('Hmm, something went wrong. Please try again.');
      return
    }

    // Upload audio and get transcript
    const file = new File([blob], 'audio.wav', { type: 'audio/wav' });
    // Upload audio and get transcript using fetch
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('location', audioURL)
    try {
      const response = await fetch('/api/manager', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        setTranscript('Hmm, something went wrong. Please try again.');
      }
      
      const result = await response.json();
      if (result?.transcript.length ) {
        setTranscript(result?.transcript);
      } 
    } catch (error) {
      setTranscript('Hmm, something went wrong. Please try again later.');
    }
  }

  useEffect(() => {
    if(!open) {
      if (isRecording) {
        stopRecording();
        setVolumes([]);
      }

      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setAudioURL(null);
      }
      
      if (blob) {
        setBlob(null);
      }
      setTranscript("");
      setRequestMade(false);
    } else {
      startRecording();
    }
  }, [open])

  return (
    <div className='h-72 flex flex-col items-center justify-center text-black dark:text-neutral-200'> 
      {isRecording ? <p className={'text-center ' + (avgVolume <= 30 ? '' : ' invisible')}>Please try to speak up!</p> : null}
      {isRecording ? (
        <div className='flex flex-row justify-evenly items-end h-48 w-5/6 border-2 gap-2 border-neutral-500 dark:border-neutral-300'>
          {volumes.map((volume, i) => (
            <div key={i} style={{height: `${volume/2}px`, backgroundColor: 'orange' }} className='inline-block w-7'/>
          ))}
        </div>
      ) : (
        <div className='flex flex-row px-3 items-center h-48 w-5/6 justify-center border-2 border-neutral-500 dark:border-neutral-300'>
          <p className='text-center text-md font-bold'>{transcript?.length ? transcript : "Give me a few seconds to process your request..."}</p>
        </div>
      )}
    </div>
  );
};

export function PLManagerRequestModal({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) {
  const title = 'What can I help you with?';

  return (
    <PLBaseModal open={open} title={title} setOpen={setOpen} size='sm'>
      <AudioRecorder open={open}/>
    </PLBaseModal>
  )
}

