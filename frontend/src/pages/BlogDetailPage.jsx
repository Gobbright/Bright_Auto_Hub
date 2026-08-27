import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { BlogSidebarAdvertisement, MarketplaceShell } from './MarketplacePage.jsx'
import './blog-editorial.css'

const formatDate = (value) => {
  if (!value) return 'Editorial guide'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Editorial guide' : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export default function BlogDetailPage({ data, slug, heroImage }) {
  const tag = data.tags?.[0] || 'AUTOMOTIVE NEWS'
  const author = data.author || 'Bright Auto Hub Editorial'
  const dateLabel = formatDate(data.publishedAt || data.createdAt)
  const readingTime = Math.max(1, Number(data.readingTime) || 5)
  const related = (data.relatedPosts || []).filter((story) => story.slug !== slug).slice(0, 8)
  const visuals = Array.isArray(data.galleryImages) ? data.galleryImages : []
  const articleHtml = data.content || '<p>' + (data.excerpt || 'Practical automotive guidance from Bright Auto Hub.') + '</p>'
  const enquiryUrl = '/contact?' + new URLSearchParams({ subject: 'Vehicle enquiry', item: data.title, source: 'blog', page: typeof window === 'undefined' ? '' : window.location.pathname }).toString()
  const shareUrl = typeof window === 'undefined' ? '' : window.location.href
  const relatedRef = useRef(null)
  const scrollRelated = () => relatedRef.current?.scrollBy({ left: 380, behavior: 'smooth' })
  const takeaways = [
    'Understand the key points before making a vehicle decision.',
    'Compare practical ownership factors, not just headline features.',
    'Use expert guidance when your requirement needs a closer fitment check.',
  ]
  const faqItems = [
    ['What is this automotive guide about?', 'This guide explains the important context behind ' + data.title + ' in a clear, practical format.'],
    ['Who should read this article?', 'It is useful for vehicle buyers, owners and anyone comparing the next step for their journey.'],
    ['Can Bright Auto Hub help with my requirement?', 'Yes. Share your vehicle, service or spare-parts requirement and our team can guide you with the next steps.'],
  ]
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Article', headline: data.title, description: data.excerpt, image: heroImage ? [heroImage] : undefined, author: { '@type': 'Person', name: author }, publisher: { '@type': 'Organization', name: 'Bright Auto Hub' }, datePublished: data.publishedAt || data.createdAt, dateModified: data.updatedAt || data.publishedAt || data.createdAt, mainEntityOfPage: shareUrl || undefined },
      { '@type': 'FAQPage', mainEntity: faqItems.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
    ],
  }

  return <MarketplaceShell>
    <main className='blog-single-page min-h-screen overflow-hidden bg-[#f6f3ee] text-[#18202d]'>
      <script type='application/ld+json'>{JSON.stringify(structuredData)}</script>

      <header className='relative'>
        <div className='mx-auto w-full max-w-[1240px] px-[18px] pb-8 pt-[clamp(24px,4vw,54px)]'>
          <nav className='mb-8 flex items-center gap-2 overflow-hidden whitespace-nowrap text-[10px] font-semibold text-slate-500' aria-label='Breadcrumb'><Link className='transition hover:text-[#e5091a]' to='/'>Home</Link><span>/</span><Link className='transition hover:text-[#e5091a]' to='/blog'>News</Link><span>/</span><b className='truncate text-[#e5091a]'>{tag}</b></nav>
          <div className='grid gap-8 lg:grid-cols-[1fr_330px] lg:items-end'>
            <div><span className='inline-flex rounded-full bg-[#e5091a] px-3 py-1.5 text-[9px] font-black tracking-[.17em] text-white'>{tag}</span><h1 className='mt-5 max-w-[900px] text-[clamp(40px,6.4vw,88px)] font-bold leading-[.94] tracking-[-.075em] text-[#121a27]'>{data.title}</h1><p className='mt-6 max-w-[760px] text-[clamp(15px,1.3vw,19px)] leading-8 text-slate-600'>{data.excerpt}</p></div>
            <div className='border-l-2 border-[#e5091a] pl-5 lg:mb-2'><small className='text-[9px] font-black tracking-[.15em] text-[#e5091a]'>A PRACTICAL BRIGHT AUTO HUB GUIDE</small><p className='mt-2 text-sm leading-6 text-slate-600'>Useful context, simple explanations and clear next steps for better automotive decisions.</p></div>
          </div>
          <div className='mt-8 flex flex-wrap items-center gap-3 border-y border-[#ddd8d0] py-4'><span className='grid size-10 place-items-center rounded-full bg-[#18202d] text-sm font-black text-white'>{author.charAt(0).toUpperCase()}</span><div className='grid gap-0.5'><strong className='text-xs'>{author}</strong><span className='text-[10px] text-slate-500'>{dateLabel} · {readingTime} min read</span></div><span className='ml-auto rounded-full border border-[#d8d1c8] bg-white/60 px-3 py-2 text-[10px] font-semibold text-slate-600'>Updated for informed journeys</span></div>
        </div>
        <figure className='mx-auto mb-[-42px] h-[clamp(270px,43vw,590px)] w-[min(1320px,calc(100%-36px))] overflow-hidden rounded-[28px] bg-slate-200 shadow-[0_22px_55px_rgba(50,42,35,.16)]'><img className='h-full w-full object-cover' src={heroImage} alt={data.imageAlt || data.title || 'Bright Auto Hub automotive article'} /><figcaption className='absolute sr-only'>Featured image for {data.title}</figcaption></figure>
      </header>

      <section className='relative z-10 mx-auto mt-[84px] grid w-[min(1180px,calc(100%-36px))] grid-cols-3 overflow-hidden rounded-2xl border border-[#e2ddd5] bg-white shadow-[0_12px_35px_rgba(50,42,35,.08)] max-sm:grid-cols-1' aria-label='Article overview'><div className='p-5 max-sm:border-b max-sm:border-[#eee9e2]'><small className='text-[9px] font-black tracking-[.14em] text-[#e5091a]'>TOPIC</small><strong className='mt-1 block text-sm'>{tag}</strong></div><div className='border-x border-[#eee9e2] p-5 max-sm:border-x-0 max-sm:border-b'><small className='text-[9px] font-black tracking-[.14em] text-[#e5091a]'>READING TIME</small><strong className='mt-1 block text-sm'>{readingTime} minutes</strong></div><div className='p-5'><small className='text-[9px] font-black tracking-[.14em] text-[#e5091a]'>ARTICLE FORMAT</small><strong className='mt-1 block text-sm'>Expert guide</strong></div></section>

      <section className='mx-auto grid w-full max-w-[1180px] gap-8 px-[18px] py-[clamp(45px,7vw,94px)] lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start'>
        <aside className='grid gap-4 lg:sticky lg:top-6'><BlogSidebarAdvertisement className='blog-single-sidebar-ad'/><div className='rounded-2xl border border-[#e2ddd5] bg-white p-5'><small className='text-[9px] font-black tracking-[.14em] text-[#e5091a]'>IN THIS GUIDE</small><nav className='mt-4 grid gap-1 text-[11px] font-semibold text-slate-600'><a className='border-l-2 border-[#e5091a] py-2 pl-3 text-[#e5091a]' href='#key-takeaways'>Key takeaways</a><a className='border-l-2 border-transparent py-2 pl-3 transition hover:border-[#e5091a] hover:text-[#e5091a]' href='#article-content'>Full article</a><a className='border-l-2 border-transparent py-2 pl-3 transition hover:border-[#e5091a] hover:text-[#e5091a]' href='#common-questions'>Common questions</a><a className='border-l-2 border-transparent py-2 pl-3 transition hover:border-[#e5091a] hover:text-[#e5091a]' href='#related-stories'>Related stories</a></nav></div><div className='rounded-2xl bg-[#e5091a] p-5 text-white'><small className='text-[9px] font-black tracking-[.14em] text-red-100'>NEED PERSONAL HELP?</small><h2 className='mb-2 mt-2 text-xl font-bold leading-tight'>Talk to our experts.</h2><p className='text-[11px] leading-5 text-red-100'>Share your vehicle or service requirement and get a clear callback.</p><Link className='mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2.5 text-[10px] font-extrabold text-[#d7081b] transition hover:bg-red-50' to={enquiryUrl}>Send an enquiry →</Link></div></aside>

        <article className='min-w-0'>
          <section id='key-takeaways' className='rounded-[22px] border border-[#e2ddd5] bg-[#fffaf4] p-[clamp(22px,4vw,40px)]'><small className='text-[10px] font-black tracking-[.14em] text-[#e5091a]'>AT A GLANCE</small><h2 className='mb-5 mt-2 text-[clamp(26px,3vw,38px)] font-bold tracking-[-.05em]'>What you will learn from this guide</h2><div className='grid gap-3 md:grid-cols-3'>{takeaways.map((item, index) => <div className='rounded-xl border border-[#eee2d4] bg-white p-4' key={item}><span className='text-2xl font-black text-[#e5091a]'>0{index + 1}</span><p className='mt-2 text-xs leading-5 text-slate-600'>{item}</p></div>)}</div></section>
          <section id='article-content' className='mt-7 rounded-[22px] border border-[#e2ddd5] bg-white p-[clamp(24px,5vw,58px)] shadow-[0_12px_35px_rgba(50,42,35,.055)]'><p className='mb-9 border-l-[3px] border-[#e5091a] pl-5 text-[clamp(18px,1.55vw,24px)] font-semibold leading-[1.6] text-[#253142]'>{data.excerpt}</p><div className='blog-rich-text' dangerouslySetInnerHTML={{ __html: articleHtml }} />{visuals.length > 0 && <section className='mt-12 border-t border-[#eee9e2] pt-8'><small className='text-[10px] font-black tracking-[.14em] text-[#e5091a]'>VISUAL NOTES</small><h2 className='mb-5 mt-2 text-[clamp(24px,2.5vw,34px)] font-bold tracking-[-.04em]'>More from the automotive world</h2><div className='grid gap-3 sm:grid-cols-2'>{visuals.map((visual, index) => <figure className={index === 0 ? 'm-0 overflow-hidden rounded-2xl border border-[#e2ddd5] sm:col-span-2' : 'm-0 overflow-hidden rounded-2xl border border-[#e2ddd5]'} key={visual.url + '-' + index}><img className={index === 0 ? 'h-[300px] w-full object-cover max-sm:h-[210px]' : 'h-[210px] w-full object-cover'} src={visual.url} alt={visual.alt || data.title + ' image ' + (index + 1)} loading='lazy' /><figcaption className='px-3 py-3 text-xs text-slate-600'><b className='mr-2 text-[#e5091a]'>{String(index + 1).padStart(2, '0')}</b>{visual.alt || data.title}</figcaption></figure>)}</div></section>}</section>

          <section className='mt-7 rounded-[22px] border border-[#e2ddd5] bg-white p-[clamp(24px,5vw,58px)]'><small className='text-[10px] font-black tracking-[.14em] text-[#e5091a]'>WHY IT MATTERS</small><h2 className='mb-3 mt-2 text-[clamp(25px,3vw,38px)] font-bold tracking-[-.05em]'>Make the next step with better context.</h2><p className='max-w-[720px] text-sm leading-7 text-slate-600'>Automotive decisions become easier when the details are organised around real ownership needs. Use the information in this article as a starting point, then check the right vehicle, service or genuine spare part for your specific requirement.</p><div className='mt-6 grid gap-3 sm:grid-cols-2'><div className='rounded-xl bg-[#f6f3ee] p-4'><strong className='text-sm'>Before you decide</strong><p className='mt-1 text-xs leading-5 text-slate-600'>Check fitment, running needs, budget and support availability.</p></div><div className='rounded-xl bg-[#f6f3ee] p-4'><strong className='text-sm'>When you need help</strong><p className='mt-1 text-xs leading-5 text-slate-600'>Share your model, city and requirement with our support team.</p></div></div></section>

          <section id='common-questions' className='mt-7 rounded-[22px] border border-[#e2ddd5] bg-white p-[clamp(24px,5vw,58px)]'><small className='text-[10px] font-black tracking-[.14em] text-[#e5091a]'>COMMON QUESTIONS</small><h2 className='mb-5 mt-2 text-[clamp(25px,3vw,38px)] font-bold tracking-[-.05em]'>Quick answers before you continue</h2><div className='grid gap-2'>{faqItems.map(([question, answer]) => <details className='group rounded-xl border border-[#eee9e2] bg-[#fffdf9] px-4 py-3' key={question}><summary className='flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#1d2734]'><span>{question}</span><b className='text-xl font-normal text-[#e5091a] transition group-open:rotate-45'>+</b></summary><p className='m-0 pt-3 text-xs leading-6 text-slate-600'>{answer}</p></details>)}</div></section>
        </article>
      </section>

      {related.length > 0 && <section id='related-stories' className='border-y border-[#e2ddd5] bg-[#fffdf9] py-[clamp(42px,6vw,78px)]'><div className='mx-auto w-full max-w-[1180px] px-[18px]'><header className='mb-6 flex items-end justify-between gap-4'><div><small className='text-[10px] font-black tracking-[.14em] text-[#e5091a]'>KEEP READING</small><h2 className='mb-0 mt-1 text-[clamp(27px,3vw,38px)] font-bold tracking-[-.05em]'>Related stories</h2></div><div className='flex items-center gap-3'><Link className='text-[11px] font-bold text-[#e5091a]' to='/blog'>View all articles →</Link><button className='grid size-9 place-items-center rounded-full border border-[#d8d1c8] bg-white text-lg text-slate-700 shadow-sm transition hover:border-[#e5091a] hover:bg-[#e5091a] hover:text-white' type='button' onClick={scrollRelated} aria-label='Scroll related stories right'>→</button></div></header><div className='flex snap-x gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-color:#d8dde3_transparent] [scrollbar-width:thin]' ref={relatedRef}>{related.map((story) => <article className='w-[min(350px,calc(84vw-18px))] min-w-[min(350px,calc(84vw-18px))] snap-start overflow-hidden rounded-2xl border border-[#e2ddd5] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl' key={story.slug}><Link className='block h-[190px] overflow-hidden bg-slate-100' to={'/blog/' + story.slug}><img className='h-full w-full object-cover transition duration-500 hover:scale-105' src={story.imageUrl || heroImage} alt={story.imageAlt || story.title} /></Link><div className='p-4'><small className='text-[9px] font-black tracking-[.12em] text-[#e5091a]'>{story.tags?.[0] || 'AUTOMOTIVE'}</small><h3 className='mb-2 mt-2 text-base font-bold leading-tight text-[#1c2633]'><Link to={'/blog/' + story.slug}>{story.title}</Link></h3><p className='mb-3 text-[11px] leading-5 text-slate-500'>{story.excerpt}</p><Link className='text-[10px] font-extrabold text-[#e5091a]' to={'/blog/' + story.slug}>Read article →</Link></div></article>)}</div></div></section>}

    </main>
  </MarketplaceShell>
}
