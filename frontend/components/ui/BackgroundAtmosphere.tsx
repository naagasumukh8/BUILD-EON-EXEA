export function BackgroundAtmosphere() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base deep background */}
      <div className="absolute inset-0 bg-[#080e14]" />
      
      {/* Subtle radial glows matching Mostar sky/ocean lighting */}
      <div className="absolute -top-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-radial from-[rgba(30,90,140,0.18)] via-transparent to-transparent blur-[120px]" />
      <div className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-radial from-[rgba(13,74,122,0.15)] via-transparent to-transparent blur-[140px]" />
      <div className="absolute -bottom-[20%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-radial from-[rgba(16,185,129,0.06)] via-transparent to-transparent blur-[100px]" />
      
      {/* Subtle grid mesh tint */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(253, 241, 225, 0.4) 1px, transparent 0)`,
          backgroundSize: '36px 36px'
        }}
      />
    </div>
  )
}
