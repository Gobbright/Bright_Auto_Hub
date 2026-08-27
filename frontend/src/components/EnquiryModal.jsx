import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api.js'
import './enquiry-modal.css'

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
        message: service ? `Please send me the latest price and availability for ${service}.` : '',
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
        context: [`Selected service / item: ${form.service}`, 'Price request: Price on enquiry', context?.category && `Category: ${context.category}`, `Source: ${context?.source || 'website'}`, `Submitted from: ${context?.pageUrl || window.location.href}`].filter(Boolean).join('\n'),
      })
      setNotice((result.message || 'Your enquiry has been submitted successfully.') + ' Price details will be sent by our team shortly.')
      setSuccess(true)
    } catch (error) {
      setNotice(error.message || 'Unable to submit your enquiry. Please try again.')
    } finally { setSending(false) }
  }

  if (!open) return null
  const isService = /service|workshop|maintenance|repair/i.test(`${context?.subject || ''} ${context?.source || ''}`)
  return <div className='enquiry-modal-backdrop' role='presentation' onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
    <section className='enquiry-modal' role='dialog' aria-modal='true' aria-labelledby='enquiry-modal-title'>
      <button className='enquiry-modal-close' type='button' aria-label='Close enquiry form' onClick={close}>×</button>
      <div className='enquiry-modal-intro'>
        <small>QUICK ENQUIRY</small>
        <h2 id='enquiry-modal-title'>Tell us what you need.</h2>
        <p>Your selected {isService ? 'service' : 'item'} is already filled. Submit your details and our team will contact you.</p>
        <span>{context?.service}</span>
      </div>
      {success ? <div className='enquiry-modal-success' role='status'>
        <b>✓</b>
        <h3>Enquiry submitted</h3>
        <p>{notice}</p>
        <small>Reference saved in the admin enquiry inbox.</small>
        <button type='button' onClick={close}>Close</button>
      </div> : <form className='enquiry-modal-form' onSubmit={submit}>
        <label>Full name<input ref={firstInputRef} name='name' value={form.name} onChange={update} autoComplete='name' placeholder='Enter your name' required/></label>
        <label>Mobile number<input name='phone' value={form.phone} onChange={update} autoComplete='tel' inputMode='tel' placeholder='Enter your mobile number' required/></label>
        <label className='wide'>Email address<input name='email' type='email' value={form.email} onChange={update} autoComplete='email' placeholder='Enter your email address' required/></label>
        <label className='wide'>Selected {isService ? 'service' : 'item / requirement'}<input className='selected-service' name='service' value={form.service} onChange={update} readOnly/></label>
        <label className='wide'>Message<textarea name='message' value={form.message} onChange={update} rows='4' placeholder='Add vehicle model, location or any other requirement...' required/></label>
        <div className='enquiry-modal-meta'><span>Your details are used only to handle this enquiry.</span><span>{context?.location?.shortLabel || context?.location?.label || 'All India'}</span></div>
        <button className='enquiry-modal-submit' type='submit' disabled={sending}>{sending ? 'Submitting enquiry...' : 'Submit Enquiry'}</button>
        {notice && <p className='enquiry-modal-notice' role='alert'>{notice}</p>}
      </form>}
    </section>
  </div>
}
