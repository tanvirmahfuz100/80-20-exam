import React from 'react';

export const StudyDesk = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="120" width="140" height="8" rx="4" className="fill-white/10" />
    <rect x="50" y="60" width="100" height="60" rx="4" className="fill-primary/10 stroke-primary/20" strokeWidth="1.5" />
    <rect x="55" y="65" width="90" height="6" rx="2" className="fill-primary/20" />
    <rect x="55" y="75" width="70" height="4" rx="2" className="fill-white/10" />
    <rect x="55" y="83" width="80" height="4" rx="2" className="fill-white/10" />
    <rect x="55" y="91" width="60" height="4" rx="2" className="fill-white/10" />
    <rect x="55" y="99" width="75" height="4" rx="2" className="fill-white/10" />
    <rect x="100" y="110" width="45" height="10" rx="2" className="fill-reward/20" />
    <circle cx="155" cy="80" r="3" className="fill-reward" />
    <line x1="155" y1="83" x2="155" y2="100" className="stroke-reward/40" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="155" cy="105" r="2" className="fill-reward/60" />
  </svg>
);

export const Trophy = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M70 140h60l-10 30H80l-10-30z" className="fill-reward/15 stroke-reward/40" strokeWidth="2" />
    <path d="M100 140v-20" className="stroke-reward/40" strokeWidth="2" strokeLinecap="round" />
    <path d="M65 50c0-10 15-15 35-15s35 5 35 15" className="stroke-white/20" strokeWidth="2" fill="none" />
    <ellipse cx="100" cy="110" rx="40" ry="30" className="fill-primary/10 stroke-primary/30" strokeWidth="2" />
    <path d="M100 90c-8 0-15 3-15 12 0 10 15 18 15 18s15-8 15-18c0-9-7-12-15-12z" className="fill-reward/30 stroke-reward/60" strokeWidth="1.5" />
    <path d="M65 50v15c0 15 10 28 35 28" className="stroke-white/15" strokeWidth="1.5" fill="none" />
    <path d="M135 50v15c0 15-10 28-35 28" className="stroke-white/15" strokeWidth="1.5" fill="none" />
    <line x1="65" y1="50" x2="135" y2="50" className="stroke-white/10" strokeWidth="1.5" />
  </svg>
);

export const BrainIcon = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M100 40c-20 0-35 12-35 28 0 6 2 12 6 17-7 4-11 11-11 19 0 8 4 15 10 19-3 5-5 10-5 16 0 16 15 28 35 28s35-12 35-28c0-6-2-11-5-16 6-4 10-11 10-19 0-8-4-15-11-19 4-5 6-11 6-17 0-16-15-28-35-28z" className="fill-primary/8 stroke-primary/25" strokeWidth="2" />
    <path d="M80 80c0 0 8-6 20-6s20 6 20 6" className="stroke-primary/40" strokeWidth="2" strokeLinecap="round" fill="none" />
    <circle cx="85" cy="95" r="3" className="fill-primary/30" />
    <circle cx="115" cy="95" r="3" className="fill-primary/30" />
    <path d="M90 105c0 0 4 4 10 4s10-4 10-4" className="stroke-primary/40" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M95 75h10" className="stroke-primary/30" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M50 90c-10 5-15 13-15 22 0 14 12 25 28 25" className="stroke-accent/20" strokeWidth="2" fill="none" />
    <path d="M150 90c10 5 15 13 15 22 0 14-12 25-28 25" className="stroke-accent/20" strokeWidth="2" fill="none" />
  </svg>
);

export const Rocket = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M100 25c0 0-25 35-25 60 0 25 25 50 25 50s25-25 25-50c0-25-25-60-25-60z" className="fill-primary/15 stroke-primary/30" strokeWidth="2" />
    <path d="M90 75c0 0 3-5 10-5s10 5 10 5" className="stroke-primary/50" strokeWidth="2" strokeLinecap="round" fill="none" />
    <circle cx="100" cy="95" r="10" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />
    <circle cx="100" cy="95" r="4" className="fill-primary/50" />
    <path d="M85 115l-15 25" className="stroke-reward/30" strokeWidth="2" strokeLinecap="round" />
    <path d="M115 115l15 25" className="stroke-reward/30" strokeWidth="2" strokeLinecap="round" />
    <path d="M95 118l-10 22" className="stroke-reward/20" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M105 118l10 22" className="stroke-reward/20" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="70" cy="60" r="3" className="fill-accent/40" />
    <circle cx="135" cy="45" r="2" className="fill-accent/40" />
    <circle cx="140" cy="70" r="2.5" className="fill-accent/30" />
    <circle cx="55" cy="80" r="2" className="fill-accent/20" />
  </svg>
);

