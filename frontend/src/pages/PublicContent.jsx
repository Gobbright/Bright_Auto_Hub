import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { MarketplaceShell } from './MarketplacePage.jsx'
import { blogDetailVisuals, getFallbackBlog } from '../data/visualContent.js'
import BlogDetailPage from './BlogDetailPage.jsx'
import './public-content.css'

export default function PublicContent({ kind, type }) {
  const { slug } = useParams()
  const [data, setData] = useState(slug ? null : [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isBlog = kind === 'blogs'

  useEffect(() => {
    setLoading(true)
    setError('')
    const query = !slug && type ? `?type=${type}` : ''
    api.get(`/public/${kind}${slug ? `/${slug}` : query}`)
      .then(setData)
      .catch((requestError) => {
        const fallback = isBlog && slug ? getFallbackBlog(slug) : null
        if (fallback) setData(fallback)
        else setError(requestError.message)
      })
      .finally(() => setLoading(false))
  }, [isBlog, kind, slug, type])

  useEffect(() => {
    if (loading || error) return
    const title = slug ? data?.title : isBlog ? 'Automotive Blog' : type === 'service' ? 'Vehicle Services' : 'Bright Auto Hub Information'
    const description = slug ? data?.excerpt || data?.summary : isBlog ? 'Automotive news, reviews and ownership guides from Bright Auto Hub.' : 'Information and vehicle services from Bright Auto Hub.'
    if (title) document.title = `${title} | Bright Auto Hub`
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content',description)
  }, [data, error, isBlog, loading, slug, type])

  if (loading) return <MarketplaceShell><div className="public-content-state">Loading...</div></MarketplaceShell>
  if (error) return <MarketplaceShell><div className="public-content-state"><h1>{error}</h1><Link to="/">Back to home</Link></div></MarketplaceShell>

  if (!slug) {
    const title = isBlog ? 'Latest from GoAuto' : type === 'service' ? 'Vehicle Services' : 'Explore GoAuto'
    const route = isBlog ? '/blog' : type === 'service' ? '/services' : '/pages'
    return <MarketplaceShell><main className="public-content-page"><section className="public-list-hero"><p>GOAUTO</p><h1>{title}</h1><span>Content updated directly from our admin panel.</span></section><section className="public-content-grid">{data.length ? data.map((item) => <article key={item._id}>{(item.imageUrl || item.heroImage) && <img src={item.imageUrl || item.heroImage} alt={item.title || 'Bright Auto Hub article'} />}<div><small>{isBlog ? item.author : item.type}</small><h2>{item.title}</h2><p>{item.excerpt || item.summary || 'Discover more information from GoAuto.'}</p><Link to={`${route}/${item.slug}`}>Read more →</Link></div></article>) : <div className="public-no-content">No published content yet.</div>}</section></main></MarketplaceShell>
  }

  const heroImage = data.imageUrl || data.heroImage || (isBlog ? blogDetailVisuals[0].image : '')
  if (isBlog) return <BlogDetailPage data={data} slug={slug} heroImage={heroImage}/>
  return <MarketplaceShell><main className="public-content-page">{heroImage && <div className="public-article-hero"><img src={heroImage} alt={data.title || 'Bright Auto Hub article'} /></div>}<article className="public-article"><Link className="public-article-back" to={isBlog ? '/blog' : type === 'service' ? '/services' : '/pages'}>← Back</Link><p className="public-kicker">{isBlog ? data.author : data.type}</p><h1>{data.title}</h1><p className="public-summary">{data.excerpt || data.summary}</p><div className="public-rich-text" dangerouslySetInnerHTML={{ __html: isBlog ? data.content : data.body }} />{isBlog && <><section className="article-visual-section"><div><p className="public-kicker">AUTOMOTIVE VISUAL GUIDE</p><h2>Explore Every Part of the Journey</h2><p>Vehicles, ownership, maintenance and road-trip inspiration in one visual guide.</p></div><div className="article-visual-grid">{blogDetailVisuals.map((visual,index)=><figure key={visual.alt} className={index===0?'wide':''}><img src={visual.image} alt={visual.alt} loading="lazy"/><figcaption>{visual.alt}</figcaption></figure>)}</div></section><aside className="article-enquiry-cta"><div><small>NEED PERSONALISED GUIDANCE?</small><h2>Ask our automotive experts.</h2><p>Tell us what you are considering and our team will respond with clear next steps.</p></div><Link to={`/contact?subject=Vehicle+enquiry&item=${encodeURIComponent(data.title)}&source=blog`}>Send an Enquiry →</Link></aside></>}</article></main></MarketplaceShell>
}
