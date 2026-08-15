export function BackgroundAtmosphere() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep atmospheric midnight background */}
      <div className="absolute inset-0 bg-[#0b1110]" />
      
      {/* Soft blue/teal atmospheric lighting */}
      <div className="absolute -top-[15%] left-[25%] w-[55vw] h-[55vw] rounded-full bg-radial from-[rgba(30,111,170,0.18)] via-transparent to-transparent blur-[130px]" />
      <div className="absolute top-[35%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-radial from-[rgba(13,74,122,0.14)] via-transparent to-transparent blur-[140px]" />
      <div className="absolute -bottom-[15%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-radial from-[rgba(16,185,129,0.05)] via-transparent to-transparent blur-[110px]" />
      
      {/* Subtle paper stipple mesh texture */}
      <div 
        className="absolute inset-0 opacity-[0.025]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(253, 241, 225, 0.5) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  )
}
