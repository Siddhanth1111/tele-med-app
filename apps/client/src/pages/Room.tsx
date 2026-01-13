import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MEDICINE_LIST = [
  "Paracetamol 500mg (Fever/Pain)", "Amoxicillin 250mg (Antibiotic)",
  "Ibuprofen 400mg (Pain/Inflammation)", "Cetirizine 10mg (Allergy)",
  "Cough Syrup (100ml)", "Omeprazole 20mg (Acidity)",
  "Azithromycin 500mg (Antibiotic)", "Loratadine 10mg (Allergy)"
];

export default function Room() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // UI State
  const [status, setStatus] = useState("Connecting...");
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showPrescribe, setShowPrescribe] = useState(false);
  
  // Prescription State
  const [diagnosis, setDiagnosis] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedMeds, setSelectedMeds] = useState<{name: string, quantity: string, instructions: string}[]>([]);

  // WebRTC Refs
  const userVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const candidateQueue = useRef<RTCIceCandidate[]>([]);

  const appointmentId = roomId?.split('-').pop();

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Main WebRTC Effect
  useEffect(() => {
    const videoUrl = import.meta.env.VITE_VIDEO_URL || "http://localhost:3003";
    
    if (!socketRef.current) {
      socketRef.current = io(videoUrl);
    }
    const socket = socketRef.current;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (userVideo.current) userVideo.current.srcObject = stream;
        
        setStatus("Setting up connection...");

        setTimeout(() => {
          socket.emit("join-room", roomId, user?.id);
          setStatus("Waiting for other participant...");
        }, 1000); 
      })
      .catch(err => {
        console.error("Error accessing media:", err);
        setStatus("Camera/Microphone access denied");
      });

    const handleUserConnected = (socketId: string) => {
      console.log("User connected:", socketId);
      setStatus("Connected");
      
      const peer = createPeer(socketId);
      peerRef.current = peer;

      peer.createOffer().then(offer => {
        peer.setLocalDescription(offer);
        socket.emit("offer", { target: socketId, caller: socket.id, sdp: offer });
      });
    };

    const handleOffer = async (payload: any) => {
      console.log("Received Offer from", payload.caller);
      const peer = createPeer(payload.caller);
      peerRef.current = peer;
      
      await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      processCandidateQueue();

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      
      socket.emit("answer", { target: payload.caller, caller: socket.id, sdp: answer });
    };

    const handleAnswer = (payload: any) => {
      console.log("Received Answer");
      const peer = peerRef.current;
      
      if (!peer || peer.signalingState === "stable") {
        console.warn("Connection stable. Ignoring duplicate answer.");
        return;
      }

      peer.setRemoteDescription(new RTCSessionDescription(payload.sdp))
        .then(() => processCandidateQueue())
        .catch(e => console.error("Error setting remote description:", e));
    };

    const handleIceCandidate = (candidate: any) => {
      const peer = peerRef.current;
      const ice = new RTCIceCandidate(candidate);
      
      if (peer && peer.remoteDescription) {
        peer.addIceCandidate(ice).catch(e => console.error("Error adding ice:", e));
      } else {
        candidateQueue.current.push(ice);
      }
    };

    socket.off("user-connected");
    socket.off("offer");
    socket.off("answer");
    socket.off("ice-candidate");

    socket.on("user-connected", handleUserConnected);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("user-connected", handleUserConnected);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [roomId]);

  const processCandidateQueue = () => {
    const peer = peerRef.current;
    if (!peer) return;
    while (candidateQueue.current.length > 0) {
      const candidate = candidateQueue.current.shift();
      if (candidate) {
        console.log("Adding queued candidate");
        peer.addIceCandidate(candidate).catch(e => console.error("Error adding queued ice:", e));
      }
    }
  };

  function createPeer(targetSocketId: string) {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478"
          ] 
        }
      ]
    });

    streamRef.current?.getTracks().forEach(track => {
      if (streamRef.current) peer.addTrack(track, streamRef.current);
    });

    peer.ontrack = (e) => {
      console.log("Received remote track", e.streams[0]);
      setRemoteStream(e.streams[0]);
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit("ice-candidate", { 
          target: targetSocketId, 
          candidate: e.candidate 
        });
      }
    };

    return peer;
  }

  useEffect(() => {
    if (remoteVideo.current && remoteStream) {
      remoteVideo.current.srcObject = remoteStream;
      
      const playVideo = async () => {
        try {
          await remoteVideo.current?.play();
          console.log("Video playing successfully");
        } catch (err) {
          console.error("Autoplay failed. User interaction may be needed.", err);
        }
      };

      playVideo();
    }
  }, [remoteStream]);

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const addMedicine = (name: string) => {
    if (selectedMeds.find(m => m.name === name)) return;
    setSelectedMeds([...selectedMeds, { name, quantity: "1 Strip", instructions: "After Food" }]);
  };

  const updateMed = (index: number, field: string, value: string) => {
    const updated = [...selectedMeds];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedMeds(updated);
  };

  const removeMed = (index: number) => {
    setSelectedMeds(selectedMeds.filter((_, i) => i !== index));
  };

  const submitPrescription = async () => {
    if (!diagnosis || selectedMeds.length === 0) {
      alert("Please add a diagnosis and at least one medicine.");
      return;
    }
    try {
      const gatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      await axios.post(`${gatewayUrl}/api/appointments/prescription`, {
        appointmentId,
        diagnosis,
        remarks,
        medicines: selectedMeds
      });
      alert("✅ Prescription Sent Successfully!");
      setShowPrescribe(false);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send prescription.");
    }
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      
      {/* Top Header Bar */}
      <div className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${status === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <span className="text-xs sm:text-sm font-medium text-gray-300">{status}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(callDuration)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'DOCTOR' && (
              <button 
                onClick={() => setShowPrescribe(!showPrescribe)}
                className="hidden sm:flex items-center gap-2 bg-teal-600 hover:bg-teal-700 px-3 sm:px-4 py-2 rounded-lg font-medium transition text-xs sm:text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">{showPrescribe ? "Hide" : "Prescribe"}</span>
              </button>
            )}
            <button 
              onClick={endCall}
              className="bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2 rounded-lg font-medium transition text-xs sm:text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">End</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Video Section */}
        <div className={`flex flex-col transition-all duration-300 ${showPrescribe ? 'w-full lg:w-2/3' : 'w-full'}`}>
          
          {/* Video Container - FIXED HEIGHT */}
          <div className="flex-1 p-2 sm:p-4 overflow-hidden">
            <div className="w-full h-full bg-gray-950 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-gray-700 relative">
              
              {/* Remote Video */}
              <video 
                ref={remoteVideo} 
                autoPlay 
                playsInline 
                onClick={() => remoteVideo.current?.play()}
                className="w-full h-full object-contain bg-black cursor-pointer"
              />
              
              {/* Waiting Overlay */}
              {!remoteStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
                  <div className="text-center px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base mb-4">Waiting for participant...</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-4 py-2 rounded-lg border border-gray-700 transition"
                    >
                      Connection Issue? Click to Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Label for Remote User */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="text-xs sm:text-sm font-medium">
                  {user?.role === 'DOCTOR' ? 'Patient' : 'Doctor'}
                </span>
              </div>

              {/* My Video (Picture-in-Picture) - FIXED SIZE */}
              <div className="absolute bottom-3 right-3 w-32 h-24 sm:w-40 sm:h-28 lg:w-48 lg:h-36 bg-gray-950 rounded-lg sm:rounded-xl overflow-hidden shadow-xl border-2 border-gray-700">
                <video 
                  ref={userVideo} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                {!isVideoOn && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-1">
                        <span className="text-sm sm:text-base font-bold">{user?.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <p className="text-xs text-gray-400">Camera Off</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                  <span className="text-xs font-medium">You</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Controls Bar */}
          <div className="bg-gray-900/90 backdrop-blur-sm border-t border-gray-700/50 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex justify-center items-center gap-3 sm:gap-4">
              
              {/* Microphone Toggle */}
              <button
                onClick={toggleAudio}
                className={`p-3 sm:p-4 rounded-full transition transform hover:scale-110 active:scale-95 ${
                  isAudioOn 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                title={isAudioOn ? 'Mute' : 'Unmute'}
              >
                {isAudioOn ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={toggleVideo}
                className={`p-3 sm:p-4 rounded-full transition transform hover:scale-110 active:scale-95 ${
                  isVideoOn 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoOn ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                )}
              </button>

              {/* Mobile Prescription Button (Doctor Only) */}
              {user?.role === 'DOCTOR' && (
                <button 
                  onClick={() => setShowPrescribe(!showPrescribe)}
                  className="sm:hidden p-3 sm:p-4 bg-teal-600 hover:bg-teal-700 rounded-full transition transform hover:scale-110 active:scale-95"
                  title="Write Prescription"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Prescription Sidebar */}
        {showPrescribe && (
          <div className="w-full lg:w-1/3 bg-white text-gray-900 border-l border-gray-200 flex flex-col shadow-2xl max-h-screen overflow-hidden">
            
            {/* Sidebar Header */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-4 sm:px-6 py-4 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Write Prescription</h2>
                <p className="text-teal-100 text-xs sm:text-sm">Appointment #{appointmentId}</p>
              </div>
              <button 
                onClick={() => setShowPrescribe(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              
              {/* Diagnosis Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Diagnosis *
                </label>
                <input 
                  type="text" 
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                  placeholder="e.g. Acute Viral Fever"
                />
              </div>

              {/* Quick Add Medicine */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quick Add Medicine
                </label>
                <div className="flex flex-wrap gap-2">
                  {MEDICINE_LIST.map((med) => (
                    <button
                      key={med}
                      onClick={() => addMedicine(med)}
                      className="bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-teal-200 transition transform hover:scale-105 active:scale-95"
                    >
                      + {med.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prescribed Medicines List */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Prescribed Medicines ({selectedMeds.length})
                </label>
                
                {selectedMeds.length === 0 && (
                  <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-gray-500">No medicines added yet</p>
                  </div>
                )}

                <div className="space-y-3">
                  {selectedMeds.map((med, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50 to-teal-50 p-3 sm:p-4 rounded-xl border border-green-200 relative">
                      <button 
                        onClick={() => removeMed(index)} 
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <h4 className="font-bold text-green-800 mb-2 sm:mb-3 pr-6 text-sm sm:text-base">{med.name}</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs font-medium text-gray-600">Quantity</label>
                          <input 
                            value={med.quantity}
                            onChange={(e) => updateMed(index, 'quantity', e.target.value)}
                            className="w-full bg-white text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Instructions</label>
                          <input 
                            value={med.instructions}
                            onChange={(e) => updateMed(index, 'instructions', e.target.value)}
                            className="w-full bg-white text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Remarks
                </label>
                <textarea 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg h-20 sm:h-28 resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
placeholder="Additional advice, precautions, or follow-up instructions..."
/>
</div>
</div>
        {/* Footer Submit Button */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <button 
            onClick={submitPrescription}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Submit Prescription
          </button>
          <p className="text-xs text-gray-500 text-center mt-2 sm:mt-3">
            This will be sent to the patient and end the consultation
          </p>
        </div>
      </div>
    )}
  </div>
</div>
);
}