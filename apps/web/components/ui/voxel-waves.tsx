'use client'

import React from 'react'

interface VoxelWavesProps {
  bgColor?: string
  orbColor?: string
  className?: string
}

export function VoxelWaves({ 
  bgColor = "#001969", 
  orbColor = "#AB83F3",
  className 
}: VoxelWavesProps) {
  // Simple check to see if it's an oklch string or hex/css color
  const finalBgColor = bgColor.includes('oklch') ? 'black' : bgColor
  const finalOrbColor = orbColor.includes('oklch') ? '#AB83F3' : orbColor

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`} style={{ backgroundColor: finalBgColor }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes traverse-up-left {
          100% { transform: translateY(-20vw) translateX(-30vw) rotate(180deg); }
        }
        @keyframes traverse-up-right {
          100% { transform: translateY(-30vw) translateX(30vw) rotate(1turn); }
        }
        @keyframes traverse-down-right {
          100% { transform: translateY(20vw) translateX(30vw) rotate(1turn); }
        }
        
        .circle-obj {
          background: radial-gradient(closest-side, ${finalOrbColor}, transparent);
          animation: traverse-up-left 12s ease-in-out infinite alternate;
        }
        .circle-obj2 {
          background: radial-gradient(closest-side, ${finalOrbColor}, transparent);
          opacity: 0.6;
          animation: traverse-up-right 16s ease-in-out infinite alternate;
        }
        .circle-obj3 {
          background: radial-gradient(closest-side, ${finalOrbColor}, transparent);
          animation: traverse-down-right 14s ease-in-out infinite alternate;
        }
      `,
        }}
      />

      {/* Base elegant gradient overlay */}
      <div 
        className="absolute inset-0 z-10" 
        style={{ background: `linear-gradient(to bottom right, ${finalBgColor}, transparent, ${finalBgColor}cc)` }}
      />

      {/* Animated Traverse Orbs */}
      <div className="absolute inset-0 opacity-80 mix-blend-screen z-0">
        <div className="absolute left-[10%] top-[10%] overflow-visible">
          <div className="circle-obj absolute h-[70vw] w-[50vw] rounded-[40rem]"></div>
        </div>
        <div className="absolute left-[50%] top-[30%] overflow-visible">
          <div className="circle-obj2 absolute h-[50vw] w-[50vw] rounded-[40rem]"></div>
        </div>
        <div className="absolute left-[20%] top-[40%] overflow-visible">
          <div className="circle-obj3 absolute h-[60vw] w-[60vw] rounded-[40rem]"></div>
        </div>
      </div>

      {/* Top Glassmorphism Overlay to smooth everything out */}
      <div className="absolute inset-0 backdrop-blur-[2px] z-20" style={{ backgroundColor: `${finalBgColor}1a` }} />
    </div>
  )
}
