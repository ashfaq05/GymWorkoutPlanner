import React from 'react';
import { ExerciseClipartKey } from '../types';

interface ExerciseClipartProps {
  type: ExerciseClipartKey | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Minimalist blueprint / stick-figure exercise diagram clipart.
 * Following the training plan spec:
 * - Faded figure: start position
 * - Solid figure: finish position
 * - Arrow: direction of movement
 * - Equipment: clean geometric outline
 */
export const ExerciseClipart: React.FC<ExerciseClipartProps> = ({
  type,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-12 h-9',
    md: 'w-16 h-12',
    lg: 'w-24 h-18',
  };

  const renderGraphic = () => {
    switch (type) {
      case 'bench-press':
        return (
          // Flat bench, barbell press upwards
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Bench */}
            <line x1="20" y1="46" x2="80" y2="46" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            <line x1="30" y1="46" x2="30" y2="60" strokeWidth="2.5" opacity="0.4" />
            <line x1="70" y1="46" x2="70" y2="60" strokeWidth="2.5" opacity="0.4" />
            
            {/* Person on bench - torso & head */}
            <circle cx="28" cy="41" r="4" strokeWidth="1.8" />
            <line x1="32" y1="43" x2="68" y2="43" strokeWidth="2.2" strokeLinecap="round" />
            {/* Legs on floor */}
            <polyline points="68,43 76,48 78,60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Faded Arms (Start - bar down at chest) */}
            <g opacity="0.35">
              <polyline points="46,43 41,35 46,31" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="32" y1="31" x2="62" y2="31" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="34" cy="31" r="3" strokeWidth="1.5" />
              <circle cx="60" cy="31" r="3" strokeWidth="1.5" />
            </g>

            {/* Solid Arms (Finish - arms locked out upwards) */}
            <polyline points="46,43 45,26 46,16" strokeWidth="2" strokeLinecap="round" />
            {/* Barbell up */}
            <line x1="32" y1="16" x2="62" y2="16" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="34" cy="16" r="3" strokeWidth="1.5" />
            <circle cx="60" cy="16" r="3" strokeWidth="1.5" />

            {/* Motion arrow pointing up */}
            <path d="M53 28 L53 20 M50 23 L53 20 L56 23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="stroke-primary" />
          </svg>
        );

      case 'incline-dumbbell-press':
      case 'smith-incline-press':
        return (
          // Incline bench ~30 deg, pressing up
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Incline Bench */}
            <line x1="22" y1="52" x2="64" y2="28" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            <line x1="45" y1="39" x2="45" y2="58" strokeWidth="2.5" opacity="0.4" />
            <line x1="22" y1="52" x2="16" y2="58" strokeWidth="2.5" opacity="0.4" />

            {/* Person leaning back */}
            <circle cx="28" cy="44" r="4" strokeWidth="1.8" />
            <line x1="31" y1="42" x2="55" y2="32" strokeWidth="2.2" strokeLinecap="round" />
            <polyline points="31,48 35,58" strokeWidth="2" strokeLinecap="round" />

            {/* Faded Start: weights lowered to shoulders */}
            <g opacity="0.35">
              <polyline points="42,38 38,32 40,26" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="36" y="24" width="8" height="4" rx="1" strokeWidth="1.2" />
            </g>

            {/* Solid Finish: weights pressed overhead */}
            <polyline points="42,38 46,24 50,14" strokeWidth="2" strokeLinecap="round" />
            <rect x="46" y="11" width="8" height="4" rx="1" strokeWidth="1.5" />

            {/* Arrow */}
            <path d="M42 22 L47 16 M44 15 L47 16 L49 19" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'seated-cable-row':
        return (
          // Seated row machine, pulling handle to torso
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Bench & Footplate */}
            <line x1="20" y1="54" x2="65" y2="54" strokeWidth="2.5" opacity="0.4" />
            <line x1="72" y1="40" x2="72" y2="58" strokeWidth="3" opacity="0.5" />
            <circle cx="82" cy="38" r="4" strokeWidth="2" opacity="0.4" />

            {/* Seated Person */}
            <circle cx="34" cy="28" r="4" strokeWidth="1.8" />
            <line x1="34" y1="32" x2="38" y2="50" strokeWidth="2.2" strokeLinecap="round" />
            <polyline points="38,50 56,48 68,44" strokeWidth="2" strokeLinecap="round" />

            {/* Faded Start: arms stretched forward */}
            <g opacity="0.35">
              <line x1="36" y1="36" x2="68" y2="40" strokeWidth="1.8" strokeLinecap="round" />
            </g>

            {/* Solid Finish: elbows bent back pulling handle */}
            <polyline points="36,36 30,42 42,42" strokeWidth="2.2" strokeLinecap="round" />
            {/* Cable line */}
            <line x1="42" y1="42" x2="82" y2="38" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />

            {/* Motion arrow pointing backward */}
            <path d="M60 36 L48 36 M51 33 L48 36 L51 39" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'lat-pulldown':
      case 'neutral-lat-pulldown':
        return (
          // Lat pulldown seat, pulling bar down to chest
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Machine frame and overhead bar */}
            <line x1="25" y1="54" x2="60" y2="54" strokeWidth="2.5" opacity="0.4" />
            <line x1="68" y1="12" x2="68" y2="60" strokeWidth="2" opacity="0.3" />
            <line x1="38" y1="12" x2="68" y2="12" strokeWidth="2" opacity="0.3" />

            {/* Person sitting upright */}
            <circle cx="48" cy="32" r="4" strokeWidth="1.8" />
            <line x1="48" y1="36" x2="48" y2="54" strokeWidth="2.2" strokeLinecap="round" />
            <polyline points="48,54 58,54 58,62" strokeWidth="2" strokeLinecap="round" />

            {/* Faded Start: Arms fully extended upward holding bar */}
            <g opacity="0.35">
              <polyline points="48,38 42,24 38,15" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="30" y1="15" x2="64" y2="15" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Solid Finish: Arms pulled down to upper chest */}
            <polyline points="48,38 40,42 46,38" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="34" y1="36" x2="60" y2="36" strokeWidth="2.5" strokeLinecap="round" />

            {/* Arrow pointing down */}
            <path d="M54 20 L54 30 M51 27 L54 30 L57 27" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'lateral-raise':
        return (
          // Standing, dumbbells raised to side
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Standing body */}
            <circle cx="50" cy="18" r="4" strokeWidth="1.8" />
            <line x1="50" y1="22" x2="50" y2="46" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="47" y1="46" x2="43" y2="62" strokeWidth="2" strokeLinecap="round" />
            <line x1="53" y1="46" x2="57" y2="62" strokeWidth="2" strokeLinecap="round" />

            {/* Faded Start: Arms hanging at sides */}
            <g opacity="0.35">
              <line x1="48" y1="26" x2="44" y2="44" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="52" y1="26" x2="56" y2="44" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="44" cy="45" r="2" fill="currentColor" />
              <circle cx="56" cy="45" r="2" fill="currentColor" />
            </g>

            {/* Solid Finish: Arms raised horizontally */}
            <polyline points="48,26 34,26 24,28" strokeWidth="2.2" strokeLinecap="round" />
            <polyline points="52,26 66,26 76,28" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="20" y="26" width="4" height="6" rx="1" strokeWidth="1.2" />
            <rect x="76" y="26" width="4" height="6" rx="1" strokeWidth="1.2" />

            {/* Motion arc arrows */}
            <path d="M36 40 Q30 35 28 32 M27 36 L28 32 L32 33" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M64 40 Q70 35 72 32 M73 36 L72 32 L68 33" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'triceps-pushdown':
        return (
          // Cable triceps pushdown: elbows pinned, extending down
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Cable Machine upright */}
            <line x1="26" y1="10" x2="26" y2="62" strokeWidth="2.5" opacity="0.3" />
            <circle cx="26" cy="14" r="3" strokeWidth="1.8" opacity="0.5" />

            {/* Person standing facing cable */}
            <circle cx="54" cy="20" r="4" strokeWidth="1.8" />
            <line x1="52" y1="24" x2="50" y2="46" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="50" y1="46" x2="48" y2="62" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="46" x2="55" y2="62" strokeWidth="2" strokeLinecap="round" />

            {/* Faded Start: forearms bent at 90 deg */}
            <g opacity="0.35">
              <polyline points="50,28 44,34 38,32" strokeWidth="1.8" strokeLinecap="round" />
            </g>

            {/* Solid Finish: forearms pushed straight down */}
            <polyline points="50,28 44,34 40,48" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="38" y1="48" x2="43" y2="48" strokeWidth="3" strokeLinecap="round" />

            {/* Cable rope */}
            <line x1="26" y1="14" x2="40" y2="48" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.5" />

            {/* Motion arrow pointing downward */}
            <path d="M35 34 L36 44 M33 41 L36 44 L39 41" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'incline-dumbbell-curl':
      case 'ez-bar-curl':
      case 'hammer-curl':
        return (
          // Incline bench or standing curl
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Bench incline */}
            <line x1="30" y1="56" x2="56" y2="28" strokeWidth="2.5" opacity="0.4" />
            <circle cx="58" cy="24" r="4" strokeWidth="1.8" />
            <line x1="56" y1="28" x2="38" y2="52" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="38" y1="52" x2="28" y2="60" strokeWidth="2" strokeLinecap="round" />

            {/* Faded Start: arms extended hanging down holding db */}
            <g opacity="0.35">
              <line x1="52" y1="34" x2="54" y2="52" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="51" y="52" width="6" height="3" rx="1" strokeWidth="1.2" />
            </g>

            {/* Solid Finish: forearm curled up */}
            <polyline points="52,34 50,42 42,32" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="40" y="28" width="6" height="4" rx="1" strokeWidth="1.5" />

            {/* Motion curl arc */}
            <path d="M53 48 Q50 38 45 34 M47 38 L45 34 L43 37" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'overhead-tricep-ext':
        return (
          // Overhead triceps extension
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            <circle cx="48" cy="28" r="4" strokeWidth="1.8" />
            <line x1="48" y1="32" x2="48" y2="54" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="48" y1="54" x2="44" y2="64" strokeWidth="2" strokeLinecap="round" />
            <line x1="48" y1="54" x2="52" y2="64" strokeWidth="2" strokeLinecap="round" />

            {/* Faded Start: elbow up, forearm bent back behind head */}
            <g opacity="0.35">
              <polyline points="48,34 50,20 42,22" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="40" cy="22" r="3" strokeWidth="1.2" />
            </g>

            {/* Solid Finish: forearm extended straight overhead */}
            <polyline points="48,34 50,20 50,8" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="50" cy="7" r="3" strokeWidth="1.5" />

            {/* Arrow upwards */}
            <path d="M43 18 Q46 14 48 11 M45 11 L48 11 L49 14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'leg-extension':
        return (
          // Seated machine, legs extending up
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Machine seat pad */}
            <line x1="30" y1="32" x2="30" y2="50" strokeWidth="3" opacity="0.4" />
            <line x1="30" y1="50" x2="52" y2="50" strokeWidth="3" opacity="0.4" />
            <circle cx="34" cy="24" r="4" strokeWidth="1.8" />

            {/* Torso & Thigh */}
            <line x1="34" y1="28" x2="36" y2="50" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="36" y1="50" x2="56" y2="50" strokeWidth="2.5" strokeLinecap="round" />

            {/* Faded Start: Shin bent down 90 deg */}
            <g opacity="0.35">
              <line x1="56" y1="50" x2="56" y2="64" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="58" cy="62" r="3" strokeWidth="1.2" />
            </g>

            {/* Solid Finish: Shin extended straight forward */}
            <line x1="56" y1="50" x2="74" y2="44" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="72" cy="46" r="3.5" strokeWidth="1.5" />

            {/* Motion arc arrow upwards */}
            <path d="M60 60 Q68 56 70 50 M67 52 L70 50 L70 55" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'seated-leg-curl':
        return (
          // Seated leg curl machine, curling legs down/back
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Seat & Back */}
            <line x1="32" y1="30" x2="32" y2="48" strokeWidth="3" opacity="0.4" />
            <line x1="32" y1="48" x2="56" y2="48" strokeWidth="3" opacity="0.4" />
            <circle cx="36" cy="22" r="4" strokeWidth="1.8" />

            {/* Body */}
            <line x1="36" y1="26" x2="38" y2="48" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="38" y1="48" x2="58" y2="48" strokeWidth="2.5" strokeLinecap="round" />

            {/* Faded Start: Shin extended straight out */}
            <g opacity="0.35">
              <line x1="58" y1="48" x2="76" y2="44" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="74" cy="42" r="3" strokeWidth="1.2" />
            </g>

            {/* Solid Finish: Shin curled down under seat */}
            <line x1="58" y1="48" x2="54" y2="64" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="56" cy="62" r="3.5" strokeWidth="1.5" />

            {/* Motion arc arrow downwards */}
            <path d="M72 48 Q66 56 58 60 M62 60 L58 60 L59 56" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'leg-press':
        return (
          // 45 degree leg press sled
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Incline back rest */}
            <line x1="20" y1="56" x2="38" y2="34" strokeWidth="3" opacity="0.4" />
            <circle cx="38" cy="28" r="4" strokeWidth="1.8" />
            <line x1="36" y1="32" x2="24" y2="54" strokeWidth="2.2" strokeLinecap="round" />

            {/* Faded Start: knees fully bent to chest */}
            <g opacity="0.35">
              <polyline points="24,54 36,44 48,46" strokeWidth="1.8" strokeLinecap="round" />
              {/* Sled plate close */}
              <line x1="46" y1="38" x2="54" y2="52" strokeWidth="3" opacity="0.5" />
            </g>

            {/* Solid Finish: legs pressed out */}
            <polyline points="24,54 48,38 68,26" strokeWidth="2.2" strokeLinecap="round" />
            {/* Sled platform pushed high */}
            <line x1="64" y1="18" x2="74" y2="34" strokeWidth="3.5" strokeLinecap="round" />

            {/* Motion arrow pushing sled */}
            <path d="M46 40 L60 30 M56 29 L60 30 L60 34" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'seated-calf-raise':
        return (
          // Seated calf machine: knees under pad, calves raising heels
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Seat */}
            <line x1="28" y1="46" x2="48" y2="46" strokeWidth="2.5" opacity="0.4" />
            <circle cx="34" cy="28" r="4" strokeWidth="1.8" />
            <line x1="34" y1="32" x2="36" y2="46" strokeWidth="2.2" strokeLinecap="round" />
            {/* Thigh horizontal to knee */}
            <line x1="36" y1="46" x2="56" y2="46" strokeWidth="2.5" strokeLinecap="round" />
            {/* Knee pad resting on thighs */}
            <rect x="52" y="42" width="8" height="4" rx="1" strokeWidth="1.5" opacity="0.6" />

            {/* Foot block on floor */}
            <line x1="50" y1="64" x2="68" y2="64" strokeWidth="3" opacity="0.4" />

            {/* Faded Start: heel down low */}
            <g opacity="0.35">
              <polyline points="56,46 56,62 62,64" strokeWidth="1.8" strokeLinecap="round" />
            </g>

            {/* Solid Finish: heel raised high on toes */}
            <polyline points="56,46 58,58 64,63" strokeWidth="2.2" strokeLinecap="round" />

            {/* Arrow pointing up */}
            <path d="M52 58 L52 50 M49 53 L52 50 L55 53" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'hanging-knee-raise':
        return (
          // Hanging from overhead pull-up bar, knees raised to chest
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Bar */}
            <line x1="30" y1="12" x2="70" y2="12" strokeWidth="3" strokeLinecap="round" opacity="0.4" />

            {/* Faded Start: Hanging straight down */}
            <g opacity="0.35">
              <circle cx="50" cy="22" r="3.5" strokeWidth="1.5" />
              <line x1="50" y1="12" x2="50" y2="19" strokeWidth="1.5" />
              <line x1="50" y1="26" x2="50" y2="44" strokeWidth="1.8" />
              <line x1="50" y1="44" x2="50" y2="64" strokeWidth="1.8" />
            </g>

            {/* Solid Finish: Knees curled up to chest */}
            <circle cx="48" cy="22" r="3.8" strokeWidth="1.8" />
            <line x1="48" y1="12" x2="48" y2="19" strokeWidth="2" strokeLinecap="round" />
            <line x1="48" y1="26" x2="48" y2="42" strokeWidth="2.2" strokeLinecap="round" />
            <polyline points="48,42 58,38 60,48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Motion arc arrow curling knees up */}
            <path d="M52 58 Q60 52 58 44 M55 46 L58 44 L61 47" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'machine-chest-press':
        return (
          // Seated machine chest press
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Backrest & Seat */}
            <line x1="28" y1="26" x2="28" y2="52" strokeWidth="3" opacity="0.4" />
            <line x1="28" y1="52" x2="46" y2="52" strokeWidth="2.5" opacity="0.4" />
            <circle cx="34" cy="26" r="4" strokeWidth="1.8" />
            <line x1="34" y1="30" x2="34" y2="52" strokeWidth="2.2" strokeLinecap="round" />

            {/* Faded Start: Handles held close to chest */}
            <g opacity="0.35">
              <polyline points="34,36 30,40 38,40" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="38" cy="40" r="2.5" strokeWidth="1.2" />
            </g>

            {/* Solid Finish: Arms pressed fully forward */}
            <polyline points="34,36 44,36 58,36" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="58" y1="32" x2="58" y2="40" strokeWidth="3" strokeLinecap="round" />

            {/* Arrow pushing forward */}
            <path d="M42 42 L52 42 M49 39 L52 42 L49 45" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'seated-shoulder-press':
        return (
          // Seated DB shoulder press overhead
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            <line x1="38" y1="28" x2="38" y2="54" strokeWidth="3" opacity="0.4" />
            <circle cx="44" cy="26" r="4" strokeWidth="1.8" />
            <line x1="44" y1="30" x2="44" y2="54" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="44" y1="54" x2="56" y2="54" strokeWidth="2" strokeLinecap="round" />

            {/* Faded Start: Dumbbell at ear level */}
            <g opacity="0.35">
              <polyline points="44,34 38,36 40,26" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="36" y="24" width="8" height="4" rx="1" strokeWidth="1.2" />
            </g>

            {/* Solid Finish: Dumbbell pressed overhead */}
            <polyline points="44,34 46,20 48,10" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="44" y="8" width="8" height="4" rx="1" strokeWidth="1.5" />

            {/* Arrow up */}
            <path d="M42 22 L44 14 M41 16 L44 14 L46 17" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'reverse-pec-deck':
        return (
          // Chest against pad, arms moving backward
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Front chest pad */}
            <line x1="50" y1="24" x2="50" y2="52" strokeWidth="3" opacity="0.4" />
            <circle cx="44" cy="24" r="4" strokeWidth="1.8" />
            <line x1="44" y1="28" x2="44" y2="52" strokeWidth="2.2" strokeLinecap="round" />

            {/* Faded Start: Arms forward in front */}
            <g opacity="0.35">
              <line x1="44" y1="34" x2="56" y2="34" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="56" cy="34" r="2.5" strokeWidth="1.2" />
            </g>

            {/* Solid Finish: Arms pulled wide back */}
            <polyline points="44,34 32,34 22,36" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="22" cy="36" r="3" strokeWidth="1.5" />

            {/* Motion arrow pointing back */}
            <path d="M50 40 L36 40 M40 37 L36 40 L40 43" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'banded-lateral-walk':
        return (
          // Quarter squat with resistance band above knees
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            <circle cx="50" cy="18" r="4" strokeWidth="1.8" />
            {/* Torso in slight hinge */}
            <line x1="50" y1="22" x2="48" y2="38" strokeWidth="2.2" strokeLinecap="round" />
            {/* Quarter squat legs */}
            <polyline points="48,38 38,48 36,64" strokeWidth="2.2" strokeLinecap="round" />
            <polyline points="48,38 58,48 64,64" strokeWidth="2.2" strokeLinecap="round" />

            {/* Resistance band looped across knees */}
            <rect x="36" y="46" width="24" height="4" rx="2" strokeWidth="1.8" fill="currentColor" fillOpacity="0.2" />

            {/* Lateral movement direction arrow */}
            <path d="M66 52 L78 52 M74 49 L78 52 L74 55" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'plank-hold':
        return (
          // Strict forearm plank
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Floor line */}
            <line x1="16" y1="58" x2="84" y2="58" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />

            {/* Head, straight spine to toes */}
            <circle cx="32" cy="40" r="3.8" strokeWidth="1.8" />
            {/* Forearm on floor */}
            <polyline points="38,44 38,58 46,58" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Straight body line */}
            <line x1="38" y1="44" x2="72" y2="48" strokeWidth="2.4" strokeLinecap="round" />
            {/* Legs & toes on floor */}
            <polyline points="72,48 76,56 76,58" strokeWidth="2.2" strokeLinecap="round" />

            {/* Core tension indicator sparkles/lines */}
            <circle cx="54" cy="46" r="3" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
          </svg>
        );

      case 'squat':
        return (
          // Barbell squat
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Faded Start: Standing straight */}
            <g opacity="0.35">
              <circle cx="50" cy="18" r="3.5" strokeWidth="1.5" />
              <line x1="50" y1="22" x2="50" y2="42" strokeWidth="1.8" />
              <line x1="50" y1="42" x2="46" y2="62" strokeWidth="1.8" />
              <line x1="50" y1="42" x2="54" y2="62" strokeWidth="1.8" />
            </g>

            {/* Solid Finish: Deep squat position with barbell across shoulders */}
            <circle cx="44" cy="30" r="3.8" strokeWidth="1.8" />
            <line x1="44" y1="34" x2="38" y2="48" strokeWidth="2.2" strokeLinecap="round" />
            <polyline points="38,48 52,50 48,64" strokeWidth="2.2" strokeLinecap="round" />
            {/* Barbell on upper back */}
            <line x1="34" y1="32" x2="54" y2="32" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="35" cy="32" r="3" strokeWidth="1.5" />
            <circle cx="53" cy="32" r="3" strokeWidth="1.5" />

            {/* Motion arrow */}
            <path d="M56 34 L56 46 M53 43 L56 46 L59 43" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'deadlift':
        return (
          // Deadlift / Romanian Deadlift
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            <line x1="16" y1="62" x2="84" y2="62" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
            {/* Hip hinge body */}
            <circle cx="34" cy="30" r="3.8" strokeWidth="1.8" />
            <line x1="36" y1="32" x2="48" y2="42" strokeWidth="2.2" strokeLinecap="round" />
            <polyline points="48,42 50,52 50,62" strokeWidth="2.2" strokeLinecap="round" />
            {/* Arms hanging holding barbell */}
            <line x1="38" y1="34" x2="52" y2="54" strokeWidth="2" strokeLinecap="round" />
            {/* Barbell plates */}
            <line x1="42" y1="54" x2="62" y2="54" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="52" cy="54" r="5" strokeWidth="1.8" />

            {/* Motion arrow showing hip drive */}
            <path d="M42 46 L38 38 M37 42 L38 38 L42 39" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'pullup':
        return (
          // Pull up
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            <line x1="26" y1="14" x2="74" y2="14" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            <circle cx="50" cy="18" r="3.8" strokeWidth="1.8" />
            <polyline points="40,14 44,22 48,22" strokeWidth="2" strokeLinecap="round" />
            <polyline points="60,14 56,22 52,22" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="22" x2="50" y2="44" strokeWidth="2.2" strokeLinecap="round" />
            <polyline points="50,44 48,56 54,58" strokeWidth="2" strokeLinecap="round" />
            {/* Arrow up */}
            <path d="M56 36 L56 26 M53 29 L56 26 L59 29" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'hip-thrust':
        return (
          // Barbell hip thrust against bench
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Bench support */}
            <rect x="22" y="38" width="14" height="20" rx="1.5" strokeWidth="2" opacity="0.4" />
            {/* Upper back on bench */}
            <circle cx="28" cy="34" r="3.5" strokeWidth="1.8" />
            {/* Faded Start: Hips dipped low */}
            <g opacity="0.35">
              <polyline points="32,38 46,50 62,44 62,58" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="42" y1="50" x2="50" y2="50" strokeWidth="2.5" />
            </g>
            {/* Solid Finish: Full hip extension lockout */}
            <polyline points="32,38 52,38 64,48 64,58" strokeWidth="2.2" strokeLinecap="round" />
            {/* Barbell across pelvis */}
            <circle cx="52" cy="38" r="4" strokeWidth="2" />
            <line x1="46" y1="38" x2="58" y2="38" strokeWidth="2.5" strokeLinecap="round" />
            {/* Arrow up */}
            <path d="M48 48 L48 40 M45 43 L48 40 L51 43" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'bent-row':
        return (
          // Bent-over barbell row
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            <circle cx="36" cy="24" r="3.5" strokeWidth="1.8" />
            {/* Torso hinged at 45 deg */}
            <line x1="38" y1="27" x2="50" y2="42" strokeWidth="2.2" strokeLinecap="round" />
            <polyline points="50,42 52,52 50,62" strokeWidth="2" strokeLinecap="round" />
            {/* Faded Start: Arms hanging straight */}
            <g opacity="0.35">
              <line x1="42" y1="32" x2="42" y2="52" strokeWidth="1.8" />
              <circle cx="42" cy="52" r="3.5" strokeWidth="1.5" />
            </g>
            {/* Solid Finish: Elbows pulled back to abdomen */}
            <polyline points="42,32 46,38 48,34" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="48" cy="34" r="4" strokeWidth="2" />
            {/* Direction arrow */}
            <path d="M42 48 L46 38 M43 40 L46 38 L48 42" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'face-pull':
        return (
          // Cable rope face pull
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            <line x1="20" y1="12" x2="20" y2="58" strokeWidth="2.5" opacity="0.3" />
            <circle cx="20" cy="22" r="2.5" opacity="0.5" />
            {/* Standing athlete */}
            <circle cx="68" cy="22" r="3.8" strokeWidth="1.8" />
            <line x1="68" y1="26" x2="66" y2="48" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="66" y1="48" x2="62" y2="62" strokeWidth="2" />
            <line x1="66" y1="48" x2="72" y2="62" strokeWidth="2" />
            {/* Faded Start: Arms straight to cable */}
            <g opacity="0.35">
              <line x1="66" y1="30" x2="26" y2="22" strokeWidth="1.6" strokeDasharray="3 2" />
            </g>
            {/* Solid Finish: High elbows pulled to ears */}
            <polyline points="66,30 58,26 62,20" strokeWidth="2.2" strokeLinecap="round" />
            {/* Rope handles */}
            <line x1="60" y1="18" x2="64" y2="22" strokeWidth="2.5" strokeLinecap="round" />
            {/* Arrow */}
            <path d="M42 24 L56 24 M52 21 L56 24 L52 27" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'standing-calf':
        return (
          // Standing calf raise
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Step block */}
            <rect x="36" y="58" width="28" height="6" rx="1" strokeWidth="2" opacity="0.4" />
            <circle cx="50" cy="18" r="3.8" strokeWidth="1.8" />
            <line x1="50" y1="22" x2="50" y2="46" strokeWidth="2.2" strokeLinecap="round" />
            {/* Faded Start: Heels hanging below block */}
            <g opacity="0.35">
              <polyline points="50,46 48,58 44,62" strokeWidth="1.8" />
            </g>
            {/* Solid Finish: Calves contracted up on toes */}
            <polyline points="50,46 50,56 46,58" strokeWidth="2.2" strokeLinecap="round" />
            {/* Arrow up */}
            <path d="M58 54 L58 42 M55 46 L58 42 L61 46" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'wrist-curl':
        return (
          // Forearms on bench wrist curl
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            <line x1="20" y1="46" x2="68" y2="46" strokeWidth="3" opacity="0.4" />
            {/* Forearm flat */}
            <line x1="30" y1="43" x2="64" y2="43" strokeWidth="2.5" strokeLinecap="round" />
            {/* Faded Start: Wrist hanging down */}
            <g opacity="0.35">
              <line x1="64" y1="43" x2="68" y2="52" strokeWidth="2" />
              <rect x="66" y="52" width="6" height="4" rx="1" strokeWidth="1.2" />
            </g>
            {/* Solid Finish: Wrist curled upwards */}
            <polyline points="64,43 70,36" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="68" y="32" width="6" height="4" rx="1" strokeWidth="1.5" />
            {/* Arrow */}
            <path d="M72 48 Q74 42 72 38 M74 41 L72 38 L70 41" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'ab-rollout':
        return (
          // Ab wheel rollout
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            <line x1="16" y1="58" x2="84" y2="58" strokeWidth="2.5" opacity="0.3" />
            {/* Knees on ground */}
            <circle cx="26" cy="56" r="3" strokeWidth="1.5" />
            {/* Faded Start: upright kneeling */}
            <g opacity="0.35">
              <circle cx="30" cy="30" r="3.5" />
              <line x1="30" y1="34" x2="26" y2="56" strokeWidth="1.8" />
              <line x1="30" y1="38" x2="40" y2="54" strokeWidth="1.8" />
              <circle cx="42" cy="54" r="4" strokeWidth="1.5" />
            </g>
            {/* Solid Finish: fully rolled out */}
            <circle cx="48" cy="40" r="3.5" strokeWidth="1.8" />
            <line x1="26" y1="56" x2="52" y2="42" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="52" y1="42" x2="74" y2="54" strokeWidth="2.2" strokeLinecap="round" />
            {/* Wheel */}
            <circle cx="76" cy="54" r="4.5" strokeWidth="2" />
            {/* Direction arrow */}
            <path d="M46 52 L62 52 M58 49 L62 52 L58 55" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'shrug':
        return (
          // Dumbbell shrug for traps
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            <circle cx="50" cy="18" r="3.8" strokeWidth="1.8" />
            {/* Torso */}
            <line x1="50" y1="22" x2="50" y2="48" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="48" y1="48" x2="44" y2="62" strokeWidth="2" />
            <line x1="52" y1="48" x2="56" y2="62" strokeWidth="2" />
            {/* Faded Start: Shoulders hanging low */}
            <g opacity="0.35">
              <line x1="50" y1="28" x2="38" y2="46" strokeWidth="1.8" />
              <line x1="50" y1="28" x2="62" y2="46" strokeWidth="1.8" />
              <rect x="36" y="46" width="4" height="6" rx="1" strokeWidth="1.2" />
              <rect x="60" y="46" width="4" height="6" rx="1" strokeWidth="1.2" />
            </g>
            {/* Solid Finish: Shoulders shrugged high to ears */}
            <polyline points="42,22 50,25 58,22" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="42" y1="22" x2="38" y2="38" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="58" y1="22" x2="62" y2="38" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="36" y="38" width="4" height="6" rx="1" strokeWidth="1.5" />
            <rect x="60" y="38" width="4" height="6" rx="1" strokeWidth="1.5" />
            {/* Arrows up */}
            <path d="M34 40 L34 30 M31 34 L34 30 L37 34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M66 40 L66 30 M63 34 L66 30 L69 34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'russian-twist':
        return (
          // Core seated russian twist
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            <line x1="20" y1="58" x2="80" y2="58" strokeWidth="2" opacity="0.3" />
            {/* V-sit position */}
            <circle cx="42" cy="30" r="3.8" strokeWidth="1.8" />
            <line x1="42" y1="34" x2="46" y2="52" strokeWidth="2.2" strokeLinecap="round" />
            <polyline points="46,52 62,44 68,52" strokeWidth="2.2" strokeLinecap="round" />
            {/* Rotation with weight */}
            <polyline points="44,38 34,44 32,48" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="48" r="3.5" strokeWidth="1.8" />
            {/* Curved rotation arrow */}
            <path d="M30 40 Q38 36 46 42 M42 42 L46 42 L45 39" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'split-squat':
        return (
          // Bulgarian split squat
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Rear bench */}
            <rect x="18" y="44" width="12" height="14" rx="1" strokeWidth="2" opacity="0.4" />
            <circle cx="46" cy="24" r="3.8" strokeWidth="1.8" />
            <line x1="46" y1="28" x2="46" y2="46" strokeWidth="2.2" strokeLinecap="round" />
            {/* Back leg on bench */}
            <polyline points="46,46 32,44 26,46" strokeWidth="2" strokeLinecap="round" />
            {/* Front leg in deep lunge */}
            <polyline points="46,46 56,48 54,60" strokeWidth="2.2" strokeLinecap="round" />
            {/* Direction arrow down */}
            <path d="M40 30 L40 40 M37 37 L40 40 L43 37" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'kettlebell-swing':
        return (
          // Kettlebell swing hip hinge
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            {/* Athlete swinging bell forward */}
            <circle cx="42" cy="22" r="3.8" strokeWidth="1.8" />
            <line x1="42" y1="26" x2="44" y2="46" strokeWidth="2.2" strokeLinecap="round" />
            <polyline points="44,46 42,60" strokeWidth="2" />
            <polyline points="44,46 48,60" strokeWidth="2" />
            {/* Arms extending kettlebell to chest height */}
            <line x1="43" y1="30" x2="64" y2="32" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="66" cy="32" r="4" strokeWidth="2" />
            <path d="M64 30 Q66 26 68 30" strokeWidth="1.5" />
            {/* Arc motion arrow */}
            <path d="M48 44 Q56 42 60 36 M57 37 L60 36 L59 40" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      default:
        // Generic dumbbell silhouette
        return (
          <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" className="w-full h-full">
            <line x1="32" y1="35" x2="68" y2="35" strokeWidth="3" strokeLinecap="round" />
            <rect x="26" y="24" width="7" height="22" rx="2" strokeWidth="1.8" />
            <rect x="67" y="24" width="7" height="22" rx="2" strokeWidth="1.8" />
            <rect x="22" y="27" width="5" height="16" rx="1.5" strokeWidth="1.5" opacity="0.6" />
            <rect x="73" y="27" width="5" height="16" rx="1.5" opacity="0.6" strokeWidth="1.5" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg border border-neutral-700/50 bg-neutral-900/60 p-1 text-neutral-300 transition-colors hover:border-neutral-500/70 hover:bg-neutral-800/80 ${sizeClasses[size]} ${className}`}
      title={type}
    >
      {renderGraphic()}
    </div>
  );
};
