export const ui = {
  app: 'min-h-screen w-full min-w-0 overflow-x-clip antialiased',
  publicPage: 'min-h-screen w-full min-w-0 overflow-x-clip bg-white text-[#17202a] antialiased',
  main: 'relative w-full min-w-0',
  container: 'mx-auto w-full max-w-[1440px] px-[clamp(16px,4vw,64px)]',
  section: 'relative w-full py-[clamp(48px,6vw,96px)]',
  card: 'rounded-[20px] border border-slate-200 bg-white',
  focusRing: 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600/15',
  primaryButton: 'inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] bg-[#e5091a] px-5 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#c90013]',
  field: 'w-full rounded-[9px] border border-slate-200 bg-slate-50 px-3 text-[#1e2630] outline-none transition focus:border-[#e5091a] focus:bg-white focus:ring-4 focus:ring-red-600/10',
}

export const cx = (...classes) => classes.filter(Boolean).join(' ')
