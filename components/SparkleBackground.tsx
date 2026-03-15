"use client"

// Static sparkles - no JS state or effects, generated once at module load.
const SPARKLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: ((i * 7.3 + 13) % 100).toFixed(2),
  y: ((i * 11.7 + 7) % 100).toFixed(2),
  delay: ((i * 0.1) % 3).toFixed(2),
}))

export function SparkleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden dark:block hidden">
      {SPARKLES.map((sparkle) => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDelay: `${sparkle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
