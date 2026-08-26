import nodemailer from 'nodemailer'

let transporter

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])
const cleanError = (error) => String(error?.message || 'Email delivery failed').replace(/[\r\n]+/g, ' ').slice(0, 500)

const mailTransport = () => {
  if (transporter) return transporter
  if (process.env.SMTP_URL) transporter = nodemailer.createTransport(process.env.SMTP_URL)
  else if (process.env.SMTP_HOST) transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  return transporter
}

const enquiryRows = (enquiry) => [
  ['Customer', enquiry.name], ['Phone', enquiry.phone || 'Not provided'], ['Email', enquiry.email], ['Subject', enquiry.subject],
  ['Selected service / item', enquiry.itemName || 'General enquiry'], ['Category', enquiry.category || 'Not selected'],
  ['Location', enquiry.location || 'Not selected'], ['Source', enquiry.source || 'website'], ['Submitted from', enquiry.pageTitle || enquiry.pageUrl || 'Website'],
]

export const sendEnquiryEmails = async (enquiry) => {
  const mailer = mailTransport()
  const recipient = process.env.ENQUIRY_NOTIFICATION_EMAIL || process.env.SMTP_TO || process.env.SMTP_USER
  if (!mailer || !recipient) return { status: 'skipped', error: 'SMTP is not configured.' }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'Bright Auto Hub <no-reply@brightautohub.com>'
  const rows = enquiryRows(enquiry)
  const text = `${rows.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\nMessage:\n${enquiry.message}\n\nAutomatic context:\n${enquiry.context || 'None'}`
  const htmlRows = rows.map(([label, value]) => `<tr><td style="padding:7px 12px;color:#69727e;border-bottom:1px solid #eceff2">${escapeHtml(label)}</td><td style="padding:7px 12px;font-weight:700;border-bottom:1px solid #eceff2">${escapeHtml(value)}</td></tr>`).join('')
  try {
    const notification = await mailer.sendMail({
      from,
      to: recipient,
      replyTo: enquiry.email,
      subject: `New enquiry: ${enquiry.itemName || enquiry.subject}`,
      text,
      html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#17202a"><div style="background:#151d29;padding:22px;color:white"><small style="color:#ff6874">BRIGHT AUTO HUB</small><h1 style="font-size:24px;margin:7px 0 0">New website enquiry</h1></div><table style="width:100%;border-collapse:collapse;background:#fff">${htmlRows}</table><div style="padding:18px;background:#f7f8fa"><h2 style="font-size:16px">Customer message</h2><p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(enquiry.message)}</p></div></div>`,
    })
    let acknowledgementSent = false
    try {
      await mailer.sendMail({
        from,
        to: enquiry.email,
        subject: `We received your ${enquiry.subject || 'enquiry'} | Bright Auto Hub`,
        text: `Hello ${enquiry.name},\n\nWe received your enquiry for ${enquiry.itemName || 'automotive assistance'}. Our team will contact you shortly.\n\nYour message:\n${enquiry.message}\n\nBright Auto Hub`,
        html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#17202a"><div style="background:#151d29;padding:22px;color:#fff"><h1 style="font-size:22px;margin:0">Enquiry received</h1></div><div style="padding:24px;border:1px solid #e4e7ea"><p>Hello <strong>${escapeHtml(enquiry.name)}</strong>,</p><p style="line-height:1.65">We received your enquiry for <strong>${escapeHtml(enquiry.itemName || 'automotive assistance')}</strong>. Our team will contact you shortly.</p><p style="padding:14px;background:#f7f8fa;white-space:pre-wrap">${escapeHtml(enquiry.message)}</p><p>Bright Auto Hub</p></div></div>`,
      })
      acknowledgementSent = true
    } catch (error) { console.error('Unable to send enquiry acknowledgement:', cleanError(error)) }
    return { status: 'sent', notifiedAt: new Date(), messageId: notification.messageId || '', acknowledgementSent }
  } catch (error) {
    console.error('Unable to send enquiry notification:', cleanError(error))
    return { status: 'failed', error: cleanError(error) }
  }
}
