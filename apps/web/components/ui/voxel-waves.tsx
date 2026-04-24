'use client'

import React from 'react'

export function VoxelWaves() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#001969]">
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
          background: radial-gradient(closest-side, #AB83F3, transparent);
          animation: traverse-up-left 12s ease-in-out infinite alternate;
        }
        .circle-obj2 {
          background: radial-gradient(closest-side, #2EB8FF, transparent);
          animation: traverse-up-right 16s ease-in-out infinite alternate;
        }
        .circle-obj3 {
          background: radial-gradient(closest-side, #AB83F3, transparent);
          animation: traverse-down-right 14s ease-in-out infinite alternate;
        }
      `,
        }}
      />

      {/* Base elegant gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#001969] via-transparent to-[#001969]/80 z-10"></div>

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
      <div className="absolute inset-0 bg-[#001969]/10 backdrop-blur-[2px] z-20"></div>
    </div>
  )
}
