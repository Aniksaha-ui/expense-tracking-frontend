export default function FullPageLoader({
  message = 'Loading...',
  subtext = 'Please wait while we prepare the page.',
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#100d0e] px-6 py-10 text-white">
      <div className="flex flex-col items-center text-center">
        <div className="relative h-14 w-14">
          <span className="absolute inset-0 rounded-full border-2 border-[#2d282b]" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-500" />
          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500" />
        </div>
        <p className="mt-5 text-sm font-bold text-white">{message}</p>
        <p className="mt-2 text-xs font-medium text-[#8fa0bd]">{subtext}</p>
      </div>
    </div>
  )
}
