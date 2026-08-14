import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  X,
  Play,
  Award,
  ChevronRight,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Zap,
} from 'lucide-react';
import {
  getMockInterviewQuestions,
  evaluateCandidateResponse,
  generateFinalInterviewFeedback,
  RecruiterQuestionTemplate,
} from '../services/aiRecruiterService';
import { MockInterviewExchange, MockInterviewFeedback } from '../types';

interface AIRecruiterInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIRecruiterInterviewModal: React.FC<AIRecruiterInterviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile } = useApp();

  // Media state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRequestingCamera, setIsRequestingCamera] = useState<boolean>(false);

  // Interview state
  const [sessionState, setSessionState] = useState<'intro' | 'interviewing' | 'evaluating' | 'feedback_review' | 'completed'>('intro');
  const [questions, setQuestions] = useState<RecruiterQuestionTemplate[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [isRecruiterSpeaking, setIsRecruiterSpeaking] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  
  // Results state
  const [exchanges, setExchanges] = useState<MockInterviewExchange[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<{
    score: number;
    recruiterSpokenFeedback: string;
    strengths: string[];
    improvementTips: string[];
  } | null>(null);
  const [finalReport, setFinalReport] = useState<MockInterviewFeedback | null>(null);

  // Speech Recognition Reference
  const recognitionRef = useRef<any>(null);

  // Callback ref to guarantee stream binds immediately whenever video DOM element mounts
  const setCandidateVideoRef = (element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && stream && isCameraOn) {
      if (element.srcObject !== stream) {
        element.srcObject = stream;
      }
      element.play().catch(e => console.warn('Video play prevented on mount:', e));
    }
  };

  // Keep active stream attached across screen state transitions
  useEffect(() => {
    if (videoRef.current && stream && isCameraOn) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(e => console.warn('Video auto-play suppressed:', e));
    }
  }, [stream, sessionState, isCameraOn]);

  // Start Camera Feed with resilient fallbacks
  const startCamera = async () => {
    setIsRequestingCamera(true);
    setCameraError(null);
    try {
      let mediaStream: MediaStream | null = null;

      // 1. Try standard webcam + mic
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: true,
        });
      } catch (e1) {
        console.warn('Initial HD stream request failed, falling back to basic video+audio:', e1);
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        } catch (e2) {
          console.warn('Video+Audio failed, falling back to video-only:', e2);
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (mediaStream) {
        setStream(mediaStream);
        setIsCameraOn(true);
        setIsMicOn(mediaStream.getAudioTracks().length > 0);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => console.warn('Video play err:', err));
        }
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err?.message || err);
      setCameraError('Camera access not allowed. Please click "Enable Camera" and choose "Allow" in your browser popup.');
    } finally {
      setIsRequestingCamera(false);
    }
  };

  // Stop Camera Feed
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    } else {
      startCamera();
    }
  };

  // Toggle Mic
  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    } else {
      setIsMicOn(!isMicOn);
    }
  };

  // Toggle Speech Recognition
  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Speech recognition start error:', e);
        setIsListening(false);
      }
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateAnswer(prev => {
          const base = prev.trim();
          return base ? `${base} ${transcript}` : transcript;
        });
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition notice:', e?.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Text to Speech
  const speakText = (text: string, onEndCallback?: () => void) => {
    if (isVoiceMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.lang = 'en-US';

      const voices = window.speechSynthesis.getVoices();
      // Prefer friendly English female voice if available for recruiter persona
      const preferredVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen') || v.name.includes('Natural') || v.name.includes('Female')) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsRecruiterSpeaking(true);
      utterance.onend = () => {
        setIsRecruiterSpeaking(false);
        if (onEndCallback) onEndCallback();
      };
      utterance.onerror = () => {
        setIsRecruiterSpeaking(false);
        if (onEndCallback) onEndCallback();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsRecruiterSpeaking(false);
      if (onEndCallback) onEndCallback();
    }
  };

  // Open modal handler
  useEffect(() => {
    if (isOpen) {
      startCamera();
      loadQuestions();
    } else {
      stopCamera();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    }
  }, [isOpen]);

  // Load custom interview questions
  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const qList = await getMockInterviewQuestions(
        profile.careerGoal || 'Software Engineer',
        profile.currentSkills || [],
        profile.name || 'Candidate'
      );
      setQuestions(qList);
    } catch (e) {
      console.error('Error loading questions:', e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Start the interview
  const handleStartInterview = () => {
    setSessionState('interviewing');
    setCurrentQIndex(0);
    setCandidateAnswer('');
    setExchanges([]);
    setFinalReport(null);
    setCurrentEvaluation(null);

    const firstQ = questions[0];
    if (firstQ) {
      speakText(firstQ.question);
    }
  };

  // Submit candidate answer for real-time evaluation
  const handleSubmitAnswer = async () => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    setSessionState('evaluating');

    try {
      const evalResult = await evaluateCandidateResponse(
        currentQ.question,
        currentQ.category,
        candidateAnswer,
        profile.careerGoal || 'Software Engineer'
      );

      const exchange: MockInterviewExchange = {
        questionNumber: currentQIndex + 1,
        category: currentQ.category,
        question: currentQ.question,
        candidateAnswer: candidateAnswer || '(No verbal response provided)',
        recruiterFeedback: evalResult.recruiterSpokenFeedback,
        score: evalResult.score,
        strengths: evalResult.strengths,
        improvementTips: evalResult.improvementTips,
        timestamp: new Date().toISOString(),
      };

      const updatedExchanges = [...exchanges, exchange];
      setExchanges(updatedExchanges);
      setCurrentEvaluation(evalResult);
      setSessionState('feedback_review');

      // Recruiter speaks feedback aloud
      speakText(evalResult.recruiterSpokenFeedback);
    } catch (err) {
      console.error('Error evaluating response:', err);
      setSessionState('feedback_review');
    }
  };

  // Proceed to next question or final debrief
  const handleNextStep = async () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    if (currentQIndex + 1 < questions.length) {
      const nextIndex = currentQIndex + 1;
      setCurrentQIndex(nextIndex);
      setCandidateAnswer('');
      setCurrentEvaluation(null);
      setShowHint(false);
      setSessionState('interviewing');

      const nextQ = questions[nextIndex];
      if (nextQ) {
        speakText(nextQ.question);
      }
    } else {
      // Completed all questions -> Generate Final Performance Debrief
      setSessionState('evaluating');
      try {
        const report = await generateFinalInterviewFeedback(
          profile.careerGoal || 'Software Engineer',
          exchanges,
          profile.name || 'Candidate'
        );
        setFinalReport(report);
        setSessionState('completed');
        speakText(`Interview completed! Great job ${profile.name || 'candidate'}. You achieved an overall score of ${report.overallScore} out of 100 with a rating of ${report.verdict}. Here is your full hiring debrief!`);
      } catch (e) {
        console.error('Error generating debrief:', e);
        setSessionState('completed');
      }
    }
  };

  // Restart interview
  const handleRestart = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSessionState('intro');
    setCurrentQIndex(0);
    setCandidateAnswer('');
    setExchanges([]);
    setCurrentEvaluation(null);
    setFinalReport(null);
    loadQuestions();
  };

  if (!isOpen) return null;

  const currentQ = questions[currentQIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm text-white">AI Recruiter Live Mock Interview</h2>
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  LIVE VIDEO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Target Role: <span className="text-indigo-300 font-semibold">{profile.careerGoal}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Recruiter Voice Mute Toggle */}
            <button
              onClick={() => {
                if (!isVoiceMuted && window.speechSynthesis) window.speechSynthesis.cancel();
                setIsVoiceMuted(!isVoiceMuted);
              }}
              title={isVoiceMuted ? 'Unmute AI Recruiter Voice' : 'Mute AI Recruiter Voice'}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isVoiceMuted
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-slate-700/60 border-slate-600 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
              <span className="hidden sm:inline text-xs">{isVoiceMuted ? 'Voice Muted' : 'Recruiter Voice'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">

          {/* INTRO SCREEN */}
          {sessionState === 'intro' && (
            <div className="space-y-6 text-center max-w-2xl mx-auto py-4">
              <div className="relative inline-block mx-auto">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/30 mx-auto">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                    alt="AI Recruiter"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="absolute bottom-1 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Meet Sarah Jenkins, Senior Technical Recruiter
                </h3>
                <p className="text-sm text-slate-300 mt-1 max-w-lg mx-auto">
                  Sarah will conduct a 4-round technical & behavioral video interview tailored for your{' '}
                  <span className="text-indigo-400 font-bold">{profile.careerGoal}</span> profile.
                </p>
              </div>

              {/* What happens in this interview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-2xl flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Live Camera & Audio Feed</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Practices your eye contact, screen presence, and real-time verbal cadence.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-2xl flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Real-Time Voice AI Recruiter</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Listens to your spoken response and speaks interactive questions and feedback.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-2xl flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Instant STAR Evaluation</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Evaluates technical accuracy, confidence, and structure after every answer.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-2xl flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Placement Readiness Debrief</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Delivers a complete Hiring Committee Scorecard & Actionable Tips report.
                    </p>
                  </div>
                </div>
              </div>

              {/* Camera Preview check */}
              <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 bg-slate-950 rounded-xl overflow-hidden border border-slate-700 relative flex items-center justify-center">
                    <video
                      ref={setCandidateVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transform scale-x-[-1] ${!stream || !isCameraOn ? 'hidden' : 'block'}`}
                    />
                    {(!stream || !isCameraOn) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-[10px] p-1 text-center">
                        <VideoOff className="w-4 h-4 mb-0.5 text-slate-500" />
                        <span>Off</span>
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${stream && isCameraOn ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {stream && isCameraOn ? 'Camera & Microphone Connected' : 'Camera Access Optional / Ready'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {stream && isCameraOn ? 'Live webcam feed detected.' : 'Click below to grant camera access or continue with voice & text.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={toggleCamera}
                    disabled={isRequestingCamera}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      isCameraOn && stream
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    }`}
                  >
                    {isCameraOn && stream ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-rose-300" />}
                    <span>{isRequestingCamera ? 'Requesting...' : isCameraOn && stream ? 'Cam On' : 'Enable Camera'}</span>
                  </button>
                  <button
                    onClick={toggleMic}
                    className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                      isMicOn
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {cameraError && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center justify-between gap-2 text-left">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                  <button
                    onClick={startCamera}
                    className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px] shrink-0 hover:bg-amber-400"
                  >
                    Try Again
                  </button>
                </div>
              )}

              <button
                onClick={handleStartInterview}
                disabled={loadingQuestions}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                {loadingQuestions ? 'Preparing Interview Questions...' : 'Start Live Recruiter Interview'}
              </button>
            </div>
          )}

          {/* ACTIVE INTERVIEW & FEEDBACK STAGES */}
          {(sessionState === 'interviewing' || sessionState === 'evaluating' || sessionState === 'feedback_review') && currentQ && (
            <div className="space-y-4">
              
              {/* Progress Rounds Header */}
              <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-2xl border border-slate-700 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-indigo-400 uppercase tracking-wider text-[11px]">
                    Round {currentQIndex + 1} of {questions.length}:
                  </span>
                  <span className="font-bold text-white bg-slate-700/80 px-2 py-0.5 rounded-md text-[11px]">
                    {currentQ.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all ${
                        idx < currentQIndex
                          ? 'w-6 bg-emerald-500'
                          : idx === currentQIndex
                          ? 'w-8 bg-indigo-500 animate-pulse'
                          : 'w-2 bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Video Split Screen: Recruiter vs Candidate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* AI Recruiter Video Card */}
                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden min-h-[220px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/50 shadow-md">
                        <img
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                          alt="Sarah Jenkins"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">Sarah Jenkins</h4>
                        <p className="text-[10px] text-slate-400">Senior Technical Recruiter</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isRecruiterSpeaking ? (
                        <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <Volume2 className="w-3 h-3 text-indigo-400 animate-bounce" />
                          <span>Speaking...</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded-full font-medium">
                          Listening
                        </span>
                      )}

                      <button
                        onClick={() => speakText(currentQ.question)}
                        title="Replay Question Audio"
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Recruiter Question Bubble */}
                  <div className="my-3 bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 shadow-inner">
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Question {currentQIndex + 1}:
                    </p>
                    <p className="text-sm font-bold text-white leading-relaxed">
                      "{currentQ.question}"
                    </p>
                  </div>

                  {/* Talking hint toggle */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      {showHint ? 'Hide Talking Tips' : 'Show Answer Hint & Points'}
                    </button>
                    <span className="text-slate-400 text-[10px]">
                      Pace: 1-2 min response
                    </span>
                  </div>

                  {showHint && (
                    <div className="mt-2 p-3 bg-indigo-950/60 border border-indigo-800/60 rounded-xl text-xs space-y-1.5 animate-fade-in">
                      <p className="text-[11px] text-indigo-300 font-bold">💡 Recruiter Hint:</p>
                      <p className="text-[11px] text-slate-300">{currentQ.contextHint}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentQ.expectedKeyPoints.map((pt, i) => (
                          <span key={i} className="text-[10px] bg-indigo-900/80 text-indigo-200 px-2 py-0.5 rounded">
                            • {pt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Candidate Video Feed & Speech Controls */}
                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden min-h-[220px]">
                  
                  {/* Candidate live preview container */}
                  <div className="relative w-full h-44 bg-slate-950 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                    <video
                      ref={setCandidateVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transform scale-x-[-1] ${!stream || !isCameraOn ? 'hidden' : 'block'}`}
                    />
                    
                    {(!stream || !isCameraOn) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-slate-400 p-4 text-center">
                        <VideoOff className="w-6 h-6 mb-1.5 text-slate-500" />
                        <p className="text-xs font-bold text-slate-300">Camera Feed Inactive</p>
                        <p className="text-[10px] text-slate-500 mb-2">Speech & audio recording are active.</p>
                        <button
                          onClick={toggleCamera}
                          disabled={isRequestingCamera}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          {isRequestingCamera ? 'Connecting...' : 'Connect Camera'}
                        </button>
                      </div>
                    )}

                    {/* Live indicators */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-white border border-slate-700">
                      <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : stream && isCameraOn ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {profile.name || 'You'} (Candidate)
                    </div>

                    {/* Mic & Cam toggle badges */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <button
                        onClick={toggleCamera}
                        title={isCameraOn && stream ? "Turn off camera" : "Turn on camera"}
                        className={`p-1.5 rounded-lg text-xs backdrop-blur-md transition-colors cursor-pointer ${
                          isCameraOn && stream ? 'bg-slate-900/80 text-white hover:bg-slate-800' : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        {isCameraOn && stream ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={toggleMic}
                        title={isMicOn ? "Mute mic" : "Unmute mic"}
                        className={`p-1.5 rounded-lg text-xs backdrop-blur-md transition-colors cursor-pointer ${
                          isMicOn ? 'bg-slate-900/80 text-white hover:bg-slate-800' : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Spoken Mic Input Controls */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {speechSupported && (
                        <button
                          onClick={toggleSpeechRecognition}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                            isListening
                              ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {isListening ? (
                            <>
                              <Mic className="w-3.5 h-3.5 animate-spin" />
                              Listening... (Click to Pause)
                            </>
                          ) : (
                            <>
                              <Mic className="w-3.5 h-3.5" />
                              Speak Your Answer (Mic)
                            </>
                          )}
                        </button>
                      )}

                      {candidateAnswer && (
                        <button
                          onClick={() => setCandidateAnswer('')}
                          className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {candidateAnswer.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                </div>
              </div>

              {/* Candidate Spoken Transcript & Editor */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    Your Spoken Transcript & Response:
                  </label>
                  <span className="text-[10px] text-slate-400">
                    You can speak naturally or edit text directly before submitting.
                  </span>
                </div>

                <textarea
                  value={candidateAnswer}
                  onChange={e => setCandidateAnswer(e.target.value)}
                  placeholder="Speak through your microphone or type your response here... (e.g. 'In my previous project, I architected a high-throughput API with Node.js and Redis caching, reducing query latency by 45%...')"
                  rows={3}
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans resize-none"
                />

                {/* Response Submission Button */}
                {sessionState === 'interviewing' && (
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!candidateAnswer.trim()}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Answer to Recruiter
                    </button>
                  </div>
                )}

                {/* Evaluating Loader */}
                {sessionState === 'evaluating' && (
                  <div className="p-4 bg-indigo-950/50 border border-indigo-800/60 rounded-xl flex items-center justify-center gap-3 text-indigo-200 text-xs font-bold animate-pulse">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                    AI Recruiter Sarah is analyzing your response and technical depth...
                  </div>
                )}

                {/* Instant Feedback Card */}
                {sessionState === 'feedback_review' && currentEvaluation && (
                  <div className="p-4 bg-slate-900 border border-emerald-500/40 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Recruiter Evaluation:
                        </span>
                        <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                          Score: {currentEvaluation.score}/100
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        STAR Structure: <strong className="text-white">Good</strong>
                      </span>
                    </div>

                    {/* Recruiter spoken verdict */}
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                      <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                        "{currentEvaluation.recruiterSpokenFeedback}"
                      </p>
                    </div>

                    {/* Strengths & Tips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl space-y-1">
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> What You Did Well:
                        </span>
                        <ul className="text-slate-300 space-y-0.5">
                          {currentEvaluation.strengths.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-xl space-y-1">
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5" /> Placement Pro-Tip:
                        </span>
                        <ul className="text-slate-300 space-y-0.5">
                          {currentEvaluation.improvementTips.map((t, i) => (
                            <li key={i}>• {t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Next Question / Finish Action */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleNextStep}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                      >
                        {currentQIndex + 1 < questions.length ? (
                          <>
                            Next Question ({currentQIndex + 2}/{questions.length})
                            <ChevronRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            View Final Hiring Committee Scorecard
                            <Award className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COMPLETED / FINAL SCORECARD SCREEN */}
          {sessionState === 'completed' && finalReport && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Hiring Verdict Hero Banner */}
              <div className="bg-gradient-to-br from-indigo-900/60 via-slate-800 to-purple-900/60 p-6 rounded-3xl border border-indigo-500/30 text-center relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black">
                    <Award className="w-4 h-4 text-indigo-400" /> OFFICIAL INTERVIEW SCORECARD
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Hiring Verdict:{' '}
                    <span
                      className={
                        finalReport.verdict === 'Strong Hire'
                          ? 'text-emerald-400'
                          : finalReport.verdict === 'Hire'
                          ? 'text-indigo-400'
                          : 'text-amber-400'
                      }
                    >
                      {finalReport.verdict}
                    </span>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                    {finalReport.summary}
                  </p>

                  <div className="pt-3 flex flex-wrap justify-center items-center gap-4 text-center">
                    <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700 min-w-[100px]">
                      <p className="text-[10px] text-slate-400 uppercase font-extrabold">Overall Score</p>
                      <p className="text-2xl font-black text-emerald-400">{finalReport.overallScore}/100</p>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700 min-w-[100px]">
                      <p className="text-[10px] text-slate-400 uppercase font-extrabold">Technical Depth</p>
                      <p className="text-2xl font-black text-indigo-400">{finalReport.technicalScore}%</p>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700 min-w-[100px]">
                      <p className="text-[10px] text-slate-400 uppercase font-extrabold">Communication</p>
                      <p className="text-2xl font-black text-purple-400">{finalReport.communicationScore}%</p>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700 min-w-[100px]">
                      <p className="text-[10px] text-slate-400 uppercase font-extrabold">STAR Structure</p>
                      <p className="text-2xl font-black text-cyan-400">{finalReport.starScore}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Action Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-5 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-3">
                  <h4 className="font-extrabold text-emerald-400 flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4" /> Key Candidate Strengths:
                  </h4>
                  <ul className="space-y-2 text-slate-200">
                    {finalReport.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-3">
                  <h4 className="font-extrabold text-amber-400 flex items-center gap-2 text-sm">
                    <Lightbulb className="w-4 h-4" /> Recommendations for Campus Placements:
                  </h4>
                  <ul className="space-y-2 text-slate-200">
                    {finalReport.areasToImprove.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Question By Question Transcript Review */}
              <div className="p-5 bg-slate-800/60 border border-slate-700 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-white text-sm">Full Round-by-Round Interview Transcript:</h4>
                <div className="space-y-3">
                  {exchanges.map((ex, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-400">
                          Q{ex.questionNumber} ({ex.category})
                        </span>
                        <span className="font-extrabold bg-slate-800 px-2 py-0.5 rounded text-emerald-400">
                          Score: {ex.score}/100
                        </span>
                      </div>
                      <p className="font-bold text-white">"{ex.question}"</p>
                      <div className="p-2.5 bg-slate-950/80 rounded-lg text-slate-300 font-mono text-[11px]">
                        <strong>Your Response:</strong> {ex.candidateAnswer}
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        <strong>Recruiter Feedback:</strong> {ex.recruiterFeedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Start New Mock Interview
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Close Scorecard & Continue Prep
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
