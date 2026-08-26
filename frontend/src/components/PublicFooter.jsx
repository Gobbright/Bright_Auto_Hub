import { Link } from 'react-router-dom'
import whiteLogo from '../assets/Images/Home/Banners/Logo/Logo-White.png'
import { ui } from '../lib/uiClasses.js'

const footerGroups = [
  ['Explore', ['Vehicles', '/vehicles'], ['Bikes', '/vehicles/bikes'], ['Cars', '/vehicles/cars'], ['Compare', '/compare'], ['Brands', '/#brands'], ['Offers', '/#offers']],
  ['Services', ['Service Enquiry', '/services'], ['Service Packages', '/services'], ['Workshop Network', '/services'], ['Service at Home', '/services']],
  ['Spare Parts', ['All Parts', '/spare-parts'], ['Engine Parts', '/spare-parts'], ['Body Parts', '/spare-parts'], ['Tyres & Wheels', '/spare-parts']],
  ['Company', ['About Us', '/pages'], ['Careers', '/pages'], ['Our Partners', '/pages'], ['Contact Us', '/contact']],
  ['Support & Legal', ['Help Center', '/contact'], ['Privacy Policy', '/legal/privacy-policy'], ['Terms & Conditions', '/legal/terms-and-conditions'], ['Cookie Policy', '/legal/cookie-policy'], ['Disclaimer', '/legal/disclaimer'], ['Refund & Cancellation', '/legal/refund-cancellation']],
]

const socialIcons = {
  facebook:<path d='M14 8h3V4h-3c-3 0-5 2-5 5v3h-3v4h3v6h4v-6h3l1-4h-4V9c0-.7.3-1 1-1Z'/>,
  instagram:<><rect x='3' y='3' width='18' height='18' rx='5'/><circle cx='12' cy='12' r='4'/><circle cx='17.5' cy='6.5' r='.8' className='social-icon-dot'/></>,
  youtube:<><rect x='2' y='5' width='20' height='14' rx='4'/><path d='m10 9 5 3-5 3Z' className='social-icon-fill'/></>,
  linkedin:<><rect x='3' y='9' width='4' height='12'/><path d='M5 6.5v.01M11 21v-7c0-3 5-3 5 0v7M11 9v12M16 12c1-4 5-3 5 1v8'/></>,
}

function SocialIcon({name}) {
  return <svg viewBox='0 0 24 24' aria-hidden='true'>{socialIcons[name]}</svg>
}

export default function PublicFooter() {
  return <footer className={`site-footer ${ui.main} bg-[#111a25] text-white`} id='contact'>
    <div className={`site-container footer-grid ${ui.container} grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-6`}>
      <div>
        <Link className='auto-logo footer-logo inline-flex max-w-[180px]' to='/' aria-label='Bright Auto Hub home'>
          <img src={whiteLogo} alt='Bright Auto Hub'/>
        </Link>
        <p className='max-w-xs text-sm leading-6 text-slate-300'>Discover the right vehicle, compare with confidence, and connect with trusted service and genuine spare-parts support—all in one dependable automotive hub.</p>
        <div className='socials mt-5 flex gap-2'>
          <a className='grid size-9 place-items-center rounded-full border border-white/20 text-slate-300 transition hover:border-red-400 hover:text-white' href='#contact' aria-label='Facebook'><SocialIcon name='facebook'/></a>
          <a className='grid size-9 place-items-center rounded-full border border-white/20 text-slate-300 transition hover:border-red-400 hover:text-white' href='#contact' aria-label='Instagram'><SocialIcon name='instagram'/></a>
          <a className='grid size-9 place-items-center rounded-full border border-white/20 text-slate-300 transition hover:border-red-400 hover:text-white' href='#contact' aria-label='YouTube'><SocialIcon name='youtube'/></a>
          <a className='grid size-9 place-items-center rounded-full border border-white/20 text-slate-300 transition hover:border-red-400 hover:text-white' href='#contact' aria-label='LinkedIn'><SocialIcon name='linkedin'/></a>
        </div>
      </div>
      {footerGroups.map(([title, ...links]) => <div className='flex flex-col items-start gap-2' key={title}>
        <h3 className='mb-2 text-xs font-bold uppercase tracking-[.12em] text-white'>{title}</h3>
        {links.map(([label, to]) => <Link className='text-sm text-slate-300 transition hover:text-white' to={to} key={label}>{label}</Link>)}
      </div>)}
    </div>
    <div className={`footer-bottom site-container ${ui.container} flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-5 text-xs text-slate-400`}>
      <span>&copy; 2026 Bright Auto Hub. All rights reserved.</span>
      <nav className='footer-legal-links flex flex-wrap gap-4' aria-label='Legal information'><Link className='transition hover:text-white' to='/legal/privacy-policy'>Privacy</Link><Link className='transition hover:text-white' to='/legal/terms-and-conditions'>Terms</Link><Link className='transition hover:text-white' to='/legal/cookie-policy'>Cookies</Link><Link className='transition hover:text-white' to='/legal/disclaimer'>Disclaimer</Link></nav>
    </div>
  </footer>
}
