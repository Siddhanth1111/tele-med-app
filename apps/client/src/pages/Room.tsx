import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// --- MEDICINE LIST (Kept same as before) ---
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
  
  // <--- FIX 1: Store Remote Stream in State so it survives re-renders --->
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  // <--- FIX 2: Queue for ICE Candidates that arrive too early --->
  const candidateQueue = useRef<RTCIceCandidate[]>([]);

  const appointmentId = roomId?.split('-').pop();

  // 1. Timer Effect
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

  // 2. Main WebRTC Effect
  useEffect(() => {
    const videoUrl = import.meta.env.VITE_VIDEO_URL || "http://localhost:3003";
    
    // Initialize Socket
    if (!socketRef.current) {
      socketRef.current = io(videoUrl);
    }
    const socket = socketRef.current;

    // Get User Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (userVideo.current) userVideo.current.srcObject = stream;
        
        socket.emit("join-room", roomId, user?.id);
        setStatus("Waiting for other participant...");
      })
      .catch(err => {
        console.error("Error accessing media:", err);
        setStatus("Camera/Microphone access denied");
      });

    // --- Socket Event Handlers ---

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
      
      // Process any queued candidates now that remote description is set
      processCandidateQueue();

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      
      socket.emit("answer", { target: payload.caller, caller: socket.id, sdp: answer });
    };

    const handleAnswer = (payload: any) => {
      console.log("Received Answer");
      const peer = peerRef.current;
      
      // Prevent crash if already connected
      if (!peer || peer.signalingState === "stable") {
        console.warn("Connection stable. Ignoring duplicate answer.");
        return;
      }

      peer.setRemoteDescription(new RTCSessionDescription(payload.sdp))
        .then(() => {
             // Process any queued candidates
             processCandidateQueue();
        })
        .catch(e => console.error("Error setting remote description:", e));
    };

    const handleIceCandidate = (candidate: any) => {
      const peer = peerRef.current;
      const ice = new RTCIceCandidate(candidate);
      
      if (peer && peer.remoteDescription) {
        peer.addIceCandidate(ice).catch(e => console.error("Error adding ice:", e));
      } else {
        // Queue it if we aren't ready yet
        console.log("Queueing ICE candidate");
        candidateQueue.current.push(ice);
      }
    };

    // Clean up old listeners to prevent duplicates
    socket.off("user-connected");
    socket.off("offer");
    socket.off("answer");
    socket.off("ice-candidate");

    // Register new listeners
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

  // 3. Helper Functions
  
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
      // <--- FIX: Update State, not just Ref --->
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

  // <--- FIX 3: Ensure Video Plays when Stream Updates --->
  useEffect(() => {
    if (remoteVideo.current && remoteStream) {
      remoteVideo.current.srcObject = remoteStream;
      remoteVideo.current.play().catch(e => console.log("Autoplay blocked:", e));
    }
  }, [remoteStream]);


  // ... (Keep your toggleAudio, toggleVideo, prescription functions exactly as they were) ...
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

  // --- RENDER (Kept mostly same, just verified video tag) ---
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 px-6 py-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${status === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <span className="text-sm font-medium text-gray-300">{status}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
               {formatDuration(callDuration)}
            </div>
          </div>
          {/* Header Buttons */}
          <div className="flex items-center gap-2">
            {user?.role === 'DOCTOR' && (
              <button onClick={() => setShowPrescribe(!showPrescribe)} className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">
                {showPrescribe ? "Hide" : "Prescribe"}
              </button>
            )}
            <button onClick={endCall} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">End Call</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className={`flex flex-col transition-all duration-300 ${showPrescribe ? 'w-full lg:w-2/3' : 'w-full'}`}>
          <div className="flex-1 p-4 relative">
            <div className="w-full h-full bg-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 relative">
              
              {/* --- REMOTE VIDEO --- */}
              <video 
                ref={remoteVideo} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              
              {/* Waiting Placeholder (Only show if no remote stream) */}
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                     <p className="text-gray-500">Waiting for participant...</p>
                  </div>
                </div>
              )}

              {/* My Video (PiP) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-950 rounded-xl overflow-hidden shadow-xl border-2 border-gray-700">
                <video 
                  ref={userVideo} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 px-6 py-4 flex-shrink-0">
             <div className="flex justify-center gap-4">
                <button onClick={toggleAudio} className={`p-4 rounded-full ${isAudioOn ? 'bg-gray-700' : 'bg-red-600'}`}>
                    {isAudioOn ? "Mic On" : "Mic Off"}
                </button>
                <button onClick={toggleVideo} className={`p-4 rounded-full ${isVideoOn ? 'bg-gray-700' : 'bg-red-600'}`}>
                    {isVideoOn ? "Cam On" : "Cam Off"}
                </button>
             </div>
          </div>
        </div>

        {/* Prescription Sidebar */}
        {showPrescribe && (
           // ... (Same as your existing prescription sidebar code) ...
           <div className="w-full lg:w-1/3 bg-white text-gray-900 border-l border-gray-200 flex flex-col">
              <div className="p-4 bg-blue-600 text-white">Prescription</div>
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  <input placeholder="Diagnosis" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full border p-2 rounded" />
                  <textarea placeholder="Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full border p-2 rounded" />
                  <div className="flex flex-wrap gap-2">
                     {MEDICINE_LIST.map(med => <button key={med} onClick={() => addMedicine(med)} className="bg-gray-200 p-1 text-xs rounded">{med}</button>)}
                  </div>
                  <div>
                    {selectedMeds.map((med, i) => <div key={i} className="flex justify-between text-sm bg-gray-100 p-2 rounded mt-1"><span>{med.name}</span> <button onClick={() => removeMed(i)} className="text-red-500">x</button></div>)}
                  </div>
              </div>
              <div className="p-4"><button onClick={submitPrescription} className="w-full bg-green-600 text-white p-3 rounded">Submit</button></div>
           </div>
        )}
      </div>
    </div>
  );
}