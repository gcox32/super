'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mic, MicOff, Check } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import VoiceJournalConfirmation from './VoiceJournalConfirmation';
import { Helix } from 'ldrs/react';

export default function VoiceJournalView() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [animatedText, setAnimatedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const [submittedText, setSubmittedText] = useState<string>('');
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [textTranslated, setTextTranslated] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const previousTextRef = useRef<string>('');
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intentionallyStoppedRef = useRef<boolean>(false);
  const { showToast } = useToast();

  // Check for browser support and request permission
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    // Detect iOS/Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsIOSDevice(isIOS);

    if (!SpeechRecognition) {
      setHasPermission(false);
      const message = isIOS 
        ? 'Speech recognition is not available on iOS Safari. Please use Chrome or Edge on a desktop, or type your meal instead.'
        : 'Your browser does not support speech recognition. Use Chrome or Edge for best results.';
      showToast({
        title: 'Speech recognition not supported',
        description: message,
        variant: 'error',
      });
      return;
    }

    // Request microphone permission
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setHasPermission(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscription((prev) => {
            // Remove any previous interim text markers
            const cleaned = prev.replace(/\s*\[listening\.\.\.\]\s*$/, '').trim();
            const newText = cleaned + (cleaned ? ' ' : '') + finalTranscript;
            const result = newText + (interimTranscript ? ' [listening...]' : '');
            
            // Trigger animation for new words (only animate final transcript, not interim)
            if (finalTranscript) {
              const cleanedFinal = newText;
              if (cleanedFinal !== previousTextRef.current) {
                // Use setTimeout to ensure state is updated
                setTimeout(() => {
                  animateText(cleanedFinal, previousTextRef.current);
                  previousTextRef.current = cleanedFinal;
                }, 0);
              }
            }
            
            return result;
          });
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'no-speech') {
            // This is common, don't show error - user might just be pausing
            // Don't stop recording on no-speech errors
            return;
          }
          // Only stop on actual errors, not on no-speech
          if (event.error !== 'no-speech') {
            setIsRecording(false);
          }
          
          let errorTitle = 'Recording error';
          let errorDescription = '';
          let troubleshootingTips: string[] = [];
          
          switch (event.error) {
            case 'not-allowed':
              errorTitle = 'Microphone access denied';
              errorDescription = 'Please enable microphone access in your browser settings to use voice journaling.';
              troubleshootingTips = [
                'Check browser permissions for microphone access',
                'Try refreshing the page and allowing access when prompted',
                'Check your system settings for microphone permissions'
              ];
              break;
            case 'aborted':
              errorTitle = 'Recording stopped';
              errorDescription = 'Recording was interrupted. Please try again.';
              break;
            case 'network':
              // Detect iOS/Safari for more specific error message
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
              
              if (isIOS || isSafari) {
                errorTitle = 'Speech recognition not available';
                errorDescription = 'iOS Safari has limited support for speech recognition. The Web Speech API often fails with network errors on iOS.';
                troubleshootingTips = [
                  'Use Chrome or Edge browser on a desktop/laptop for best results',
                  'Alternatively, you can type your meal description instead',
                  'If you have access to a computer, the voice feature works reliably there'
                ];
              } else {
                errorTitle = 'Network error';
                errorDescription = 'Could not connect to speech recognition service.';
                troubleshootingTips = [
                  'Check your internet connection',
                  'Try refreshing the page',
                  'Check if you\'re behind a firewall or proxy that might block the service',
                  'Try using Chrome or Edge (best support for speech recognition)',
                  'If on mobile, ensure you have a stable connection',
                  'The speech recognition service may be temporarily unavailable - try again in a few moments'
                ];
              }
              break;
            case 'audio-capture':
              errorTitle = 'No microphone found';
              errorDescription = 'No microphone was detected. Please connect a microphone and try again.';
              troubleshootingTips = [
                'Ensure a microphone is connected to your device',
                'Check system settings to verify microphone is working',
                'Try using a different microphone'
              ];
              break;
            case 'service-not-allowed':
              errorTitle = 'Service not allowed';
              errorDescription = 'Speech recognition service is not available.';
              troubleshootingTips = [
                'This may be a browser or system restriction',
                'Try using Chrome or Edge browser',
                'Check if speech recognition is enabled in your browser settings',
                'On iOS/Safari, speech recognition has limited support'
              ];
              break;
            default:
              errorDescription = `Error: ${event.error}`;
              if (event.message) {
                errorDescription += ` - ${event.message}`;
              }
          }
          
          showToast({
            title: errorTitle,
            description: troubleshootingTips.length > 0 
              ? `${errorDescription}\n\nTroubleshooting:\n${troubleshootingTips.map(tip => `• ${tip}`).join('\n')}`
              : errorDescription,
            variant: 'error',
          });
        };

        recognition.onend = () => {
          // Only stop if we didn't intentionally stop it
          // This prevents the onend event from immediately stopping after start
          if (!intentionallyStoppedRef.current) {
            setIsRecording(false);
          }
          intentionallyStoppedRef.current = false; // Reset for next time
        };

        recognitionRef.current = recognition;
      })
      .catch((err) => {
        setHasPermission(false);
        showToast({
          title: 'Microphone access denied',
          description: 'Please enable microphone access to use voice journaling.',
          variant: 'error',
        });
      });
  }, [showToast]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      showToast({
        title: 'Speech recognition not available',
        description: 'Please refresh the page and try again.',
        variant: 'error',
      });
      return;
    }

    // Don't start if already recording
    if (isRecording) {
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err: any) {
      // If error is about already running, just set the state
      if (err.message && err.message.includes('already')) {
        setIsRecording(true);
      } else {
        setIsRecording(false);
        showToast({
          title: 'Failed to start recording',
          description: err.message || 'Please try again.',
          variant: 'error',
        });
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      intentionallyStoppedRef.current = true; // Mark that we intentionally stopped
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore errors when stopping (might already be stopped)
      }
      setIsRecording(false);
      // Clean up interim text markers
      setTranscription((prev) => prev.replace(/\s*\[listening\.\.\.\]\s*$/, '').trim());
    }
  };

  const handleSubmit = async () => {
    const text = transcription.trim();
    
    if (!text) {
      showToast({
        title: 'No transcription',
        description: 'Please record or type something before submitting.',
        variant: 'error',
      });
      return;
    }

    // Store submitted text and trigger animation
    setSubmittedText(text);
    setIsProcessing(true);
    setProcessingStage('Parsing...');
    
    // Trigger text translation animation after a brief delay
    setTimeout(() => {
      setTextTranslated(true);
      setShowLoadingAnimation(true);
    }, 50);
    
    try {
      const res = await fetch('/api/fuel/meals/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription: text }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to process transcription' }));
        throw new Error(errorData.error || 'Failed to process transcription');
      }

      setProcessingStage('Finalizing...');
      const data = await res.json();
      setConfirmationData(data);
      // Reset animation states when moving to confirmation
      setShowLoadingAnimation(false);
      setSubmittedText('');
    } catch (err: any) {
      setIsProcessing(false);
      setProcessingStage('');
      setShowLoadingAnimation(false);
      setSubmittedText('');
      
      // Provide more specific error messages
      let errorTitle = 'Failed to process';
      let errorDescription = err.message || 'Please try again.';
      
      if (err.message.includes('OpenAI')) {
        errorTitle = 'AI Processing Error';
        if (err.message.includes('rate limit')) {
          errorDescription = 'Too many requests. Please wait a moment and try again.';
        } else if (err.message.includes('authentication')) {
          errorDescription = 'AI service configuration error. Please contact support.';
        } else if (err.message.includes('temporarily unavailable')) {
          errorDescription = 'AI service is temporarily unavailable. Please try again in a moment.';
        }
      } else if (err.message.includes('Invalid meal data') || err.message.includes('Invalid food data')) {
        errorTitle = 'Could not parse meal';
        errorDescription = 'The meal description could not be understood. Please try rephrasing or be more specific about foods and portions.';
      } else if (err.message.includes('parse')) {
        errorTitle = 'Parsing Error';
        errorDescription = 'Could not understand the meal description. Please try again with a clearer description.';
      }
      
      showToast({
        title: errorTitle,
        description: errorDescription,
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handleConfirmationCancel = () => {
    setConfirmationData(null);
  };

  // Animate text letter by letter
  const animateText = (newText: string, oldText: string) => {
    // Clear any existing animation
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    // Find the new part that was added
    const newPart = newText.slice(oldText.length);
    
    if (!newPart) return;
    
    // Animate the new part letter by letter
    let currentIndex = 0;
    const animate = () => {
      if (currentIndex < newPart.length) {
        setAnimatedText(oldText + newPart.slice(0, currentIndex + 1));
        currentIndex++;
        animationTimeoutRef.current = setTimeout(animate, 30); // 30ms per letter
      } else {
        setAnimatedText(newText);
      }
    };
    
    animate();
  };

  // Update animated text when transcription changes (for manual typing)
  useEffect(() => {
    if (!isRecording && transcription !== animatedText) {
      // For manual typing, update immediately without animation
      setAnimatedText(transcription);
      previousTextRef.current = transcription.replace(/\s*\[listening\.\.\.\]\s*$/, '').trim();
    }
  }, [transcription, isRecording, animatedText]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const handleCancel = () => {
    stopRecording();
    if (confirmationData) {
      setConfirmationData(null);
    } else {
      router.back();
    }
  };

  // Show confirmation view if we have parsed data
  if (confirmationData) {
    return <VoiceJournalConfirmation data={confirmationData} onCancel={handleConfirmationCancel} />;
  }

  if (hasPermission === false) {
    return (
      <div className="z-50 fixed inset-0 flex justify-center items-center bg-black">
        <div className="space-y-4 px-6 max-w-md text-center">
          <p className="text-white text-lg">
            Speech recognition is not available in your browser or microphone access was denied.
          </p>
          <p className="text-zinc-400 text-sm">
            Please use Chrome, Edge, or another browser that supports speech recognition, and ensure microphone permissions are enabled.
          </p>
          <button
            onClick={handleCancel}
            className="bg-zinc-800 hover:bg-zinc-700 mt-6 px-6 py-3 rounded-full text-white transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="z-50 fixed inset-0 flex flex-col bg-black">
      {/* Main Content Area - Centered Transcription */}
      <div className="relative flex flex-1 justify-center items-center px-6 py-8 overflow-hidden">
        <div className="relative w-full max-w-3xl">
          {/* Loading Animation - Shown above when processing */}
          {showLoadingAnimation && isProcessing && (
            <div 
              className="top-0 right-0 left-0 absolute flex flex-col justify-center items-center space-y-4 py-12 transition-all duration-500 ease-out"
            >
              <Helix
                size="60"
                speed="2.5"
                color="#8B5CF6"
              />
            </div>
          )}

          {/* Input Textarea - Always shown, transitions down when processing */}
          <div 
            className="relative transition-all duration-700 ease-in-out"
            style={{
              transform: textTranslated && isProcessing ? 'translateY(8rem)' : 'translateY(0)',
              opacity: textTranslated && isProcessing ? 0.3 : 1,
            }}
          >
            {/* Animated Display - Shows during recording with letter-by-letter animation */}
            {isRecording && animatedText && !isProcessing ? (
              <div className="bg-zinc-900/50 backdrop-blur-sm p-8 border border-zinc-800 rounded-2xl w-full min-h-[300px] text-white text-lg text-center leading-relaxed">
                {animatedText}
                {transcription.includes('[listening...]') && (
                  <span className="text-zinc-500 animate-pulse"> [listening...]</span>
                )}
              </div>
            ) : (
              <textarea
                id="voice-journal-textarea"
                name="voice-journal-textarea"
                value={isProcessing ? submittedText : transcription}
                onChange={(e) => setTranscription(e.target.value)}
                onFocus={stopRecording}
                placeholder={isRecording ? 'Listening...' : 'Tap the microphone to start recording, or type your meal here...'}
                disabled={isRecording || isProcessing}
                readOnly={isProcessing}
                className="justify-center items-center bg-zinc-900/50 disabled:opacity-60 backdrop-blur-sm p-8 border border-zinc-800 focus:border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary w-full min-h-[300px] font-bold text-white placeholder:text-zinc-500 text-lg text-center leading-relaxed resize-none disabled:cursor-not-allowed"
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - 3 Buttons */}
      <div className="safe-area-inset-bottom bg-zinc-900/80 backdrop-blur-sm border-zinc-800 border-t">
        <div className="flex justify-evenly items-center gap-4 mx-auto px-6 py-4 max-w-2xl">
          {/* Cancel Button (X) */}
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="flex justify-center items-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-full w-14 h-14 active:scale-95 transition-all disabled:cursor-not-allowed"
            aria-label="Cancel"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Record Button (Microphone) */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={hasPermission !== true || isProcessing}
            className={`flex items-center justify-center w-20 h-20 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                : 'bg-brand-primary hover:bg-brand-primary-dark'
            } ${isIOSDevice ? 'opacity-60' : ''}`}
            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
            title={isIOSDevice ? 'Voice recording has limited support on iOS. You can type your meal instead.' : undefined}
          >
            {isRecording ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>

          {/* Submit Button (CheckMark) */}
          <button
            onClick={handleSubmit}
            disabled={!transcription.trim() || isProcessing || isRecording}
            className="flex justify-center items-center bg-zinc-800 hover:bg-zinc-700 disabled:hover:bg-zinc-800 disabled:opacity-50 rounded-full w-14 h-14 active:scale-95 transition-all disabled:cursor-not-allowed"
            aria-label="Submit"
          >
            <Check className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

