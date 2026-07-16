"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from "lucide-react";

// Helper to strictly extract YouTube ID
const getYouTubeId = (url) => {
    if (!url) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Detect iOS device (for muted autoplay)
const isIOS = () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Detect iPhone only (for hiding fullscreen - iPads support fullscreen)
const isIPhone = () => {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPod/.test(navigator.userAgent);
};

// Memoized Video Container to prevent re-renders of the iframe wrapper
const VideoContainer = memo(({ validId }) => {
    return (
        <div
            id={`medx-player-${validId}`}
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: "scale(1.01)", transformOrigin: "center center" }}
        />
    );
});

VideoContainer.displayName = "VideoContainer";

const CustomPlayer = ({ videoId, thumbnail, onEnded, onPlay, title, initialTime = 0, docId }) => {
    const validId = getYouTubeId(videoId);
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    const shouldPlayRef = useRef(false);
    const initialSeekDoneRef = useRef(false);

    // Store latest callbacks in refs to avoid stale closures and re-initialization
    const onEndedRef = useRef(onEnded);
    const onPlayRef = useRef(onPlay);
    const playFiredRef = useRef(false);
    useEffect(() => {
        onEndedRef.current = onEnded;
    }, [onEnded]);
    useEffect(() => {
        onPlayRef.current = onPlay;
    }, [onPlay]);

    const [status, setStatus] = useState("idle"); // idle, loading, playing, paused, ended
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(100);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isHovering, setIsHovering] = useState(false);
    const [showSplash, setShowSplash] = useState(false);
    const [isIOSDevice, setIsIOSDevice] = useState(false);
    const [isIPhoneDevice, setIsIPhoneDevice] = useState(false); // iPhone only (not iPad)
    const [showUnmutePrompt, setShowUnmutePrompt] = useState(false);
    const [showActionOverlay, setShowActionOverlay] = useState(false); // Temporary overlay during seek/resume on iOS

    const hideTimeoutRef = useRef(null);

    const handleMouseMove = () => {
        setIsHovering(true);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
            setIsHovering(false);
        }, 3000);
    };

    const handleMouseLeave = () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
            setIsHovering(false);
        }, 3000);
    };

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
        initialSeekDoneRef.current = false;
        playFiredRef.current = false;

        // If we have an initial time, we might want to start there
        // But we wait for player ready
    }, [videoId]);

    // Detect iOS on mount
    useEffect(() => {
        setIsIOSDevice(isIOS());
        setIsIPhoneDevice(isIPhone());
    }, []);



    const latestStateRef = useRef({ currentTime: 0, duration: 0, status: 'idle', title: null, videoId: null, docId: null });

    // Update refs whenever state changes
    useEffect(() => {
        latestStateRef.current = { currentTime, duration, status, title, videoId: validId, docId };
    }, [currentTime, duration, status, title, validId, docId]);

    // Save progress helper
    const saveProgress = () => {
        const { currentTime, duration, title, videoId, docId } = latestStateRef.current;

        if (!videoId) return;

        // Allow saving if we have a title (or fallback) and valid time
        const safeTitle = title || "Video Title Missing"; // distinct from old default
        const safeDocId = docId || videoId;

        if (duration > 0 && currentTime > 5 && currentTime < duration - 5) {
            try {
                localStorage.setItem('medx_last_active', JSON.stringify({
                    videoId,
                    docId: safeDocId,
                    title: safeTitle,
                    timestamp: currentTime,
                    duration,
                    lastUpdated: Date.now()
                }));
            } catch (e) {
                console.error("MedX: Error saving progress", e);
            }
        }
    };

    // Save on Pause
    useEffect(() => {
        if (status === 'paused') {
            saveProgress();
        }
    }, [status]);

    // Periodic Save & Unmount Save
    useEffect(() => {
        // Periodic save every 5 seconds
        const interval = setInterval(() => {
            if (latestStateRef.current.status === 'playing') {
                saveProgress();
            }
        }, 5000);

        // Save on unmount
        return () => {
            clearInterval(interval);
            saveProgress();
        };
    }, []);

    // 2. Initialize Player ONLY when user clicks Play
    useEffect(() => {
        if (validId && status !== "idle") {
            const iphoneDevice = isIPhone(); // Only iPhones need native fullscreen
            const initPlayer = () => {
                // Double check if the element exists in the DOM yet
                const elementId = `medx-player-${validId}`;
                const playerElement = document.getElementById(elementId);

                // With pre-load, element should be there, but we retry just in case
                if (!playerElement) {
                    setTimeout(initPlayer, 50);
                    return;
                }

                if (window.YT && window.YT.Player) {
                    requestAnimationFrame(() => {
                        // If player already exists, don't recreate
                        if (playerRef.current) return;
                        
                        playerRef.current = new window.YT.Player(elementId, {
                            videoId: validId,
                            playerVars: {
                                autoplay: 1, // Auto play since user already clicked!
                                mute: 0,
                                controls: 0,
                                disablekb: 1,
                                modestbranding: 1,
                                rel: 0,
                                showinfo: 0,
                                fs: 0,
                                iv_load_policy: 3,
                                cc_load_policy: 0,
                                enablejsapi: 1,
                                playsinline: iphoneDevice ? 0 : 1,
                                origin: typeof window !== 'undefined' ? window.location.origin : '',
                                start: initialTime > 0 ? Math.floor(initialTime) : undefined
                            },
                            events: {
                                onReady: (event) => {
                                    setDuration(event.target.getDuration());

                                    // Make sure we seek if start param failed or if we have specific logic
                                    if (initialTime > 0 && !initialSeekDoneRef.current) {
                                        event.target.seekTo(initialTime, true);
                                        initialSeekDoneRef.current = true;
                                        // Set initial progress immediately so UI reflects it
                                        setCurrentTime(initialTime);
                                        // duration might be 0 yet, handle safely
                                        const d = event.target.getDuration();
                                        if (d > 0) setProgress((initialTime / d) * 100);
                                    }

                                    // Ensure it plays
                                    event.target.playVideo();
                                },
                                onStateChange: (event) => {
                                    if (event.data === window.YT.PlayerState.PLAYING) {
                                        setStatus("playing");
                                        if (!playFiredRef.current) {
                                            playFiredRef.current = true;
                                            if (onPlayRef.current) onPlayRef.current();
                                        }
                                    }
                                    if (event.data === window.YT.PlayerState.PAUSED) setStatus("paused");
                                    if (event.data === window.YT.PlayerState.ENDED) {
                                        setStatus("ended");
                                        if (onEndedRef.current) onEndedRef.current();
                                    }
                                }
                            }
                        });
                    });
                } else {
                    setTimeout(initPlayer, 100);
                }
            };

            setTimeout(initPlayer, 0);
        }
    }, [validId, initialTime, status]);

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
        if (!isIPhoneDevice) setShowSplash(true); // Show splash to cover YouTube branding (skip on iPhone)
        setStatus("loading");
        shouldPlayRef.current = true;
        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
            playerRef.current.playVideo();
        }
    };

    // Hide splash screen unconditionally after 2 seconds
    useEffect(() => {
        let timer;
        if (showSplash) {
            timer = setTimeout(() => {
                setShowSplash(false);
            }, 2000);
        }
        if (status === "playing" && showSplash) {
            setShowSplash(false);
        }
        return () => clearTimeout(timer);
    }, [status, showSplash]);

    const togglePlay = () => {
        if (!playerRef.current) return;
        if (status === "playing") {
            playerRef.current.pauseVideo();
        } else {
            // Show temporary overlay when resuming to hide YouTube elements
            // iPhone gets 800ms, others get 1000ms
            setShowActionOverlay(true);
            setTimeout(() => setShowActionOverlay(false), isIPhoneDevice ? 800 : 1000);
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

        // Show temporary overlay during seek to hide YouTube elements
        // iPhone gets 800ms, others get 1000ms
        setShowActionOverlay(true);
        setTimeout(() => setShowActionOverlay(false), isIPhoneDevice ? 800 : 1000);

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

    const SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2];

    const cycleSpeed = () => {
        if (!playerRef.current) return;
        const currentIndex = SPEED_OPTIONS.indexOf(playbackSpeed);
        const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
        const nextSpeed = SPEED_OPTIONS[nextIndex];
        setPlaybackSpeed(nextSpeed);
        playerRef.current.setPlaybackRate(nextSpeed);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        // Only iPhones don't support fullscreen for iframes, iPads work fine
        if (isIPhoneDevice) return;

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
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleMouseMove}
        >
            {/* ===== SPLASH SCREEN - Covers YouTube branding during initial load ===== */}
            {showSplash && (
                <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-500">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <span className="text-primary text-sm font-medium tracking-wider">Loading Video...</span>
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary-soft border border-primary-soft">
                        <span className="text-[10px] font-bold text-primary tracking-wider">MEDX PLAYER</span>
                    </div>
                </div>
            )}

            {/* ===== YOUTUBE IFRAME CONTAINER ===== */}
            <div className="absolute inset-0 z-10 overflow-hidden">
                <VideoContainer validId={validId} />
            </div>

            {/* ===== INTERACTION SHIELD ===== */}
            {/* Blocks all mouse/touch events on YouTube iframe and hides branding */}
            {(status === "playing" || status === "paused") && (
                <div
                    className="absolute inset-0 z-30 touch-none cursor-pointer"
                    onClick={togglePlay}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                />
            )}

            {/* ===== iOS ACTION OVERLAY - shows during seek/resume to hide YouTube elements ===== */}
            {showActionOverlay && (
                <div className="absolute inset-0 z-40 bg-black flex items-center justify-center pointer-events-none transition-opacity duration-200">
                    <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary animate-ping" />
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
                        <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(219,31,255,0.35)]">
                            <div className="w-20 h-20 rounded-full grad-primary flex items-center justify-center">
                                <Play size={40} className="text-white fill-white ml-2" />
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <span className="text-white/90 font-medium tracking-widest text-sm uppercase">Play Video</span>
                        </div>
                    </div>

                    {/* Branding Tag */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur border border-white/10">
                        <span className="text-[10px] font-bold text-primary tracking-wider">MEDX PLAYER</span>
                    </div>
                </div>
            )}

            {/* ===== LOADING SPINNER ===== */}
            {status === "loading" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-none">
                    <Loader2 className="w-12 h-12 text-primary animate-spin drop-shadow-xl" />
                </div>
            )}

            {/* ===== CUSTOM CONTROLS ===== */}
            {(status === "playing" || status === "paused") && (
                <>
                    {/* Top Bar - compact on mobile */}
                    <div
                        className={`absolute inset-x-0 top-0 z-50 flex h-10 md:h-12 items-center px-3 md:px-6 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 transition-opacity duration-300 pointer-events-none ${isHovering || status === "paused" ? "opacity-100" : "opacity-0"}`}
                    >
                        <span className="text-xs md:text-sm font-semibold text-gray-900 truncate pr-4">{title}</span>
                        <div className="ml-auto flex items-center">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
                                MEDX
                            </span>
                        </div>
                    </div>

                    {/* Bottom Controls - compact on mobile */}
                    <div
                        className={`absolute inset-x-0 bottom-0 z-50 px-3 md:px-6 py-2 md:py-4 bg-white/95 backdrop-blur-md shadow-lg border-t border-gray-200 transition-opacity duration-300 ${isHovering || status === "paused" ? "opacity-100" : "opacity-0"}`}
                    >
                        {/* Progress Bar */}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress || 0}
                            onChange={handleSeek}
                            className="w-full h-1 md:h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2 md:mb-3
                                [&::-webkit-slider-thumb]:appearance-none 
                                [&::-webkit-slider-thumb]:w-3.5 
                                [&::-webkit-slider-thumb]:h-3.5 
                                [&::-webkit-slider-thumb]:bg-blue-600 
                                [&::-webkit-slider-thumb]:rounded-full 
                                [&::-webkit-slider-thumb]:shadow-md
                                hover:[&::-webkit-slider-thumb]:scale-110 
                                transition-all"
                            style={{
                                background: `linear-gradient(to right, #2563eb ${progress}%, #e5e7eb ${progress}%)`
                            }}
                        />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 md:gap-5">
                                {/* Play/Pause */}
                                <button onClick={togglePlay} className="text-gray-900 hover:text-blue-600 transition-colors drop-shadow-sm">
                                    {status === "playing" ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                                </button>

                                {/* Time */}
                                <span className="text-[10px] md:text-xs font-semibold font-mono text-gray-600">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2 md:gap-4">
                                {/* Volume - hidden on mobile to save space */}
                                <div className="hidden md:flex items-center gap-2 group/vol">
                                    <button onClick={toggleMute} className="text-gray-600 hover:text-gray-900 transition-colors">
                                        {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={volume}
                                        onChange={handleVolume}
                                        className="w-16 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer
                                            [&::-webkit-slider-thumb]:appearance-none 
                                            [&::-webkit-slider-thumb]:w-3 
                                            [&::-webkit-slider-thumb]:h-3 
                                            [&::-webkit-slider-thumb]:bg-gray-600 
                                            [&::-webkit-slider-thumb]:rounded-full"
                                        style={{
                                            background: `linear-gradient(to right, #4b5563 ${volume}%, #e5e7eb ${volume}%)`
                                        }}
                                    />
                                </div>

                                {/* Mute toggle on mobile only */}
                                <button onClick={toggleMute} className="md:hidden text-gray-600 hover:text-gray-900 transition-colors">
                                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>

                                {/* Playback Speed */}
                                <button
                                    onClick={cycleSpeed}
                                    className="text-gray-700 hover:text-blue-600 transition-colors text-[10px] md:text-xs font-mono font-bold min-w-[32px] md:min-w-[40px] text-center px-1 md:px-1.5 py-0.5 md:py-1 rounded-md border border-gray-200 hover:border-blue-200 bg-gray-50"
                                    title="Playback Speed"
                                >
                                    {playbackSpeed}x
                                </button>

                                {/* Fullscreen - hidden on iPhone only, iPads support it */}
                                {!isIPhoneDevice && (
                                    <button onClick={toggleFullscreen} className="text-gray-600 hover:text-gray-900 transition-colors">
                                        <Maximize size={16} className="md:w-[18px] md:h-[18px]" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default memo(CustomPlayer);
