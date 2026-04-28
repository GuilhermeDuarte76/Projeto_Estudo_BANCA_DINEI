import { motion } from 'framer-motion'

/* Thin rising sparks */
const SPARKS = [
  { id: 0,  left: 6,  w: 1.5, delay: 0,    dur: 18 },
  { id: 1,  left: 18, w: 1,   delay: 3.5,  dur: 15 },
  { id: 2,  left: 32, w: 2,   delay: 7.2,  dur: 20 },
  { id: 3,  left: 45, w: 1,   delay: 1.5,  dur: 17 },
  { id: 4,  left: 58, w: 1.5, delay: 10.3, dur: 22 },
  { id: 5,  left: 70, w: 2,   delay: 5.1,  dur: 16 },
  { id: 6,  left: 81, w: 1,   delay: 13.8, dur: 19 },
  { id: 7,  left: 91, w: 1.5, delay: 8.4,  dur: 14 },
  { id: 8,  left: 25, w: 1,   delay: 15.6, dur: 21 },
  { id: 9,  left: 52, w: 2,   delay: 4.2,  dur: 23 },
  { id: 10, left: 12, w: 1,   delay: 11.0, dur: 18 },
  { id: 11, w: 1,   left: 76, delay: 6.8,  dur: 17 },
  { id: 12, left: 38, w: 1.5, delay: 9.1,  dur: 20 },
  { id: 13, left: 63, w: 1,   delay: 2.7,  dur: 16 },
  { id: 14, left: 84, w: 2,   delay: 12.4, dur: 19 },
]

/* Larger glowing orbs — drift slowly and glow more */
const ORBS = [
  { id: 0, left: 15, w: 4, delay: 0,   dur: 30 },
  { id: 1, left: 50, w: 5, delay: 10,  dur: 36 },
  { id: 2, left: 80, w: 3.5, delay: 20, dur: 28 },
  { id: 3, left: 35, w: 4, delay: 5,   dur: 33 },
]

export default function CardapioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black relative overflow-x-clip">
      {/* Grain texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          opacity: 0.045,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px',
        }}
      />

      {/* Atmospheric amber key — top centre (breathing) */}
      <motion.div
        className="fixed top-0 left-0 right-0 pointer-events-none z-0"
        style={{
          height: '55vh',
          background: 'radial-gradient(ellipse 110% 65% at 50% -5%, rgba(223,166,43,0.20) 0%, transparent 70%)',
        }}
        animate={{ opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Secondary side glows — slow drift */}
      <motion.div
        className="fixed top-0 left-0 right-0 pointer-events-none z-0"
        style={{
          height: '40vh',
          background: 'radial-gradient(ellipse 60% 50% at 20% 0%, rgba(223,130,20,0.09) 0%, transparent 65%)',
        }}
        animate={{ opacity: [0.5, 1, 0.5], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed top-0 left-0 right-0 pointer-events-none z-0"
        style={{
          height: '40vh',
          background: 'radial-gradient(ellipse 60% 50% at 80% 0%, rgba(223,130,20,0.09) 0%, transparent 65%)',
        }}
        animate={{ opacity: [0.5, 1, 0.5], x: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Warm floor reflection */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 pointer-events-none z-0"
        style={{
          height: '30vh',
          background: 'radial-gradient(ellipse 80% 55% at 50% 115%, rgba(180,120,40,0.14) 0%, transparent 70%)',
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Thin rising sparks */}
      {SPARKS.map((p) => (
        <motion.div
          key={p.id}
          className="fixed pointer-events-none z-0 rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.w,
            bottom: -4,
            backgroundColor: '#DFA62B',
          }}
          animate={{ y: [0, -1800], opacity: [0, 0.28, 0.28, 0] }}
          transition={{
            y:       { duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' },
            opacity: { duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear', times: [0, 0.06, 0.90, 1] },
          }}
        />
      ))}

      {/* Glowing orbs — larger, more visible, rise slowly */}
      {ORBS.map((o) => (
        <motion.div
          key={o.id}
          className="fixed pointer-events-none z-0 rounded-full"
          style={{
            left: `${o.left}%`,
            width: o.w,
            height: o.w,
            bottom: -8,
            backgroundColor: '#DFA62B',
            boxShadow: `0 0 ${o.w * 5}px ${o.w * 2}px rgba(223,166,43,0.35)`,
          }}
          animate={{ y: [0, -1800], opacity: [0, 0.45, 0.45, 0] }}
          transition={{
            y:       { duration: o.dur, delay: o.delay, repeat: Infinity, ease: 'linear' },
            opacity: { duration: o.dur, delay: o.delay, repeat: Infinity, ease: 'linear', times: [0, 0.08, 0.88, 1] },
          }}
        />
      ))}

      <div className="relative z-10">{children}</div>
    </div>
  )
}
