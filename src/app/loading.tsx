import { NeuralCard } from '@/components/NeuralCard'

export default function Loading() {
  return (
    <main className="min-h-screen bg-surface-base text-primary font-sans flex flex-col items-center justify-center p-4 md:p-8">
      {/* Main Card - Loading Display */}
      <div className="relative w-full max-w-2xl z-10">
        <NeuralCard className="p-8 md:p-12">
          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Loading Label */}
            <div className="flex justify-center items-center mb-6">
              <span className="text-xs font-bold text-neural-primary-hover uppercase tracking-[0.2em] border border-neural-primary/50 bg-neural-primary/10 backdrop-blur-sm px-3 py-1 rounded">
                [INITIALIZING]
              </span>
            </div>

            {/* Loading Animation */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-neural-primary/30 border-t-neural-primary-hover rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 border-4 border-transparent border-r-neural-secondary-light/50 rounded-full animate-spin"
                  style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                ></div>
              </div>
            </div>

            {/* Loading Message */}
            <h2 className="text-2xl md:text-4xl font-serif font-medium text-primary leading-tight mb-6">
              Establishing Neural Link...
            </h2>

            {/* Terminal output style message */}
            <div className="bg-surface-elevated/60 border border-neural-primary/20 rounded-lg p-5 shadow-lg backdrop-blur-sm">
              <div className="text-neural-primary-light font-mono text-sm leading-relaxed space-y-2">
                <p>
                  <span className="text-neural-primary-hover font-bold mr-2">&gt;</span>
                  Connecting to neural network...
                </p>
                <p className="animate-pulse">
                  <span className="text-neural-primary-hover font-bold mr-2">&gt;</span>
                  Syncing data streams...
                </p>
                <p className="opacity-75 animate-pulse" style={{ animationDelay: '0.5s' }}>
                  <span className="text-neural-primary-hover font-bold mr-2">&gt;</span>
                  Loading interface...
                </p>
              </div>
            </div>
          </div>
        </NeuralCard>
      </div>

      {/* Footer text */}
      <p className="mt-8 text-neural-primary-dark font-mono text-xs tracking-[0.5em] uppercase text-center">
        Neural Link Status: Connecting
      </p>
    </main>
  )
}
