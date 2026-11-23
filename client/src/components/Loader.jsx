import React from 'react';

export default function Loader({ fullScreen = false }) {
  return (
    <div className={`srt-loader ${fullScreen ? 'fullscreen' : ''}`} role="status" aria-label="Loading SR Tours">
      <div className="srt-loader-ring">
        <img src="/images/logo.jpeg" alt="SR Tours and Travels" />
      </div>
    </div>
  );
}
