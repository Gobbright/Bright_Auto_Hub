const { chromium } = require('playwright')

const baseUrl=process.env.QA_BASE_URL||'http://127.0.0.1:4173'
const viewports=[{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]

async function main(){
  const browser=await chromium.launch({headless:true})
  const failures=[]
  try{
    for(const viewport of viewports){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height}})
      await context.route('**/api/**',(route)=>{
        const url=route.request().url()
        const body=url.includes('/api/home')?{page:null,featuredBrands:[],featuredVehicles:[],featuredServices:[],featuredParts:[],latestBlogs:[]}:[]
        return route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify(body)})
      })
      const page=await context.newPage()
      const errors=[]
      page.on('console',(message)=>{if(message.type()==='error')errors.push(message.text())})
      page.on('pageerror',(error)=>errors.push(error.message))
      page.on('response',(response)=>{if(response.status()===404)errors.push('404 '+response.url())})
      await page.goto(baseUrl,{waitUntil:'networkidle'})
      const section=page.locator('#popular-bikes')
      await section.waitFor({state:'visible'})
      await section.scrollIntoViewIfNeeded()
      await page.waitForTimeout(400)
      if(viewport.name==='mobile'){
        await section.locator('.bike-product-grid').evaluate((grid)=>{grid.scrollLeft=grid.scrollWidth})
        await page.waitForTimeout(400)
      }
      const cardCount=await section.locator('.bike-product-card').count()
      const linkCount=await section.locator('.bike-product-card a').count()
      const checks=await page.evaluate(()=>{
        const quick=document.querySelector('#how-it-works')
        const bikes=document.querySelector('#popular-bikes')
        const cards=[...document.querySelectorAll('#popular-bikes .bike-product-card')]
        const grid=document.querySelector('#popular-bikes .bike-product-grid')
        return{
          followsQuick:Boolean(quick&&bikes&&(quick.compareDocumentPosition(bikes)&Node.DOCUMENT_POSITION_FOLLOWING)),
          uniqueRows:new Set(cards.map(card=>Math.round(card.getBoundingClientRect().top))).size,
          badImages:[...document.querySelectorAll('#popular-bikes img')].filter(image=>!image.complete||image.naturalWidth===0).length,
          pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          gridScrollable:grid?grid.scrollWidth>grid.clientWidth:false,
        }
      })
      if(cardCount!==6)failures.push(`${viewport.name}: expected 6 bike cards, found ${cardCount}`)
      if(linkCount<12)failures.push(`${viewport.name}: bike product links are missing`)
      if(!checks.followsQuick)failures.push(`${viewport.name}: Bikes section is not after Start Your Journey`)
      if(checks.badImages)failures.push(`${viewport.name}: ${checks.badImages} bike images failed to load`)
      if(checks.pageOverflow>2)failures.push(`${viewport.name}: page overflows by ${checks.pageOverflow}px`)
      if(viewport.name==='desktop'&&checks.uniqueRows!==1)failures.push(`desktop: bike cards are spread across ${checks.uniqueRows} rows`)
      if(viewport.name==='mobile'&&!checks.gridScrollable)failures.push('mobile: bike cards are not horizontally swipeable')
      if(errors.length)failures.push(`${viewport.name}: ${errors.join(' | ')}`)
      await section.screenshot({path:`bikes-${viewport.name}.png`})
      await context.close()
    }
  }finally{await browser.close()}
  if(failures.length){failures.forEach((failure)=>console.error(failure));process.exit(1)}
  console.log('Bikes section passed order, six-card row, links, images, mobile swipe, console and overflow checks.')
}

main().catch((error)=>{console.error(error);process.exit(1)})
