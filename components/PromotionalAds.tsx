"use client";

import React, { useState, useEffect, useRef } from "react";
import { Video, Camera, Upload, Play, Heart, Eye, Share2, Sparkles, CheckCircle2, RefreshCw, StopCircle, Trash2, Edit, Copy, AlertCircle, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Campaign {
  id: string;
  title: string;
  highlights: string;
  videoUrl: string;
  views: number;
  likes: number;
  createdAt: string;
}

interface PromotionalAdsProps {
  isAdmin?: boolean;
}

export default function PromotionalAds({ isAdmin = false }: PromotionalAdsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states (Create)
  const [title, setTitle] = useState("");
  const [highlights, setHighlights] = useState("");
  const [mediaSource, setMediaSource] = useState<"record" | "upload">("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [recordingPreviewUrl, setRecordingPreviewUrl] = useState<string | null>(null);

  // Editing states (Admin only)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editHighlights, setEditHighlights] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // UI Action states
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Refs
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load campaigns on mount
  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      if (res.ok) {
        const data = await res.json();
        if (data.campaigns) {
          setCampaigns(data.campaigns);
        }
      }
    } catch (err) {
      console.error("Error loading campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer for camera recording
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Clean up streams
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Start live webcam stream
  const startCamera = async () => {
    setCameraError(null);
    setRecordedBlob(null);
    setRecordingPreviewUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: true,
      });
      setCameraStream(stream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.muted = true;
        videoPreviewRef.current.play().catch(e => console.log("Video auto play prevented", e));
      }
    } catch (err: any) {
      console.error("Failed to access camera/mic:", err);
      setCameraError(
        "Could not access your camera or microphone. Please ensure permissions are granted and no other application is using them."
      );
    }
  };

  // Start recording video chunks
  const startRecording = () => {
    if (!cameraStream) return;
    chunksRef.current = [];
    setRecordingSeconds(0);
    setRecordedBlob(null);
    setRecordingPreviewUrl(null);

    try {
      let options = { mimeType: "video/webm;codecs=vp9,opus" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm;codecs=vp8,opus" };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: "video/webm" };
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: "video/mp4" };
          }
        }
      }

      const recorder = new MediaRecorder(cameraStream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || "video/webm" });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordingPreviewUrl(url);
        // Play recorded clip back to user for previewing
        setTimeout(() => {
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = null;
            videoPreviewRef.current.src = url;
            videoPreviewRef.current.muted = false;
            videoPreviewRef.current.controls = true;
            videoPreviewRef.current.play().catch(err => console.log("Failed to play recording preview", err));
          }
        }, 100);
      };

      recorder.start(250);
      setIsRecording(true);
    } catch (e) {
      console.error("Error starting MediaRecorder:", e);
      setCameraError("Your browser does not support on-the-fly video recording formats.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Switch tabs
  const handleSourceTabChange = (source: "record" | "upload") => {
    setMediaSource(source);
    setRecordedBlob(null);
    setUploadedFile(null);
    setRecordingPreviewUrl(null);
    setCameraError(null);
    stopCamera();

    if (source === "record") {
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  };

  // Drag & drop file actions
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        setUploadedFile(file);
      } else {
        alert("Please drop a valid video file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("video/")) {
        setUploadedFile(file);
      } else {
        alert("Please choose a valid video file.");
      }
    }
  };

  // Form submit (Publishing)
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);
    setPublishSuccess(false);

    if (!title.trim()) {
      setPublishError("Please enter a Video Campaign Title.");
      return;
    }
    if (!highlights.trim()) {
      setPublishError("Please fill out the Opening Highlights.");
      return;
    }

    let finalVideoFile: File | null = null;

    if (mediaSource === "upload") {
      if (!uploadedFile) {
        setPublishError("Please select a local video file to upload.");
        return;
      }
      finalVideoFile = uploadedFile;
    } else {
      if (!recordedBlob) {
        setPublishError("Please record a video clip or make sure recording is stopped first.");
        return;
      }
      const ext = mediaRecorderRef.current?.mimeType?.includes("mp4") ? ".mp4" : ".webm";
      finalVideoFile = new File([recordedBlob], `live_ad_${Date.now()}${ext}`, {
        type: recordedBlob.type,
      });
    }

    setIsPublishing(true);

    try {
      const payload = new FormData();
      payload.append("title", title);
      payload.append("highlights", highlights);
      payload.append("videoFile", finalVideoFile);

      const res = await fetch("/api/campaigns", {
        method: "POST",
        body: payload,
      });

      if (res.ok) {
        setPublishSuccess(true);
        setTitle("");
        setHighlights("");
        setUploadedFile(null);
        setRecordedBlob(null);
        setRecordingPreviewUrl(null);
        
        stopCamera();
        if (mediaSource === "record") {
          setTimeout(() => startCamera(), 500);
        }

        await fetchCampaigns();
      } else {
        const errData = await res.json();
        setPublishError(errData.error || "Failed to publish promotional campaign.");
      }
    } catch (err) {
      console.error("Error submitting ad campaign form:", err);
      setPublishError("Connection failed. Please verify your file size and network.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Edit Campaign Trigger
  const handleStartEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setEditTitle(campaign.title);
    setEditHighlights(campaign.highlights);
    setEditFile(null);
  };

  // Edit Campaign Save
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    setIsUpdating(true);

    try {
      const payload = new FormData();
      payload.append("id", editingCampaign.id);
      payload.append("title", editTitle);
      payload.append("highlights", editHighlights);
      if (editFile) {
        payload.append("videoFile", editFile);
      }

      const res = await fetch("/api/campaigns", {
        method: "PUT",
        body: payload,
      });

      if (res.ok) {
        setEditingCampaign(null);
        await fetchCampaigns();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update campaign.");
      }
    } catch (err) {
      console.error("Error editing campaign:", err);
      alert("Failed to submit edits. Please retry.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotional video campaign?")) return;

    try {
      const res = await fetch(`/api/campaigns?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchCampaigns();
      } else {
        alert("Failed to delete campaign.");
      }
    } catch (err) {
      console.error("Error deleting campaign:", err);
    }
  };

  // Interactions (Liking)
  const handleLike = async (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, likes: c.likes + 1 } : c))
    );

    try {
      await fetch("/api/campaigns/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: campaignId, action: "like" }),
      });
    } catch (err) {
      console.error("Failed to register like:", err);
    }
  };

  // Interactions (Viewing when playing)
  const handleView = async (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, views: c.views + 1 } : c))
    );

    try {
      await fetch("/api/campaigns/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: campaignId, action: "view" }),
      });
    } catch (err) {
      console.error("Failed to register view:", err);
    }
  };

  // Copying link
  const handleCopyLink = (campaign: Campaign) => {
    const shareText = `Check out this ShopEase campaign: "${campaign.title}" - ${campaign.highlights}`;
    navigator.clipboard.writeText(shareText);
    setCopiedId(campaign.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Direct Social Share Simulation
  const handleSocialShare = (platform: "whatsapp" | "facebook" | "twitter", campaign: Campaign) => {
    const text = encodeURIComponent(`ShopEase Campaign: *${campaign.title}*\n"${campaign.highlights}"\nWatch ad here:`);
    const currentUrl = encodeURIComponent(window.location.origin);
    
    let url = "";
    if (platform === "whatsapp") {
      url = `https://api.whatsapp.com/send?text=${text}%20${currentUrl}`;
    } else if (platform === "facebook") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${text}`;
    } else if (platform === "twitter") {
      url = `https://twitter.com/intent/tweet?text=${text}&url=${currentUrl}`;
    }
    
    window.open(url, "_blank");
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <section id="promotional-ads-section" className="py-12 bg-white border-t border-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Section Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            ShopEase Marketing Hub
          </div>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight sm:text-4xl">
            Post Promotional Video Ads
          </h2>
          <p className="text-sm text-stone-500 max-w-xl mx-auto">
            Design interactive video campaigns to showcase Zambian-sourced premium goods and live warehouse updates.
          </p>
          {isAdmin && (
            <span className="inline-block bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider mt-2 shadow-xs">
              👑 Administrative Mode Enabled
            </span>
          )}
        </div>

        {/* Layout split based on admin permissions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: Campaign Form Creator Card (Admins Only) */}
          {isAdmin ? (
            <div className="lg:col-span-5 bg-stone-50/70 p-6 rounded-3xl border border-stone-150/80 shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-stone-150 pb-3">
                <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
                  <Video className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                  Create Promo Ad Campaign
                </h3>
              </div>

              <form onSubmit={handlePublish} className="space-y-4">
                
                {/* Campaign Title Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-stone-600 uppercase tracking-wider">
                    Video Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. ShopEase Zambian Sourced"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs shadow-2xs font-semibold placeholder:text-stone-400 transition-all"
                  />
                </div>

                {/* Opening Highlights Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-stone-600 uppercase tracking-wider">
                    Opening Highlights *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={highlights}
                    onChange={(e) => setHighlights(e.target.value)}
                    placeholder="Write a catchy 1-2 sentence hook highlighting your products or depot operations..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs shadow-2xs font-semibold placeholder:text-stone-400 leading-relaxed resize-none transition-all"
                  />
                </div>

                {/* Media Source Tabs (local file / record) */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-extrabold text-stone-600 uppercase tracking-wider">
                    Campaign Video Media Source *
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-stone-200/50 p-1 rounded-xl border border-stone-150">
                    <button
                      type="button"
                      onClick={() => handleSourceTabChange("upload")}
                      className={`py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                        mediaSource === "upload"
                          ? "bg-white text-stone-900 shadow-xs"
                          : "text-stone-500 hover:text-stone-700"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Local Video File
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSourceTabChange("record")}
                      className={`py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                        mediaSource === "record"
                          ? "bg-white text-stone-900 shadow-xs"
                          : "text-stone-500 hover:text-stone-700"
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Record Live Video Ad
                    </button>
                  </div>
                </div>

                {/* UPLOAD FILE */}
                {mediaSource === "upload" && (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 relative min-h-48 ${
                      dragActive
                        ? "border-emerald-500 bg-emerald-50/20"
                        : "border-stone-200 hover:border-emerald-500 hover:bg-stone-50"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {uploadedFile ? (
                      <div className="space-y-2 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-stone-800 break-all px-4">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-red-600 font-extrabold uppercase tracking-wider mt-2 hover:text-red-800 pointer-events-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 pointer-events-none text-stone-400">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-500">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-700">
                            Drag & drop promotional video or <span className="text-emerald-700 font-extrabold underline">browse</span>
                          </p>
                          <p className="text-[9px] text-stone-400 mt-1 uppercase tracking-wider">
                            MP4, WebM up to 20MB Max
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* RECORD LIVE WEBCAM */}
                {mediaSource === "record" && (
                  <div className="space-y-3">
                    <div className="relative bg-black rounded-2xl overflow-hidden aspect-video border border-stone-200 flex items-center justify-center shadow-xs">
                      {cameraError ? (
                        <div className="p-5 text-center space-y-2">
                          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                          <p className="text-xs text-stone-300 font-medium leading-relaxed">
                            {cameraError}
                          </p>
                          <button
                            type="button; button"
                            onClick={startCamera}
                            className="px-3 py-1.5 bg-stone-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-stone-700 flex items-center gap-1.5 mx-auto cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Retry Camera
                          </button>
                        </div>
                      ) : (
                        <>
                          <video
                            ref={videoPreviewRef}
                            className="w-full h-full object-cover"
                            playsInline
                          />

                          {isRecording && (
                            <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1.5 tracking-widest uppercase animate-pulse shadow-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                              REC {formatTime(recordingSeconds)}
                            </div>
                          )}

                          {!isRecording && !recordedBlob && cameraStream && (
                            <div className="absolute top-3 right-3 bg-emerald-700/90 text-white text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase">
                              ● Live Feed Ready
                            </div>
                          )}

                          {recordedBlob && (
                            <div className="absolute bottom-3 left-3 bg-stone-900/90 text-white text-[9px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Clip Recorded Successfully
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {!cameraError && cameraStream && (
                      <div className="flex gap-2 justify-center">
                        {!isRecording && !recordedBlob ? (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow cursor-pointer transition-all"
                          >
                            <Camera className="w-4 h-4 animate-bounce" />
                            Record Video Clip
                          </button>
                        ) : isRecording ? (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="px-4 py-2 bg-stone-950 hover:bg-stone-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow cursor-pointer transition-all"
                          >
                            <StopCircle className="w-4 h-4 text-red-500" />
                            Stop Recording
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={startCamera}
                              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow cursor-pointer transition-all"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Record Again
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Status and Errors display inside creator panel */}
                <AnimatePresence>
                  {publishError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl flex items-start gap-2 text-xs font-semibold"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>{publishError}</div>
                    </motion.div>
                  )}

                  {publishSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl flex items-start gap-2 text-xs font-extrabold"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>Campaign ad video uploaded and published successfully.</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Publish Campaign Submit Button */}
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="w-full py-3 text-white text-xs font-black tracking-wider uppercase rounded-xl transition-all shadow-sm hover:brightness-105 hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: "#15803d" }}
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing Video Upload...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      Publish Video Ad
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-stone-400 font-medium">
                  * Uploaded media files are stored secure and locally in the Lusaka data server directory. No external URLs accepted.
                </p>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-4 bg-stone-50/70 p-6 rounded-3xl border border-stone-150/80 text-center space-y-4">
              <Sparkles className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-extrabold text-stone-800 uppercase tracking-wider">
                ShopEase Media Hub
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Tune in to view real-time live demonstrations, wholesale warehouse walks around Lusaka, and customer unboxings directly from our inventory depot.
              </p>
              <div className="border-t border-stone-150 pt-4 text-left">
                <span className="block text-[10px] font-extrabold text-stone-600 uppercase tracking-wider mb-2">How It Works:</span>
                <ul className="text-[10px] text-stone-500 space-y-2 list-disc list-inside">
                  <li>Watch active promotions in the marketplace.</li>
                  <li>Tap on the video to count views & help campaign trends.</li>
                  <li>Click <Heart className="w-3 h-3 inline text-red-500 fill-red-100" /> to like and support Zambian products.</li>
                  <li>Share directly with friends via fast WhatsApp shortcuts.</li>
                </ul>
              </div>
            </div>
          )}

          {/* COLUMN 2: Active Marketing Campaigns Grid */}
          <div className={`${isAdmin ? "lg:col-span-7" : "lg:col-span-8"} space-y-6`}>
            
            {/* Header section for campaign list */}
            <div className="flex items-center justify-between border-b border-stone-150 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-amber-100 text-amber-800 p-1.5 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                  Active Marketing Campaigns
                </h3>
              </div>
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider">
                {campaigns.length} Running
              </span>
            </div>

            {/* Campaign Cards list */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-stone-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-stone-300" />
                <p className="text-xs font-bold uppercase tracking-wider">Synchronizing Ad Network...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-stone-150 rounded-3xl p-6 text-stone-400 space-y-2">
                <Video className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-sm font-bold">No active promotional campaigns found.</p>
                <p className="text-xs max-w-sm mx-auto">Please check back later or use the administrator hub to publish campaigns.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaigns.map((camp) => (
                  <motion.div
                    key={camp.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-sm overflow-hidden flex flex-col group transition-all"
                  >
                    {/* HTML5 video wrapper aspect box */}
                    <div className="relative bg-stone-900 aspect-video overflow-hidden border-b border-stone-100">
                      <video
                        src={camp.videoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        onPlay={() => handleView(camp.id)}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Metadata body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-black text-stone-900 leading-tight group-hover:text-emerald-800 transition-colors">
                            {camp.title}
                          </h4>
                          {/* Admin management buttons */}
                          {isAdmin && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleStartEdit(camp)}
                                className="p-1 text-stone-500 hover:text-emerald-700 hover:bg-stone-50 rounded"
                                title="Edit Campaign"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCampaign(camp.id)}
                                className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete Campaign"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 leading-relaxed font-medium line-clamp-2">
                          {camp.highlights}
                        </p>
                      </div>

                      {/* Interactive metrics (Views, Likes) */}
                      <div className="border-t border-dashed border-stone-150 pt-3 flex items-center justify-between text-[11px] text-stone-500 font-bold uppercase tracking-wide">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-stone-400" />
                            Views: <span className="text-stone-800 font-extrabold">{camp.views || 0}</span>
                          </span>
                          <button
                            onClick={() => handleLike(camp.id)}
                            className="flex items-center gap-1 text-stone-500 hover:text-rose-600 transition-colors focus:outline-none"
                          >
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-50" />
                            Likes: <span className="text-stone-800 font-extrabold">{camp.likes || 0}</span>
                          </button>
                        </div>

                        {/* Share campaign controls */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Share:</span>
                          <button
                            onClick={() => handleCopyLink(camp)}
                            className="p-1 hover:bg-stone-100 rounded-md transition-all text-stone-500 hover:text-emerald-700 relative"
                            title="Copy Campaign Info"
                          >
                            {copiedId === camp.id ? (
                              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                Copied!
                              </span>
                            ) : null}
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSocialShare("whatsapp", camp)}
                            className="p-1 hover:bg-stone-100 rounded-md transition-all text-stone-500 hover:text-green-600"
                            title="Share to WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* EDIT MODAL FOR ADMINS */}
      <AnimatePresence>
        {editingCampaign && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 border border-stone-150 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-150 pb-3">
                <h3 className="text-base font-black text-stone-900">
                  Edit Marketing Campaign
                </h3>
                <button
                  onClick={() => setEditingCampaign(null)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-stone-600 uppercase tracking-wider">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-stone-600 uppercase tracking-wider">
                    Opening Highlights
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editHighlights}
                    onChange={(e) => setEditHighlights(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs font-semibold resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-stone-600 uppercase tracking-wider">
                    Change Campaign Video (Optional)
                  </label>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="px-3.5 py-3 rounded-xl border border-dashed border-stone-300 text-center cursor-pointer hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-stone-500" />
                    <span className="text-xs font-bold text-stone-700">
                      {editFile ? editFile.name : "Select new local video file"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCampaign(null)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-extrabold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                    style={{ backgroundColor: "#15803d" }}
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
