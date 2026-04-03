import React from 'react';

const TopBar = React.memo(function TopBar() {
  return (
    <div className="top-bar">
      {/* LED — Figma node 134:135
           Container (32×32, overflow:clip) → Dot (#ffbdec, 12×12 at 9.6/9.6)
             → Glow overlay (centred, animated breathing halo + inner highlight) */}
      <div className="led-container">
        <div className="led-dot">
          <div className="led-glow" />
        </div>
      </div>
      <div className="divider-wrap">
        <div className="divider" />
      </div>
      <span className="brand-text">//R</span>
    </div>
  );
});

export default TopBar;
