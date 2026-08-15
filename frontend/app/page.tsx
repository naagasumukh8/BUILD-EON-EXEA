'use client'

export default function Home() {
  return (
    <div className="fixed inset-0 w-screen h-screen z-50 bg-[#040911]">
      <iframe
        src="/landing.html"
        className="w-full h-full border-none"
        title="EON EXEA — AI Maritime Decision Network"
      />
    </div>
  )
}
