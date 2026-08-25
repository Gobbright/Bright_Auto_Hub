import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MarketplaceShell } from './MarketplacePage.jsx'
import legalHeroImage from '../assets/Images/contact us/contact-us-white-sports-car-banner.png'
import './legal-page.css'

const policies = {
  'privacy-policy': {
    title: 'Privacy Policy',
    summary: 'How Bright Auto Hub collects, uses and protects information shared through our automobile enquiry platform.',
    sections: [
      ['Information we collect', 'We may collect your name, email address, phone number, selected location, vehicle or service requirement, enquiry details, and basic browser or device information when you use our website.'],
      ['How we use information', 'We use this information to respond to enquiries, provide vehicle, spare-parts, service, finance or insurance assistance, improve the website, prevent misuse and maintain service records.'],
      ['Location information', 'Location is collected only when you select a place or permit live-location access. You can deny browser permission or reset the selected location at any time.'],
      ['Sharing and disclosure', 'We may share relevant enquiry details with authorised staff or suitable service partners only to handle your request. We do not sell your personal information.'],
      ['Data security and retention', 'We use reasonable technical and organisational safeguards. Information is retained only for legitimate operational, support, legal and security needs.'],
      ['Your choices', 'You may request access, correction or deletion of your personal information by contacting our support team, subject to applicable legal and record-retention obligations.'],
    ],
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    summary: 'The rules governing access to Bright Auto Hub and the submission of automobile-related enquiries.',
    sections: [
      ['Platform purpose', 'Bright Auto Hub is an enquiry and information platform. It does not provide an ecommerce checkout and does not itself complete a vehicle, part, service, loan or insurance transaction online.'],
      ['Information accuracy', 'Vehicle specifications, prices, availability, service packages and other content may change. Confirm final details with the responsible provider before making a decision.'],
      ['User responsibilities', 'You agree to provide accurate contact and requirement information, use the website lawfully, and avoid submitting misleading, abusive or unauthorised content.'],
      ['Third-party services', 'Dealers, workshops, lenders, insurers and other providers may apply their own eligibility rules, documents, pricing, terms and privacy practices.'],
      ['Intellectual property', 'Website design, branding, text and original content belong to Bright Auto Hub or their respective owners and may not be reproduced without permission.'],
      ['Changes to these terms', 'We may update these terms when our services or legal obligations change. Continued use after publication means the latest terms apply.'],
    ],
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    summary: 'Information about browser storage and similar technology used by Bright Auto Hub.',
    sections: [
      ['What we store', 'The website may use local browser storage and essential cookies to remember selected location, account session preferences and website functionality.'],
      ['Essential technology', 'Some storage is required for login state, navigation and security. Disabling it may prevent parts of the website from working correctly.'],
      ['Analytics and improvements', 'If analytics tools are enabled, aggregated usage information may help us understand performance and improve the visitor experience.'],
      ['Managing preferences', 'You can remove stored website data through your browser settings. Location permissions can also be controlled from the browser site-permission menu.'],
    ],
  },
  disclaimer: {
    title: 'Disclaimer',
    summary: 'Important limitations concerning automobile, finance, insurance and service information.',
    sections: [
      ['General information', 'Content is provided for general information and enquiry assistance. It is not professional financial, insurance, legal or mechanical advice.'],
      ['Prices and availability', 'Displayed prices, offers, inventory, interest rates, premiums and service availability are indicative and may differ by provider, location, eligibility and date.'],
      ['Finance and insurance', 'Approval, interest rate, tenure, coverage and premium decisions are made by the relevant lender or insurer after verification and assessment.'],
      ['External providers', 'Bright Auto Hub is not responsible for independent third-party websites, representations, service quality or contractual obligations.'],
    ],
  },
  'refund-cancellation': {
    title: 'Refund & Cancellation Policy',
    summary: 'How cancellation and refund questions are handled for an enquiry-based automobile platform.',
    sections: [
      ['Enquiry submissions', 'Sending an enquiry through Bright Auto Hub is free and does not create an online purchase, so there is normally no website payment to refund.'],
      ['Provider payments', 'Any booking amount or payment made directly to a dealer, workshop, insurer, lender or other provider is governed by that provider’s cancellation and refund terms.'],
      ['Cancel an enquiry', 'You may ask us to close or stop processing an enquiry by contacting support with your name, phone number and enquiry reference.'],
      ['Incorrect or duplicate requests', 'Contact us promptly if an enquiry was submitted accidentally or more than once. Our team will mark the duplicate or incorrect request accordingly.'],
    ],
  },
}

export default function LegalPage() {
  const { slug } = useParams()
  const policy = policies[slug] || policies['terms-and-conditions']
  useEffect(() => {
    document.title = `${policy.title} | Bright Auto Hub`
    document.querySelector('meta[name="description"]')?.setAttribute('content', policy.summary)
  }, [policy])

  return <MarketplaceShell>
    <main className='legal-page'>
      <section className='legal-hero'>
        <img src={legalHeroImage} alt='Bright Auto Hub automobile support' />
      </section>
      <section className='market-wrap legal-heading'>
        <p>BRIGHT AUTO HUB · LEGAL</p>
        <h1>{policy.title}</h1>
        <span>{policy.summary}</span>
        <small>Last updated: 25 August 2026</small>
      </section>
      <section className='market-wrap legal-layout'>
        <aside><strong>Legal information</strong>{Object.entries(policies).map(([key,item])=><Link className={key===slug?'active':''} to={`/legal/${key}`} key={key}>{item.title}</Link>)}<Link to='/contact'>Contact support</Link></aside>
        <article><div className='legal-intro'><strong>Please read this information carefully.</strong><p>These policies explain how our enquiry platform operates and what you can expect when using it.</p></div>{policy.sections.map(([title,body],index)=><section key={title}><span>{String(index+1).padStart(2,'0')}</span><div><h2>{title}</h2><p>{body}</p></div></section>)}<div className='legal-contact'><h2>Questions about this policy?</h2><p>Email <a href='mailto:support@brightautohub.com'>support@brightautohub.com</a> or send an enquiry through our contact page.</p><Link to='/contact'>Contact Bright Auto Hub</Link></div></article>
      </section>
    </main>
  </MarketplaceShell>
}
