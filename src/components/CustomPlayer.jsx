"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, VolumeOff } from "lucide-react";

// Helper to strictly extract YouTube ID
const getYouTubeId = (url) => {
    if (!url) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Detect iOS device
const isIOS = () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export default function CustomPlayer({ videoId, thumbnail, onEnded }) {
    const validId = getYouTubeId(videoId);
    const containerRef = useRef(null);
    const playerRef = useRef(null);

    const [status, setStatus] = useState("idle"); // idle, loading, playing, paused, ended
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(100);
    const [isHovering, setIsHovering] = useState(false);
    const [showSplash, setShowSplash] = useState(false);
    const [isIOSDevice, setIsIOSDevice] = useState(false);
    const [showUnmutePrompt, setShowUnmutePrompt] = useState(false);
    const [showActionOverlay, setShowActionOverlay] = useState(false); // Temporary overlay during seek/resume on iOS

    // 1. Load YouTube IFrame API
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }, []);

    // 1.5 Reset player when videoId changes
    useEffect(() => {
        // Destroy old player if exists
        if (playerRef.current && playerRef.current.destroy) {
            try {
                playerRef.current.destroy();
            } catch (e) { }
            playerRef.current = null;
        }
        // Reset all state
        setStatus("idle");
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
    }, [videoId]);

    // Detect iOS on mount
    useEffect(() => {
        setIsIOSDevice(isIOS());
    }, []);

    // 2. Initialize Player when user clicks play
    useEffect(() => {
        if (status === "loading" && validId) {
            const iosDevice = isIOS();
            const initPlayer = () => {
                if (window.YT && window.YT.Player) {
                    playerRef.current = new window.YT.Player(`medx-player-${validId}`, {
                        videoId: validId,
                        playerVars: {
                            autoplay: 1,
                            mute: iosDevice ? 1 : 0, // Muted autoplay required for iOS
                            controls: 0,
                            disablekb: 1,
                            modestbranding: 1,
                            rel: 0,
                            showinfo: 0,
                            fs: 0,
                            iv_load_policy: 3,
                            cc_load_policy: 0,
                            enablejsapi: 1,
                            playsinline: 1,
                            origin: typeof window !== 'undefined' ? window.location.origin : '',
                        },
                        events: {
                            onReady: (event) => {
                                setDuration(event.target.getDuration());
                                event.target.playVideo();
                                setStatus("playing");
                                // On iOS, video starts muted - show unmute prompt
                                if (iosDevice) {
                                    setIsMuted(true);
                                    setShowUnmutePrompt(true);
                                }
                            },
                            onStateChange: (event) => {
                                if (event.data === window.YT.PlayerState.PLAYING) setStatus("playing");
                                if (event.data === window.YT.PlayerState.PAUSED) setStatus("paused");
                                if (event.data === window.YT.PlayerState.ENDED) {
                                    setStatus("ended");
                                    if (onEnded) onEnded();
                                }
                            }
                        }
                    });
                } else {
                    // API not ready yet, wait and retry
                    setTimeout(initPlayer, 100);
                }
            };
            initPlayer();
        }
    }, [status, validId]);

    // 3. Progress Loop
    useEffect(() => {
        let interval;
        if (status === "playing" && playerRef.current && playerRef.current.getCurrentTime) {
            interval = setInterval(() => {
                const curr = playerRef.current.getCurrentTime();
                const dur = playerRef.current.getDuration();
                setCurrentTime(curr);
                setDuration(dur);
                setProgress((curr / dur) * 100);
            }, 500);
        }
        return () => clearInterval(interval);
    }, [status]);

    // Format time helper
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
        return `${mins}:${secs}`;
    };

    // Handlers
    const handleStartPlay = () => {
        setShowSplash(true); // Show splash to cover YouTube branding
        setStatus("loading");
    };

    // Hide splash screen after video is playing for a bit
    useEffect(() => {
        let timer;
        if (status === "playing" && showSplash) {
            timer = setTimeout(() => {
                setShowSplash(false);
            }, 4000); // Hide after 4 seconds of playback
        }
        return () => clearTimeout(timer);
    }, [status, showSplash]);

    const togglePlay = () => {
        if (!playerRef.current) return;
        if (status === "playing") {
            playerRef.current.pauseVideo();
        } else {
            // On iOS, show temporary overlay when resuming to hide YouTube elements
            if (isIOSDevice) {
                setShowActionOverlay(true);
                setTimeout(() => setShowActionOverlay(false), 800);
            }
            playerRef.current.playVideo();
        }
    };

    const toggleMute = () => {
        if (!playerRef.current) return;
        if (isMuted) {
            playerRef.current.unMute();
            setIsMuted(false);
        } else {
            playerRef.current.mute();
            setIsMuted(true);
        }
    };

    const handleSeek = (e) => {
        if (!playerRef.current) return;
        // On iOS, show temporary overlay during seek to hide YouTube elements
        if (isIOSDevice) {
            setShowActionOverlay(true);
            setTimeout(() => setShowActionOverlay(false), 800);
        }
        const seekTo = (e.target.value / 100) * duration;
        playerRef.current.seekTo(seekTo, true);
        setProgress(e.target.value);
    };

    const handleVolume = (e) => {
        if (!playerRef.current) return;
        const vol = parseInt(e.target.value);
        setVolume(vol);
        playerRef.current.setVolume(vol);
        if (vol === 0) {
            setIsMuted(true);
        } else {
            setIsMuted(false);
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        // iOS doesn't support fullscreen for iframes, button is hidden in UI
        if (isIOSDevice) return;

        // Check if already in fullscreen
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        } else {
            // Request fullscreen with webkit fallback
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            } else if (containerRef.current.webkitRequestFullscreen) {
                containerRef.current.webkitRequestFullscreen();
            }
        }
    };

    const poster = thumbnail || (validId ? `https://img.youtube.com/vi/${validId}/maxresdefault.jpg` : null);

    if (!validId) {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center text-red-500 font-mono text-sm border border-white/10 rounded-2xl">
                <span>Invalid Video ID</span>
                <span className="text-xs text-gray-600 mt-2">{videoId}</span>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="group relative w-full h-full bg-black overflow-hidden rounded-2xl shadow-2xl border border-white/10 select-none"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* ===== SPLASH SCREEN - Covers YouTube branding during initial load ===== */}
            {showSplash && (
                <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-500">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                    <span className="text-cyan-400 text-sm font-medium tracking-wider">Loading Video...</span>
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30">
                        <span className="text-[10px] font-bold text-cyan-400 tracking-wider">MEDX PLAYER</span>
                    </div>
                </div>
            )}

            {/* ===== YOUTUBE IFRAME CONTAINER ===== */}
            {status !== "idle" && (
                <div className="absolute inset-0 z-10 overflow-hidden">
                    {/* Scale up iframe slightly to crop out bottom YouTube branding */}
                    <div
                        id={`medx-player-${validId}`}
                        className="absolute top-0 left-0 w-full h-full"
                        style={{
                            transform: 'scale(1.01)',
                            transformOrigin: 'center center',
                        }}
                    />
                </div>
            )}

            {/* ===== INTERACTION SHIELD ===== */}
            {/* Blocks all mouse/touch events on YouTube iframe and hides branding */}
            {status !== "idle" && (
                <div
                    className="absolute inset-0 z-30 cursor-pointer touch-none"
                    onClick={togglePlay}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    {/* Gradient overlays - fade with controls */}
                    <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black via-black/40 to-transparent pointer-events-none transition-opacity duration-300 ${isHovering || status === "paused" ? "opacity-100" : "opacity-0"}`} />
                    <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none transition-opacity duration-300 ${isHovering || status === "paused" ? "opacity-100" : "opacity-0"}`} />
                </div>
            )}

            {/* ===== iOS ACTION OVERLAY - shows during seek/resume to hide YouTube elements ===== */}
            {showActionOverlay && (
                <div className="absolute inset-0 z-40 bg-black/90 flex items-center justify-center pointer-events-none transition-opacity duration-200">
                    <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-cyan-400/40 animate-ping" />
                    </div>
                </div>
            )}

            {/* ===== INITIAL OVERLAY (Before Play) ===== */}
            {status === "idle" && (
                <div
                    onClick={handleStartPlay}
                    className="absolute inset-0 z-50 cursor-pointer flex items-center justify-center bg-black"
                >
                    {poster && (
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                            style={{ backgroundImage: `url(${poster})` }}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                    {/* Big Play Button */}
                    <div className="relative z-50 group-hover:scale-110 transition-transform duration-300">
                        <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.3)]">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                                <Play size={40} className="text-white fill-white ml-2" />
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <span className="text-white/90 font-medium tracking-widest text-sm uppercase">Play Video</span>
                        </div>
                    </div>

                    {/* Branding Tag */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur border border-white/10">
                        <span className="text-[10px] font-bold text-cyan-400 tracking-wider">MEDX PLAYER</span>
                    </div>
                </div>
            )}

            {/* ===== LOADING SPINNER ===== */}
            {status === "loading" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                </div>
            )}

            {/* ===== iOS UNMUTE PROMPT ===== */}
            {showUnmutePrompt && (status === "playing" || status === "paused") && (
                <div
                    className="absolute top-4 right-4 z-50 animate-pulse"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (playerRef.current) {
                            playerRef.current.unMute();
                            setIsMuted(false);
                            setShowUnmutePrompt(false);
                        }
                    }}
                >
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-lg">
                        <VolumeOff size={18} className="text-white" />
                        <span className="text-white text-sm font-medium">Tap to Unmute</span>
                    </div>
                </div>
            )}

            {/* ===== CUSTOM CONTROLS ===== */}
            {(status === "playing" || status === "paused") && (
                <div
                    className={`absolute inset-x-0 bottom-0 z-50 p-4 transition-opacity duration-300 ${isHovering || status === "paused" ? "opacity-100" : "opacity-0"}`}
                >
                    {/* Progress Bar */}
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress || 0}
                        onChange={handleSeek}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer mb-3
                            [&::-webkit-slider-thumb]:appearance-none 
                            [&::-webkit-slider-thumb]:w-3 
                            [&::-webkit-slider-thumb]:h-3 
                            [&::-webkit-slider-thumb]:bg-cyan-400 
                            [&::-webkit-slider-thumb]:rounded-full 
                            [&::-webkit-slider-thumb]:shadow-lg
                            hover:[&::-webkit-slider-thumb]:scale-125 
                            transition-all"
                        style={{
                            background: `linear-gradient(to right, #22d3ee ${progress}%, rgba(255,255,255,0.2) ${progress}%)`
                        }}
                    />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Play/Pause */}
                            <button onClick={togglePlay} className="text-white hover:text-cyan-400 transition-colors">
                                {status === "playing" ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                            </button>



                            {/* Time */}
                            <span className="text-xs font-mono text-gray-400">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        {/* Branding + Controls */}
                        <div className="flex items-center gap-3">
                            {/* Volume Slider */}
                            <div className="flex items-center gap-2 group/vol">
                                <button onClick={toggleMute} className="text-gray-300 hover:text-white transition-colors">
                                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={handleVolume}
                                    className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer
                                        [&::-webkit-slider-thumb]:appearance-none 
                                        [&::-webkit-slider-thumb]:w-2 
                                        [&::-webkit-slider-thumb]:h-2 
                                        [&::-webkit-slider-thumb]:bg-white 
                                        [&::-webkit-slider-thumb]:rounded-full"
                                />
                            </div>

                            {/* Fullscreen - hidden on iOS since not supported */}
                            {!isIOSDevice && (
                                <button onClick={toggleFullscreen} className="text-gray-300 hover:text-white transition-colors">
                                    <Maximize size={18} />
                                </button>
                            )}

                            {/* Branding */}
                            <div className="px-2 py-0.5 rounded border border-cyan-400/30 bg-cyan-400/10 text-[10px] text-cyan-400 uppercase font-bold tracking-widest ml-2">
                                MedX
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
