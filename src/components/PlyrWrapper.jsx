"use client";

import React, { useRef, useEffect } from "react";
import "plyr/dist/plyr.css"; // Import Core Plyr CSS

export default function PlyrWrapper({ source, options, onEnd }) {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        // Dynamically import Plyr to ensure it runs ONLY on client
        // This prevents "document is not defined" SSR errors
        import("plyr").then((PlyrModule) => {
            const Plyr = PlyrModule.default || PlyrModule;

            if (videoRef.current) {
                // Initialize Plyr on the video element
                const player = new Plyr(videoRef.current, options);
                playerRef.current = player;

                // Set source
                if (source) {
                    player.source = source;
                }

                // Handle Events
                player.on("ended", () => {
                    if (onEnd) onEnd();
                });
            }
        });

        // Cleanup
        return () => {
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }
        };
    }, []); // Run once on mount

    // Update source if it changes
    useEffect(() => {
        if (playerRef.current && source) {
            playerRef.current.source = source;
        }
    }, [source]);

    return (
        <div className="medx-plyr-container w-full h-full relative overflow-hidden rounded-2xl group">
            {/* THE STEALTH CSS */}
            <style jsx global>{`
                /* 1. Zoom the video to push YouTube logos off-screen */
                .medx-plyr-container .plyr__video-embed iframe {
                    transform: scale(1.6) !important;
                    pointer-events: none; /* Block right-click / hover on YouTube UI */
                }
                
                /* 2. Compensate helper */
                .medx-plyr-container .plyr__video-wrapper {
                    height: 100%;
                    overflow: hidden;
                    background: black;
                }

                /* 3. Ensure controls sit ABOVE the zoomed video */
                .medx-plyr-container .plyr__controls {
                    z-index: 50 !important;
                    background: linear-gradient(to top, rgba(0,0,0,0.9), transparent) !important;
                    padding-bottom: 20px;
                }

                /* 4. Hide generic overlays */
                .plyr__poster { 
                    background-size: cover !important;
                    z-index: 10;
                }
            `}</style>

            <div className="w-full h-full">
                <video
                    ref={videoRef}
                    className="plyr-react plyr"
                    playsInline
                    controls
                    crossOrigin="true"
                />
            </div>

            {/* Interaction Shield (Click to Toggle) to fix the pointer-events:none issue */}
            {/* Since mouse events are blocked on iframe, Plyr needs this to register 'click to play' */}
            <div
                className="absolute inset-0 z-0 cursor-pointer"
                onClick={() => playerRef.current?.togglePlay()}
            />
        </div>
    );
}