export const Books = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="55" y="50" width="30" height="100" rx="4" className="fill-primary/15 stroke-primary/30" strokeWidth="2" />
    <rect x="85" y="40" width="30" height="110" rx="4" className="fill-accent/15 stroke-accent/30" strokeWidth="2" />
    <rect x="115" y="60" width="30" height="90" rx="4" className="fill-reward/15 stroke-reward/30" strokeWidth="2" />
    <line x1="60" y1="70" x2="80" y2="70" className="stroke-primary/30" strokeWidth="1.5" />
    <line x1="60" y1="80" x2="75" y2="80" className="stroke-primary/20" strokeWidth="1.5" />
    <line x1="90" y1="65" x2="110" y2="65" className="stroke-accent/30" strokeWidth="1.5" />
    <line x1="90" y1="75" x2="105" y2="75" className="stroke-accent/20" strokeWidth="1.5" />
    <line x1="120" y1="80" x2="140" y2="80" className="stroke-reward/30" strokeWidth="1.5" />
    <line x1="120" y1="90" x2="135" y2="90" className="stroke-reward/20" strokeWidth="1.5" />
  </svg>
);

export const Target = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="60" className="stroke-primary/20" strokeWidth="2" fill="none" />
    <circle cx="100" cy="100" r="45" className="stroke-primary/15" strokeWidth="2" fill="none" />
    <circle cx="100" cy="100" r="30" className="stroke-primary/25" strokeWidth="2" fill="none" />
    <circle cx="100" cy="100" r="15" className="fill-primary/20 stroke-primary/40" strokeWidth="2" />
    <circle cx="100" cy="100" r="5" className="fill-primary" />
    <line x1="100" y1="35" x2="100" y2="50" className="stroke-white/20" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="100" y1="150" x2="100" y2="165" className="stroke-white/20" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="35" y1="100" x2="50" y2="100" className="stroke-white/20" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="150" y1="100" x2="165" y2="100" className="stroke-white/20" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M155 55l-20 20" className="stroke-primary/30" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ChartUp = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="140" width="140" height="8" rx="4" className="fill-white/10" />
    <rect x="50" y="120" width="12" height="20" rx="3" className="fill-primary/30" />
    <rect x="70" y="90" width="12" height="50" rx="3" className="fill-accent/30" />
    <rect x="90" y="70" width="12" height="70" rx="3" className="fill-primary/20" />
    <rect x="110" y="95" width="12" height="45" rx="3" className="fill-reward/25" />
    <rect x="130" y="50" width="12" height="90" rx="3" className="fill-emerald-500/30" />
    <path d="M56 120l26-30 20 10 20-40 24 20" className="stroke-primary/60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="56" cy="120" r="3" className="fill-primary" />
    <circle cx="82" cy="90" r="3" className="fill-primary" />
    <circle cx="102" cy="100" r="3" className="fill-primary" />
    <circle cx="122" cy="60" r="3" className="fill-primary" />
    <circle cx="146" cy="80" r="3" className="fill-primary" />
  </svg>
);

export const EmptyState = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="85" r="35" className="stroke-white/10" strokeWidth="2" fill="none" strokeDasharray="4 4" />
    <path d="M100 65v40M80 85h40" className="stroke-white/10" strokeWidth="2" strokeLinecap="round" />
    <path d="M60 130l-15 25" className="stroke-white/5" strokeWidth="2" strokeLinecap="round" />
    <path d="M140 130l15 25" className="stroke-white/5" strokeWidth="2" strokeLinecap="round" />
    <path d="M50 160h100" className="stroke-white/5" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CheckList = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="30" width="120" height="140" rx="8" className="fill-white/5 stroke-white/10" strokeWidth="2" />
    <rect x="48" y="38" width="104" height="12" rx="3" className="fill-primary/15" />
    <circle cx="62" cy="44" r="3" className="fill-primary/50" />
    <line x1="72" y1="50" x2="140" y2="50" className="stroke-white/5" strokeWidth="1" />
    <line x1="55" y1="68" x2="100" y2="68" className="stroke-white/10" strokeWidth="1.5" />
    <line x1="55" y1="80" x2="120" y2="80" className="stroke-white/10" strokeWidth="1.5" />
    <line x1="55" y1="92" x2="90" y2="92" className="stroke-white/10" strokeWidth="1.5" />
    <line x1="55" y1="110" x2="105" y2="110" className="stroke-white/10" strokeWidth="1.5" />
    <line x1="55" y1="122" x2="95" y2="122" className="stroke-white/10" strokeWidth="1.5" />
    <line x1="55" y1="134" x2="110" y2="134" className="stroke-white/10" strokeWidth="1.5" />
    <rect x="55" y="148" width="24" height="8" rx="2" className="fill-primary/20" />
    <rect x="85" y="148" width="24" height="8" rx="2" className="fill-primary/20" />
    <path d="M56 74l6 6 12-12" className="stroke-accent/60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const Graduation = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M100 50L30 85l70 35 70-35-70-35z" className="fill-primary/15 stroke-primary/30" strokeWidth="2" />
    <path d="M30 85v30l70 30 70-30V85" className="stroke-primary/20" strokeWidth="2" fill="none" />
    <path d="M55 78l45-20 45 20" className="stroke-accent/30" strokeWidth="1.5" fill="none" />
    <line x1="100" y1="85" x2="100" y2="130" className="stroke-white/10" strokeWidth="1.5" />
    <rect x="85" y="140" width="30" height="15" rx="3" className="fill-reward/20 stroke-reward/30" strokeWidth="1.5" />
  </svg>
);
