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
      const section=page.locator('#explore-vehicles')
      await section.waitFor({state:'visible'})
      await section.scrollIntoViewIfNeeded()
      const cards=section.locator('.explore-category-card')
      const dots=section.locator('.explore-category-dots button')
      const cardCount=await cards.count()
      const dotCount=await dots.count()
      for(let index=0;index<cardCount;index+=1){
        await cards.nth(index).scrollIntoViewIfNeeded()
        await page.waitForTimeout(100)
      }
      const beforeNext=await section.locator('.explore-category-card.is-active h3').innerText()
      await section.locator('.explore-control.next').click()
      await page.waitForTimeout(650)
      const afterNext=await section.locator('.explore-category-card.is-active h3').innerText()
      await dots.nth(0).click()
      await page.waitForTimeout(650)
      const afterDot=await section.locator('.explore-category-card.is-active h3').innerText()
      await page.mouse.move(1,1)
      const beforeAuto=await section.locator('.explore-category-card.is-active h3').innerText()
      await page.waitForTimeout(4500)
      const afterAuto=await section.locator('.explore-category-card.is-active h3').innerText()
      const carSection=page.locator('#explore-car-products')
      await carSection.waitFor({state:'visible'})
      await carSection.scrollIntoViewIfNeeded()
      const carCards=carSection.locator('.explore-car-product-card')
      const carCardCount=await carCards.count()
      for(let index=0;index<carCardCount;index+=1){
        await carCards.nth(index).scrollIntoViewIfNeeded()
        await page.waitForTimeout(100)
      }
      const productSectionSelectors=['#trending-vehicles','#explore-car-products','#commercial-products','#electric-cars','#popular-bikes']
      for(const selector of productSectionSelectors){
        const productSection=page.locator(selector)
        await productSection.waitFor({state:'visible'})
        await productSection.scrollIntoViewIfNeeded()
        const productCards=productSection.locator('.trending-vehicle-card')
        const productCardCount=await productCards.count()
        for(let index=0;index<productCardCount;index+=1){
          await productCards.nth(index).scrollIntoViewIfNeeded()
          await page.waitForTimeout(80)
        }
      }
      const checks=await page.evaluate(()=>{
        const section=document.querySelector('#explore-vehicles')
        const track=section?.querySelector('.explore-category-track')
        const cards=[...section?.querySelectorAll('.explore-category-card')||[]]
        const active=section?.querySelector('.explore-category-card.is-active')
        const inactive=cards.find(card=>card!==active)
        const activeArrow=active?.querySelector('.explore-card-arrow')
        const activeFooterText=active?.querySelector('.explore-card-footer>div')
        const trackRect=track?.getBoundingClientRect()
        const activeRect=active?.getBoundingClientRect()
        const arrowRect=activeArrow?.getBoundingClientRect()
        const footerTextRect=activeFooterText?.getBoundingClientRect()
        const activeStyle=active?getComputedStyle(active):null
        const carBlock=document.querySelector('#explore-car-products')
        const carCards=[...carBlock?.querySelectorAll('.explore-car-product-card')||[]]
        const carGrid=carBlock?.querySelector('.explore-car-product-grid')
        const productSectionSelectors=['#trending-vehicles','#explore-car-products','#commercial-products','#electric-cars','#popular-bikes']
        const cardStyleSignature=(card)=>{
          const cardStyle=getComputedStyle(card)
          const imageStyle=getComputedStyle(card.querySelector('.trending-vehicle-image'))
          const bodyStyle=getComputedStyle(card.querySelector('.trending-vehicle-body'))
          const footerStyle=getComputedStyle(card.querySelector('.trending-vehicle-footer'))
          const ctaStyle=getComputedStyle(card.querySelector('.trending-vehicle-footer>a'))
          return [cardStyle.borderRadius,cardStyle.borderWidth,cardStyle.backgroundColor,cardStyle.padding,cardStyle.boxShadow,imageStyle.height,imageStyle.margin,bodyStyle.padding,footerStyle.borderTopWidth,ctaStyle.borderRadius,ctaStyle.backgroundColor].join('|')
        }
        const masterCard=document.querySelector('#trending-vehicles .trending-vehicle-card')
        const masterSignature=masterCard?cardStyleSignature(masterCard):''
        const productCardResults=productSectionSelectors.map((selector)=>{
          const productSection=document.querySelector(selector)
          const productCards=[...productSection?.querySelectorAll('.trending-vehicle-card')||[]]
          return{
            selector,
            count:productCards.length,
            badImages:productCards.filter(card=>{const image=card.querySelector('img');return !image||!image.complete||image.naturalWidth===0}).length,
            incomplete:productCards.filter(card=>
              !card.querySelector('.trending-vehicle-image')||
              !card.querySelector('.vehicle-category-pill')||
              !card.querySelector('.trending-rating')||
              !card.querySelector('.trending-vehicle-body h3')||
              !card.querySelector('.trending-vehicle-copy')||
              !card.querySelector('.trending-vehicle-footer strong')||
              card.querySelectorAll('a[href]').length<2
            ).length,
            styleMismatch:productCards.filter(card=>cardStyleSignature(card)!==masterSignature).length,
          }
        })
        return{
          badImages:[...section?.querySelectorAll('img')||[]].filter(image=>!image.complete||image.naturalWidth===0).length,
          badCarImages:[...carBlock?.querySelectorAll('img')||[]].filter(image=>!image.complete||image.naturalWidth===0).length,
          pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          trackScrollable:track?track.scrollWidth>track.clientWidth:false,
          carGridScrollable:carGrid?carGrid.scrollWidth>carGrid.clientWidth:false,
          firstSixCarRows:new Set(carCards.slice(0,6).map(card=>Math.round(card.getBoundingClientRect().top))).size,
          carProductLinks:[...carBlock?.querySelectorAll('.explore-car-product-card a')||[]].filter(link=>link.getAttribute('href')).length,
          activeTaller:active&&inactive?active.getBoundingClientRect().height>inactive.getBoundingClientRect().height:true,
          activeWider:active&&inactive?active.getBoundingClientRect().width>inactive.getBoundingClientRect().width:true,
          activeTopVisible:Boolean(activeRect&&trackRect&&activeRect.top>=trackRect.top-1),
          activeBorderTop:activeStyle?parseFloat(activeStyle.borderTopWidth):0,
          arrowRightOfText:Boolean(footerTextRect&&arrowRect&&arrowRect.left>=footerTextRect.right-1),
          arrowVerticallyAligned:Boolean(footerTextRect&&arrowRect&&Math.abs((footerTextRect.top+footerTextRect.height/2)-(arrowRect.top+arrowRect.height/2))<=3),
          visibleArrows:[...section?.querySelectorAll('.explore-card-arrow')||[]].filter(arrow=>{
            const style=getComputedStyle(arrow)
            return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)>0
          }).length,
          activeCount:section?.querySelectorAll('.explore-category-card.is-active').length||0,
          routeLinks:[...section?.querySelectorAll('.explore-category-card>a')||[]].filter(link=>link.getAttribute('href')?.startsWith('/vehicles/')).length,
          productCardResults,
        }
      })
      if(cardCount!==5)failures.push(`${viewport.name}: expected 5 category cards, found ${cardCount}`)
      if(dotCount!==5)failures.push(`${viewport.name}: expected 5 slider dots, found ${dotCount}`)
      if(checks.activeCount!==1)failures.push(`${viewport.name}: expected exactly one active category card`)
      if(checks.routeLinks!==5)failures.push(`${viewport.name}: category card routes are missing`)
      if(beforeNext===afterNext)failures.push(`${viewport.name}: next arrow did not change the active category`)
      if(afterDot!=='Bikes')failures.push(`${viewport.name}: first slider dot did not select Bikes`)
      if(beforeAuto===afterAuto)failures.push(`${viewport.name}: automatic slide did not advance`)
      if(checks.badImages)failures.push(`${viewport.name}: ${checks.badImages} category images failed to load`)
      if(carCardCount<6)failures.push(`${viewport.name}: expected at least 6 car products, found ${carCardCount}`)
      if(checks.carProductLinks<carCardCount*2)failures.push(`${viewport.name}: Cars product links are missing`)
      if(checks.badCarImages)failures.push(`${viewport.name}: ${checks.badCarImages} car product images failed to load`)
      if(checks.pageOverflow>2)failures.push(`${viewport.name}: page overflows by ${checks.pageOverflow}px`)
      if(!checks.activeTaller)failures.push(`${viewport.name}: active category card is not emphasized`)
      if(!checks.activeWider)failures.push(`${viewport.name}: active category card is not wider`)
      if(!checks.activeTopVisible)failures.push(`${viewport.name}: active category top corners are clipped`)
      if(checks.activeBorderTop<2)failures.push(`${viewport.name}: active category top border is not clearly visible`)
      if(!checks.arrowRightOfText)failures.push(`${viewport.name}: active category arrow is not on the text's right side`)
      if(!checks.arrowVerticallyAligned)failures.push(`${viewport.name}: active category arrow is not vertically aligned with its text`)
      if(checks.visibleArrows!==1)failures.push(`${viewport.name}: expected one visible active arrow, found ${checks.visibleArrows}`)
      if(viewport.name==='desktop'&&checks.firstSixCarRows!==1)failures.push(`desktop: first six Cars use ${checks.firstSixCarRows} rows`)
      if(viewport.name==='mobile'&&!checks.trackScrollable)failures.push('mobile: category slider is not horizontally swipeable')
      if(viewport.name==='mobile'&&!checks.carGridScrollable)failures.push('mobile: Cars products are not horizontally swipeable')
      for(const result of checks.productCardResults){
        if(result.count<6)failures.push(`${viewport.name}: ${result.selector} has only ${result.count} product cards`)
        if(result.badImages)failures.push(`${viewport.name}: ${result.selector} has ${result.badImages} broken product images`)
        if(result.incomplete)failures.push(`${viewport.name}: ${result.selector} has ${result.incomplete} cards missing the Trending structure`)
        if(result.styleMismatch)failures.push(`${viewport.name}: ${result.selector} has ${result.styleMismatch} cards that do not match Trending styling`)
      }
      if(errors.length)failures.push(`${viewport.name}: ${errors.join(' | ')}`)
      await section.screenshot({path:`explore-active-${viewport.name}.png`})
      await carSection.screenshot({path:`explore-cars-${viewport.name}.png`})
      await page.locator('#trending-vehicles').screenshot({path:`trending-products-${viewport.name}.png`})
      await page.locator('#popular-bikes').screenshot({path:`bike-products-${viewport.name}.png`})
      await context.close()
    }
  }finally{await browser.close()}
  if(failures.length){failures.forEach((failure)=>console.error(failure));process.exit(1)}
  console.log('Explore Vehicles and all Home product sections passed shared Trending-card structure, styling, image, link, responsive, console and overflow checks.')
}

main().catch((error)=>{console.error(error);process.exit(1)})
