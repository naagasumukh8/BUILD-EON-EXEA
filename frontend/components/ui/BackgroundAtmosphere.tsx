export function BackgroundAtmosphere() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Light Opal paper background */}
      <div className="absolute inset-0 bg-[#FAFAF8]" />
      
      {/* Soft ambient lighting highlights */}
      <div className="absolute -top-[15%] left-[25%] w-[55vw] h-[55vw] rounded-full bg-radial from-[rgba(24,24,27,0.03)] via-transparent to-transparent blur-[130px]" />
      <div className="absolute top-[35%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-radial from-[rgba(24,24,27,0.02)] via-transparent to-transparent blur-[140px]" />
      
      {/* Soft paper mesh grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(24, 24, 27, 0.4) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  )
}
