const { chromium } = require('playwright')

const baseUrl=process.env.QA_BASE_URL||'http://localhost:5174'
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
      const section=page.locator('#electric-cars')
      await section.waitFor({state:'visible'})
      await section.scrollIntoViewIfNeeded()
      await page.waitForTimeout(350)
      const cardLocator=section.locator('.ev-car-product-card')
      const cardCount=await cardLocator.count()
      if(viewport.name==='mobile'){
        for(let index=0;index<cardCount;index+=1){
          await cardLocator.nth(index).scrollIntoViewIfNeeded()
          await page.waitForTimeout(120)
        }
        await page.waitForTimeout(350)
      }
      const checks=await page.evaluate(()=>{
        const brands=document.querySelector('#brands')
        const evSection=document.querySelector('#electric-cars')
        const servicePromo=document.querySelector('#trusted-service-promo')
        const cards=[...document.querySelectorAll('#electric-cars .ev-car-product-card')]
        const grid=document.querySelector('#electric-cars .ev-car-product-grid')
        return{
          directlyAfter:brands?.nextElementSibling===evSection,
          serviceDirectlyAfter:evSection?.nextElementSibling===servicePromo,
          serviceCardCount:servicePromo?.querySelectorAll('.home-care-card.service-card').length||0,
          uniqueRows:new Set(cards.map(card=>Math.round(card.getBoundingClientRect().top))).size,
          badImages:[...document.querySelectorAll('#electric-cars img')].filter(image=>!image.complete||image.naturalWidth===0).length,
          pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          gridScrollable:grid?grid.scrollWidth>grid.clientWidth:false,
          productLinks:[...document.querySelectorAll('#electric-cars a')].filter(link=>link.getAttribute('href')).length,
        }
      })
      if(cardCount!==6)failures.push(`${viewport.name}: expected 6 EV car cards, found ${cardCount}`)
      if(checks.productLinks<13)failures.push(`${viewport.name}: EV product links are missing`)
      if(!checks.directlyAfter)failures.push(`${viewport.name}: EV Cars is not directly below Top Brands`)
      if(!checks.serviceDirectlyAfter)failures.push(`${viewport.name}: trusted service card is not directly below EV Cars`)
      if(checks.serviceCardCount!==1)failures.push(`${viewport.name}: expected one trusted service card below EV Cars`)
      if(checks.badImages)failures.push(`${viewport.name}: ${checks.badImages} EV car images failed to load`)
      if(checks.pageOverflow>2)failures.push(`${viewport.name}: page overflows by ${checks.pageOverflow}px`)
      if(viewport.name==='desktop'&&checks.uniqueRows!==1)failures.push(`desktop: EV car cards use ${checks.uniqueRows} rows`)
      if(viewport.name==='mobile'&&!checks.gridScrollable)failures.push('mobile: EV car cards are not horizontally swipeable')
      if(errors.length)failures.push(`${viewport.name}: ${errors.join(' | ')}`)
      await section.screenshot({path:`ev-cars-${viewport.name}.png`})
      await context.close()
    }
  }finally{await browser.close()}
  if(failures.length){failures.forEach((failure)=>console.error(failure));process.exit(1)}
  console.log('EV Cars section passed order, six-card row, links, images, mobile swipe, console and overflow checks.')
}

main().catch((error)=>{console.error(error);process.exit(1)})
