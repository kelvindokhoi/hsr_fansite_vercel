import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import '../css/MusicSettings.css';

const musicTracks = [
    {
        id: 1,
        title: 'Ripples of Past Reverie',
        path: '/audio/1764867051_Ripples of Past Reverie (English Ver.)_I7MNqnkTRKc_default.wav'
    },
    {
        id: 2,
        title: 'Where Roses Bloom',
        path: '/audio/1764866863_Where Roses Bloom (Voice Memo Clip)_3Z-x3ajjuXM_default.wav'
    },
    {
        id: 3,
        title: 'Kaze ni Naru',
        path: '/audio/1764867545_kaze ni naru (Instrumental)_cJRMyk44qsA_default.wav'
    },
    {
        id: 4,
        title: 'No Music',
        path: null
    }
];

const MusicSettings = () => {
    const { playTrack, volume, setVolume, isMuted, toggleMute } = useAudio();
    const [isOpen, setIsOpen] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(musicTracks[0]);

    useEffect(() => {
        // Initialize audio when component mounts
        const initAudio = () => {
            if (currentTrack) {
                if (currentTrack.path) {
                    // Force the audio to play when user interacts with the page
                    const playPromise = playTrack(currentTrack.path);

                    // Handle autoplay restrictions
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.log('Playback prevented:', error);
                            // Show a play button or handle the error as needed
                        });
                    }
                } else {
                    // No Music selected
                    playTrack(null);
                }
            }
        };

        // Try to play immediately
        initAudio();

        // Set up a one-time user interaction listener to handle autoplay restrictions
        const handleFirstInteraction = () => {
            initAudio();
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };

        // Add event listeners for user interaction
        document.addEventListener('click', handleFirstInteraction, { once: true });
        document.addEventListener('keydown', handleFirstInteraction, { once: true });
        document.addEventListener('touchstart', handleFirstInteraction, { once: true });

        return () => {
            // Cleanup event listeners
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, [currentTrack, playTrack]);

    const handleTrackSelect = (track) => {
        setCurrentTrack(track);
    };

    return (
        <div className="music-settings-container">
            {isOpen && (
                <div className="music-panel">
                    <div className="panel-header">
                        <span className="panel-title">Ambience</span>
                    </div>

                    <div className="track-list">
                        {musicTracks.map(track => (
                            <button
                                key={track.id}
                                onClick={() => handleTrackSelect(track)}
                                className={`track-item ${currentTrack?.id === track.id ? 'active' : ''}`}
                            >
                                {currentTrack?.id === track.id && (
                                    <span className="playing-icon"></span>
                                )}
                                {track.title}
                            </button>
                        ))}
                    </div>

                    <div className="volume-control">
                        <button
                            onClick={toggleMute}
                            className="mute-btn"
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted || volume === 0 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                                    <line x1="23" y1="9" x2="17" y2="15"></line>
                                    <line x1="17" y1="9" x2="23" y2="15"></line>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                </svg>
                            )}
                        </button>

                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="volume-slider"
                        />
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`music-toggle-btn ${isOpen ? 'active' : ''}`}
                title={isOpen ? "Close Music Settings" : "Open Music Settings"}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                )}
            </button>
        </div>
    );
};

export default MusicSettings;
