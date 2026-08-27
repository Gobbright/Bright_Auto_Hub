import { Link } from 'react-router-dom'
import whiteLogo from '../assets/Images/Home/Banners/Logo/Logo-White.png'
import supportMascot from '../assets/Images/FOOTER TOP IMG.png'
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
  return <>
    <section className='mx-auto mt-7 mb-7 grid min-h-[136px] w-[min(1180px,calc(100%-44px))] grid-cols-[minmax(230px,1.25fr)_minmax(180px,.9fr)_minmax(210px,1fr)_minmax(190px,.8fr)] items-center gap-6 overflow-hidden rounded-lg border border-red-100 bg-red-50/70 px-[38px] text-slate-950 max-[980px]:grid-cols-[minmax(230px,1fr)_180px_minmax(210px,1fr)] max-[980px]:gap-[18px] max-[980px]:px-[26px] max-[700px]:mt-[22px] max-[700px]:mb-[22px] max-[700px]:min-h-0 max-[700px]:w-[calc(100%-24px)] max-[700px]:grid-cols-[minmax(0,1fr)_130px] max-[700px]:gap-[18px] max-[700px]:p-[22px] max-[480px]:grid-cols-1' aria-labelledby='footer-help-title'>
      <div>
        <h2 className='max-w-[280px] text-2xl font-extrabold leading-[1.18] max-[700px]:text-[21px] max-[480px]:max-w-none' id='footer-help-title'>Need Help Finding the Right Used Car?</h2>
        <p className='mt-3 max-w-[270px] text-sm leading-6 text-slate-600 max-[700px]:text-[13px] max-[480px]:max-w-none'>Our experts are here to help you choose the perfect car.</p>
      </div>
      <div className='flex h-full items-end justify-center overflow-hidden max-[700px]:self-end max-[480px]:h-[150px]' aria-hidden='true'>
        <img className='block w-[210px] max-w-none translate-y-2 max-[700px]:w-[145px] max-[700px]:translate-y-[22px] max-[480px]:w-[185px]' src={supportMascot} alt='' loading='lazy' decoding='async'/>
      </div>
      <div className='flex flex-col items-start max-[980px]:col-start-3 max-[980px]:row-start-1 max-[980px]:self-start max-[980px]:mt-[18px] max-[700px]:col-start-1 max-[700px]:row-start-2 max-[700px]:mt-0 max-[480px]:col-start-1 max-[480px]:row-start-3'>
        <span className='text-[13px] font-bold'>Talk to Our Experts</span>
        <a className='mt-2.5 text-xl font-extrabold leading-none max-[980px]:mt-1.5' href='tel:+919876543210'>+91 98765 43210</a>
        <small className='mt-2 text-xs font-medium text-slate-600 max-[980px]:mt-1.5'>Mon - Sun (9:00 AM - 9:00 PM)</small>
      </div>
      <Link className='flex min-h-[50px] w-full items-center justify-between gap-5 rounded-md bg-[#ee0718] px-[22px] text-sm font-extrabold !text-white transition hover:-translate-y-0.5 hover:bg-[#d90011] max-[980px]:col-start-3 max-[980px]:row-start-1 max-[980px]:self-end max-[980px]:mb-3 max-[980px]:min-h-[42px] max-[700px]:col-start-2 max-[700px]:row-start-2 max-[700px]:self-center max-[700px]:mb-0 max-[700px]:px-3.5 max-[700px]:text-xs max-[480px]:col-start-1 max-[480px]:row-start-4 max-[480px]:mt-1 max-[480px]:text-sm' to='/contact'>Get Expert Help <span className='text-[22px] font-normal' aria-hidden='true'>&rarr;</span></Link>
    </section>
    <footer className={`site-footer ${ui.main} bg-[#111a25] text-white`} id='contact'>
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
  </>
}
