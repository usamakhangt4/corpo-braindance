export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Gradient Blobs - Neural energy fields */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-64 h-64 bg-magenta-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>

      {/* Main Card - Loading Display */}
      <div className="relative w-full max-w-2xl z-10">
        <div className="relative bg-slate-950/90 backdrop-blur-sm border-2 border-cyan-500/40 rounded-lg p-8 md:p-12 shadow-[0_0_30px_rgba(6,182,212,0.4)] overflow-hidden">
          {/* Holographic scanline effect */}
          <div
            className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.03)_50%)] bg-size-[100%_4px] pointer-events-none opacity-30"
            style={{
              animation: 'scanline 8s linear infinite',
            }}
          ></div>

          {/* Corner brackets - terminal/holographic frame */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60"></div>

          {/* Neural link indicator - pulsing status dot */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Loading Label */}
            <div className="flex justify-center items-center mb-6">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] border border-cyan-500/50 bg-cyan-500/10 backdrop-blur-sm px-3 py-1 rounded">
                [INITIALIZING]
              </span>
            </div>

            {/* Loading Animation */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 border-4 border-transparent border-r-magenta-400/50 rounded-full animate-spin"
                  style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                ></div>
              </div>
            </div>

            {/* Loading Message */}
            <h2 className="text-2xl md:text-4xl font-serif font-medium text-slate-100 leading-tight mb-6">
              Establishing Neural Link...
            </h2>

            {/* Terminal output style message */}
            <div className="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-5 shadow-lg backdrop-blur-sm">
              <div className="text-cyan-300 font-mono text-sm leading-relaxed space-y-2">
                <p>
                  <span className="text-cyan-400 font-bold mr-2">&gt;</span>
                  Connecting to neural network...
                </p>
                <p className="animate-pulse">
                  <span className="text-cyan-400 font-bold mr-2">&gt;</span>
                  Syncing data streams...
                </p>
                <p className="opacity-75 animate-pulse" style={{ animationDelay: '0.5s' }}>
                  <span className="text-cyan-400 font-bold mr-2">&gt;</span>
                  Loading interface...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <p className="mt-8 text-cyan-600 font-mono text-xs tracking-[0.5em] uppercase text-center">
        Neural Link Status: Connecting
      </p>
    </main>
  )
}
