import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* ===================================================
   * SHAFAR — Global Styles v2.0
   * Mobile-first, premium dark design
   * =================================================== */

  /* Reset moderno */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 14px;
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";

    @media (min-width: 480px) { font-size: 15px; }
    @media (min-width: 768px) { font-size: 16px; }
  }

  body {
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.55;
    background-color: #0D0D0D;
    color: #D2D2D2;
    min-height: 100vh;
    min-height: 100dvh;
    overflow-x: hidden;
    max-width: 100vw;
    -webkit-overflow-scrolling: touch;
    background-image:
      radial-gradient(circle at 20% -10%, rgba(200, 146, 42, 0.08) 0%, transparent 35%),
      radial-gradient(circle at 80% 120%, rgba(200, 146, 42, 0.06) 0%, transparent 40%);
  }

  ::selection {
    background-color: rgba(200, 146, 42, 0.25);
    color: #F5F5F5;
  }

  /* ===================== Links ===================== */
  a {
    text-decoration: none;
    color: inherit;
    &:focus-visible {
      outline: 2px solid #C8922A;
      outline-offset: 3px;
      border-radius: 4px;
    }
  }

  /* ================ Form Elements ================= */
  button, input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    outline: none;
    &:disabled { cursor: not-allowed; }
  }

  /* Texto: reset. Não aplicar a checkbox/radio/color (some a aparência nativa). */
  input:not([type="checkbox"]):not([type="radio"]):not([type="color"]):not([type="range"]):not([type="hidden"]):not([type="file"]),
  textarea {
    outline: none;
    border: none;
    background: none;
    &::placeholder { color: #9A9A9A; }
  }

  input[type="checkbox"],
  input[type="radio"] {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    cursor: pointer;
    accent-color: var(--bs-brand-main, #c8922a);
  }

  input[type="color"] {
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 2px;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    background: #1a1a1a;
    cursor: pointer;
  }

  /* ================ Scrollbar Premium ================= */
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #141414; }
  ::-webkit-scrollbar-thumb {
    background: #3A3A3A;
    border-radius: 9999px;
    border: 2px solid #141414;
    &:hover { background: #535353; }
  }

  /* ================ Focus Global ================= */
  *:focus-visible {
    outline: 2px solid #C8922A;
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* ================ Utilitários ================= */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* ================ Animações Premium ================= */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(200, 146, 42, 0.3); }
    50% { box-shadow: 0 0 40px rgba(200, 146, 42, 0.6); }
  }

  @keyframes brandGradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .fade-in { animation: fadeIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .fade-in-scale { animation: fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .slide-in { animation: slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .slide-up { animation: slideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }

  /* Staggered children */
  .stagger > * { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .stagger > *:nth-child(1) { animation-delay: 0ms; }
  .stagger > *:nth-child(2) { animation-delay: 60ms; }
  .stagger > *:nth-child(3) { animation-delay: 120ms; }
  .stagger > *:nth-child(4) { animation-delay: 180ms; }
  .stagger > *:nth-child(5) { animation-delay: 240ms; }
  .stagger > *:nth-child(6) { animation-delay: 300ms; }

  /* ================ Mobile específico ================= */
  @media (max-width: 1023px) {
    button, a { min-height: 44px; }
    input:not([type="checkbox"]):not([type="radio"]):not([type="color"]):not([type="hidden"]):not([type="file"]),
    select,
    textarea {
      min-height: 44px;
    }
  }

  /* ================ iOS Safe Area ================= */
  @supports (padding: max(0px)) {
    body {
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }
  }

  /* ================ Reduced Motion ================= */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* ================ React Calendar — Redesign Premium ================= */
  .react-calendar {
    border: 1px solid #2A2A2A;
    border-radius: 12px;
    background-color: #141414;
    color: #D2D2D2;
    font-family: "Inter", sans-serif;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    padding: 12px;
    width: 100%;
    max-width: 100%;

    @media (min-width: 480px) {
      padding: 16px;
      max-width: 340px;
    }
  }

  .react-calendar__navigation {
    display: flex;
    height: 48px;
    margin-bottom: 12px;
    gap: 4px;
  }

  .react-calendar__navigation button {
    color: #F5F5F5;
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 150ms ease;
    min-width: 44px;

    &:enabled:hover,
    &:enabled:focus {
      background-color: rgba(200, 146, 42, 0.1);
      color: #E8B84B;
    }

    &:disabled { color: #3D3D3D; }
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.7rem;
    color: #9A9A9A;
    margin-bottom: 8px;
    letter-spacing: 0.06em;
  }

  .react-calendar__month-view__weekdays__weekday {
    padding: 8px;
    abbr { text-decoration: none; }
  }

  .react-calendar__tile {
    background: none;
    border: none;
    border-radius: 8px;
    color: #D2D2D2;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 8px;
    transition: all 150ms ease;
    position: relative;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:enabled:hover,
    &:enabled:focus {
      background-color: rgba(200, 146, 42, 0.1);
      color: #E8B84B;
    }

    &:disabled {
      color: #3D3D3D;
      cursor: not-allowed;
    }
  }

  .react-calendar__tile--now {
    background: rgba(200, 146, 42, 0.1);
    color: #E8B84B;
    font-weight: 600;
  }

  .react-calendar__tile--active,
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: linear-gradient(135deg, #C8922A 0%, #E8B84B 100%) !important;
    color: #0D0D0D !important;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(200, 146, 42, 0.4);
  }

  .react-calendar__month-view__days__day--weekend {
    color: #8B7355;
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    color: #3D3D3D;
  }
`;
