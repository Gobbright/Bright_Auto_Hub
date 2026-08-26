import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api.js'
import './enquiry-modal.css'
import { ui } from '../lib/uiClasses.js'

const readStored = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || null } catch { return null }
}

const enquiryParams = ['subject', 'item', 'source', 'category']

export default function EnquiryModal() {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [notice, setNotice] = useState('')
  const [context, setContext] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: '', message: '' })
  const firstInputRef = useRef(null)

  useEffect(() => {
    const openFromUrl = (url) => {
      const profile = readStored('publicUserProfile') || {}
      const subject = url.searchParams.get('subject') || 'General enquiry'
      const source = url.searchParams.get('source') || 'website'
      const category = url.searchParams.get('category') || ''
      const service = url.searchParams.get('item') || subject
      const location = readStored('selectedLocation') || { label: 'All India', shortLabel: 'All India' }
      setContext({ subject, source, category, service, location, pageUrl: window.location.href, pageTitle: document.title })
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        service,
        message: service ? `I would like more information about ${service}.` : '',
      })
      setNotice('')
      setSuccess(false)
      setOpen(true)
    }

    const interceptEnquiryLink = (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = event.target.closest?.('a[href]')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href, window.location.origin)
      if (url.origin !== window.location.origin || url.pathname !== '/contact') return
      if (!enquiryParams.some((key) => url.searchParams.has(key))) return
      event.preventDefault()
      openFromUrl(url)
    }

    const openFromEvent = (event) => {
      const params = new URLSearchParams(event.detail || {})
      openFromUrl(new URL(`/contact?${params}`, window.location.origin))
    }

    document.addEventListener('click', interceptEnquiryLink, true)
    window.addEventListener('open-enquiry-modal', openFromEvent)
    return () => {
      document.removeEventListener('click', interceptEnquiryLink, true)
      window.removeEventListener('open-enquiry-modal', openFromEvent)
    }
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => { if (event.key === 'Escape' && !sending) setOpen(false) }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    const focusTimer = window.setTimeout(() => firstInputRef.current?.focus(), 80)
    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open, sending])

  const close = () => { if (!sending) setOpen(false) }
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setSending(true)
    setNotice('')
    setSuccess(false)
    try {
      const profile = readStored('publicUserProfile') || {}
      const selectedLocation = context?.location || { label: 'All India' }
      const result = await api.post('/public/enquiries', {
        name: form.name,
        phone: form.phone,
        email: form.email,
        subject: context?.subject || 'General enquiry',
        message: form.message,
        source: context?.source || 'website',
        itemName: form.service,
        category: context?.category || '',
        enquiryType: context?.source || 'website',
        pageUrl: context?.pageUrl || window.location.href,
        pageTitle: context?.pageTitle || document.title,
        location: selectedLocation.label || selectedLocation.shortLabel || 'All India',
        coordinates: { lat: selectedLocation.lat, lon: selectedLocation.lon },
        accountId: profile.id,
        accountEmail: profile.email,
        context: [`Selected service / item: ${form.service}`, context?.category && `Category: ${context.category}`, `Source: ${context?.source || 'website'}`, `Submitted from: ${context?.pageUrl || window.location.href}`].filter(Boolean).join('\n'),
      })
      setNotice(result.message || 'Your enquiry has been submitted successfully.')
      setSuccess(true)
    } catch (error) {
      setNotice(error.message || 'Unable to submit your enquiry. Please try again.')
    } finally { setSending(false) }
  }

  if (!open) return null
  const isService = /service|workshop|maintenance|repair/i.test(`${context?.subject || ''} ${context?.source || ''}`)
  return <div className='enquiry-modal-backdrop fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-slate-950/55 p-5 backdrop-blur-[10px]' role='presentation' onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
    <section className='enquiry-modal relative grid w-full max-w-[820px] overflow-hidden rounded-[20px] border border-white/50 bg-white/95 shadow-[0_28px_90px_rgba(5,12,22,.3)] backdrop-blur-[22px] max-md:grid-cols-1' role='dialog' aria-modal='true' aria-labelledby='enquiry-modal-title'>
      <button className='enquiry-modal-close absolute right-3.5 top-3.5 z-10 grid size-[34px] place-items-center rounded-full border border-slate-200 bg-white/90 text-2xl leading-none text-slate-700 transition hover:rotate-6 hover:border-[#e5091a] hover:text-[#e5091a]' type='button' aria-label='Close enquiry form' onClick={close}>×</button>
      <div className='enquiry-modal-intro relative flex min-h-[520px] flex-col justify-center overflow-hidden bg-gradient-to-br from-[#0f1825]/95 to-[#1c2a3a]/95 p-[42px] text-white max-md:min-h-auto max-md:p-7'><small className='relative z-[1] text-[9px] font-black tracking-[.16em] text-[#ff6974]'>QUICK ENQUIRY</small><h2 className='relative z-[1] mb-3 mt-2 text-[34px] leading-none tracking-[-1.2px] max-md:text-[28px]' id='enquiry-modal-title'>Tell us what you need.</h2><p className='relative z-[1] m-0 text-xs leading-7 text-slate-300'>Your selected {isService ? 'service' : 'item'} is already filled. Submit your details and our team will contact you.</p><span className='relative z-[1] mt-6 rounded-[10px] border border-white/20 bg-white/10 p-3 text-[11px] font-extrabold'>{context?.service}</span></div>
      {success ? <div className='enquiry-modal-success flex min-h-[520px] flex-col items-center justify-center p-11 text-center max-md:min-h-[360px]' role='status'><b className='grid size-[62px] place-items-center rounded-full bg-emerald-50 text-[26px] text-emerald-600'>✓</b><h3 className='mb-2 mt-4 text-[25px]'>Enquiry submitted</h3><p className='m-0 text-xs leading-6 text-slate-500'>{notice}</p><small className='mt-2 text-[9px] text-slate-400'>Reference saved in the admin enquiry inbox.</small><button className={`${ui.primaryButton} mt-6 min-w-[130px]`} type='button' onClick={close}>Close</button></div> : <form className='enquiry-modal-form grid grid-cols-2 content-center gap-[13px] p-[45px] max-md:p-7 max-sm:grid-cols-1' onSubmit={submit}>
        <label className='grid gap-1.5 text-[10px] font-extrabold text-slate-600 max-sm:col-span-1'>Full name<input className={ui.field} ref={firstInputRef} name='name' value={form.name} onChange={update} autoComplete='name' placeholder='Enter your name' required/></label>
        <label className='grid gap-1.5 text-[10px] font-extrabold text-slate-600 max-sm:col-span-1'>Mobile number<input className={ui.field} name='phone' value={form.phone} onChange={update} autoComplete='tel' inputMode='tel' placeholder='Enter your mobile number' required/></label>
        <label className='wide grid gap-1.5 text-[10px] font-extrabold text-slate-600'>Email address<input className={ui.field} name='email' type='email' value={form.email} onChange={update} autoComplete='email' placeholder='Enter your email address' required/></label>
        <label className='wide grid gap-1.5 text-[10px] font-extrabold text-slate-600'>Selected {isService ? 'service' : 'item / requirement'}<input className='selected-service w-full rounded-[9px] border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-extrabold text-red-700 outline-none' name='service' value={form.service} onChange={update} readOnly/></label>
        <label className='wide grid gap-1.5 text-[10px] font-extrabold text-slate-600'>Message<textarea className={ui.field} name='message' value={form.message} onChange={update} rows='4' placeholder='Add vehicle model, location or any other requirement...' required/></label>
        <div className='enquiry-modal-meta'><span>🔒 Your details are used only to handle this enquiry.</span><span>{context?.location?.shortLabel || context?.location?.label || 'All India'}</span></div>
        <button className={`enquiry-modal-submit wide ${ui.primaryButton} min-h-[45px]`} type='submit' disabled={sending}>{sending ? 'Submitting enquiry...' : 'Submit Enquiry'}</button>
        {notice && <p className='enquiry-modal-notice wide' role='alert'>{notice}</p>}
      </form>}
    </section>
  </div>
}
