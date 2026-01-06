import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5); // Default volume 50%
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(new Audio());
    const fadeIntervalRef = useRef(null);

    useEffect(() => {
        // Initialize audio settings
        audioRef.current.loop = true;
        audioRef.current.volume = isMuted ? 0 : volume;
    }, []);

    useEffect(() => {
        // Update volume when state changes
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const playTrack = (url) => {
        if (currentTrack === url && isPlaying) return; // Already playing this track

        // Clear any existing fade interval
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
        }

        const fadeOutDuration = 1000; // 1 second fade out
        const fadeInDuration = 1000; // 1 second fade in
        const steps = 20;
        const stepTime = fadeOutDuration / steps;

        // If something is playing, fade it out first
        if (isPlaying && audioRef.current.src) {
            let currentVol = audioRef.current.volume;
            const volStep = currentVol / steps;

            fadeIntervalRef.current = setInterval(() => {
                if (audioRef.current.volume > volStep) {
                    audioRef.current.volume -= volStep;
                } else {
                    // Fade out complete
                    clearInterval(fadeIntervalRef.current);
                    audioRef.current.pause();
                    audioRef.current.volume = 0;

                    if (url) {
                        startNewTrack(url, fadeInDuration);
                    } else {
                        // Stop playback completely
                        setIsPlaying(false);
                        setCurrentTrack(null);
                        audioRef.current.src = "";
                    }
                }
            }, stepTime);
        } else {
            // Nothing playing
            if (url) {
                startNewTrack(url, fadeInDuration);
            } else {
                // Ensure state is stopped
                setIsPlaying(false);
                setCurrentTrack(null);
            }
        }
    };

    const startNewTrack = (url, duration) => {
        audioRef.current.src = url;
        audioRef.current.load();

        const targetVolume = isMuted ? 0 : volume;
        audioRef.current.volume = 0; // Start at 0 for fade in

        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                setIsPlaying(true);
                setCurrentTrack(url);

                // Fade in
                const steps = 20;
                const stepTime = duration / steps;
                const volStep = targetVolume / steps;

                if (targetVolume > 0) {
                    fadeIntervalRef.current = setInterval(() => {
                        if (audioRef.current.volume < targetVolume - volStep) {
                            audioRef.current.volume += volStep;
                        } else {
                            audioRef.current.volume = targetVolume;
                            clearInterval(fadeIntervalRef.current);
                        }
                    }, stepTime);
                } else {
                    audioRef.current.volume = 0;
                }

            }).catch(error => {
                console.error("Audio playback failed:", error);
                setIsPlaying(false);
            });
        }
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    const updateVolume = (newVolume) => {
        setVolume(newVolume);
        if (isMuted && newVolume > 0) {
            setIsMuted(false);
        }
    };

    return (
        <AudioContext.Provider value={{
            currentTrack,
            isPlaying,
            volume,
            isMuted,
            playTrack,
            toggleMute,
            setVolume: updateVolume
        }}>
            {children}
        </AudioContext.Provider>
    );
};
