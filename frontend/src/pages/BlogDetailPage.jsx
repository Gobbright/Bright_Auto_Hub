import { Link } from 'react-router-dom'
import { blogDetailVisuals, blogStories } from '../data/visualContent.js'
import { MarketplaceShell } from './MarketplacePage.jsx'
import './blog-editorial.css'

export default function BlogDetailPage({data,slug,heroImage}) {
  const tag=data.tags?.[0]||data.tag||'AUTOMOTIVE JOURNAL'
  const author=data.author||'Bright Auto Hub Editorial'
  const published=data.publishedAt||data.createdAt
  const parsedDate=published?new Date(published):null
  const dateLabel=parsedDate&&!Number.isNaN(parsedDate.getTime())?new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'long',year:'numeric'}).format(parsedDate):'Editorial guide'
  const related=blogStories.filter((story)=>story.slug!==slug).slice(0,3)
  const articleHtml=data.content||`<p>${data.excerpt||data.summary||'Practical automotive guidance from Bright Auto Hub.'}</p>`
  const enquiryUrl='/contact?'+new URLSearchParams({subject:'Vehicle enquiry',item:data.title,source:'blog',page:typeof window==='undefined'?'':window.location.pathname}).toString()

  return <MarketplaceShell><main className='blog-article-page'>
    <header className='blog-detail-header market-wrap'>
      <nav aria-label='Breadcrumb'><Link to='/'>Home</Link><span>/</span><Link to='/blog'>Journal</Link><span>/</span><strong>{tag}</strong></nav>
      <p>{tag}</p>
      <h1>{data.title}</h1>
      <p className='blog-detail-summary'>{data.excerpt||data.summary}</p>
      <div className='blog-byline'><span className='blog-author-mark'>{author.charAt(0).toUpperCase()}</span><div><strong>{author}</strong><small>{dateLabel} · 5 min read</small></div><Link to='/blog'>All stories →</Link></div>
    </header>

    {heroImage&&<figure className='blog-detail-hero market-wrap'><img src={heroImage} alt={data.title||'Bright Auto Hub automotive article'}/><figcaption>Bright Auto Hub automotive journal</figcaption></figure>}

    <section className='blog-reading-layout market-wrap'>
      <article className='blog-story-body'>
        <p className='blog-story-lead'>{data.excerpt||data.summary}</p>
        <div className='public-rich-text blog-rich-text' dangerouslySetInnerHTML={{__html:articleHtml}}/>
        <section className='blog-visual-story'>
          <div className='blog-visual-heading'><small>ON THE ROAD</small><h2>More from the automotive world</h2><p>Vehicles, maintenance and ownership—seen from every angle.</p></div>
          <div>{blogDetailVisuals.slice(1,5).map((visual,index)=><figure className={index===0?'wide':''} key={visual.alt}><img src={visual.image} alt={visual.alt} loading='lazy'/><figcaption><span>0{index+1}</span>{visual.alt}</figcaption></figure>)}</div>
        </section>
      </article>

      <aside className='blog-reading-aside'>
        <div className='blog-aside-card'><small>ARTICLE DETAILS</small><dl><div><dt>Topic</dt><dd>{tag}</dd></div><div><dt>Written by</dt><dd>{author}</dd></div><div><dt>Reading time</dt><dd>5 minutes</dd></div></dl></div>
        <div className='blog-aside-help'><small>NEED A CLEAR ANSWER?</small><h2>Talk to an automobile expert.</h2><p>Get personalised guidance about vehicles, service or genuine spare parts.</p><Link to={enquiryUrl}>Send an Enquiry →</Link></div>
        <div className='blog-aside-links'><strong>Continue exploring</strong><Link to='/vehicles'>Explore Vehicles <span>→</span></Link><Link to='/services'>Vehicle Services <span>→</span></Link><Link to='/spare-parts'>Genuine Spare Parts <span>→</span></Link></div>
      </aside>
    </section>

    <section className='blog-related-section'><div className='market-wrap'>
      <header><div><small>KEEP READING</small><h2>Related stories</h2></div><Link to='/blog'>View all articles →</Link></header>
      <div className='blog-related-grid'>{related.map((story)=><article key={story.slug}><Link to={`/blog/${story.slug}`}><img src={story.image} alt={story.alt}/></Link><small>{story.tag}</small><h3><Link to={`/blog/${story.slug}`}>{story.title}</Link></h3><p>{story.excerpt}</p><Link to={`/blog/${story.slug}`}>Read article →</Link></article>)}</div>
    </div></section>

    <section className='market-wrap blog-detail-cta'><div><small>SMARTER JOURNEYS START HERE</small><h2>Ready to make your next vehicle decision?</h2><p>Share your requirement and our experts will help with the next step.</p></div><Link to={enquiryUrl}>Enquire with an Expert →</Link></section>
  </main></MarketplaceShell>
}
