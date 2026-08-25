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
      await page.goto(baseUrl,{waitUntil:'networkidle'})
      const section=page.locator('#commercial-products')
      await section.waitFor({state:'visible'})
      await section.scrollIntoViewIfNeeded()
      await page.waitForTimeout(400)
      if(viewport.name==='mobile'){
        await section.locator('.commercial-product-grid').evaluate((grid)=>{grid.scrollLeft=grid.scrollWidth})
        await page.waitForTimeout(400)
      }
      const cardCount=await section.locator('.commercial-product-card').count()
      const linkCount=await section.locator('.commercial-product-card a').count()
      const checks=await page.evaluate(()=>{
        const confidence=document.querySelector('.service-confidence-bar')
        const commercial=document.querySelector('#commercial-products')
        const cards=[...document.querySelectorAll('#commercial-products .commercial-product-card')]
        const grid=document.querySelector('#commercial-products .commercial-product-grid')
        return{
          directlyAfter:confidence?.nextElementSibling===commercial,
          uniqueRows:new Set(cards.map(card=>Math.round(card.getBoundingClientRect().top))).size,
          badImages:[...document.querySelectorAll('#commercial-products img')].filter(image=>!image.complete||image.naturalWidth===0).length,
          pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          gridScrollable:grid?grid.scrollWidth>grid.clientWidth:false,
        }
      })
      if(cardCount!==6)failures.push(`${viewport.name}: expected 6 commercial cards, found ${cardCount}`)
      if(linkCount<12)failures.push(`${viewport.name}: commercial product links are missing`)
      if(!checks.directlyAfter)failures.push(`${viewport.name}: Commercial Vehicles is not directly below Why Choose`)
      if(checks.badImages)failures.push(`${viewport.name}: ${checks.badImages} commercial images failed to load`)
      if(checks.pageOverflow>2)failures.push(`${viewport.name}: page overflows by ${checks.pageOverflow}px`)
      if(viewport.name==='desktop'&&checks.uniqueRows!==1)failures.push(`desktop: commercial cards use ${checks.uniqueRows} rows`)
      if(viewport.name==='mobile'&&!checks.gridScrollable)failures.push('mobile: commercial cards are not horizontally swipeable')
      if(errors.length)failures.push(`${viewport.name}: ${errors.join(' | ')}`)
      await section.screenshot({path:`commercial-${viewport.name}.png`})
      await context.close()
    }
  }finally{await browser.close()}
  if(failures.length){failures.forEach((failure)=>console.error(failure));process.exit(1)}
  console.log('Commercial section passed direct order, six-card row, links, images, mobile swipe, console and overflow checks.')
}

main().catch((error)=>{console.error(error);process.exit(1)})
