const { chromium } = require('playwright')

const baseUrl=process.env.QA_BASE_URL||'http://127.0.0.1:4173'
const catalogue={
  page:{slug:'vehicles',title:'Vehicles',description:'Vehicle catalogue'},
  brands:[{name:'Tata'},{name:'Brembo'}],
  vehicles:[
    {_id:'vehicle-1',slug:'tata-apex-suv',name:'Tata Apex SUV',brand:{name:'Tata'},model:'SUV',price:950000,fuelType:'Petrol',condition:'new',category:{name:'SUV'}},
    {_id:'vehicle-2',slug:'tata-electric-city',name:'Tata Electric City',brand:{name:'Tata'},model:'Electric Car',price:1400000,fuelType:'Electric',condition:'new',category:{name:'Electric Cars'}},
  ],
  parts:[
    {_id:'part-1',slug:'brembo-brake-pad',name:'Brembo Brake Pad',brand:'Brembo',vehicleType:'Cars',category:'Brake Parts',price:1250},
    {_id:'part-2',slug:'bosch-oil-filter',name:'Bosch Oil Filter',brand:'Bosch',vehicleType:'Cars',category:'Filters',price:450},
  ],
  services:[
    {_id:'service-1',slug:'car-ac-service',name:'Car AC Service',vehicleType:'Cars',category:'AC Service',city:'Chennai',price:1199,description:'Cooling inspection and refill.'},
    {_id:'service-2',slug:'bike-general-service',name:'Bike General Service',vehicleType:'Bikes',category:'General Service',city:'Bengaluru',price:899,description:'Routine bike care.'},
  ],
  blogs:[],partCategories:[],
}

async function mockApi(context){
  await context.route('**/api/**',(route)=>{
    const url=route.request().url()
    let body=[]
    if(url.includes('/api/home'))body={page:null,featuredBrands:[],featuredVehicles:[],featuredServices:[],featuredParts:[],latestBlogs:[]}
    if(url.includes('/api/public/site/vehicles'))body=catalogue
    return route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify(body)})
  })
}

async function runDesktop(browser,failures){
  const context=await browser.newContext({viewport:{width:1440,height:1000}})
  await mockApi(context)
  const page=await context.newPage()
  const errors=[]
  page.on('console',(message)=>{if(message.type()==='error')errors.push(message.text())})
  page.on('pageerror',(error)=>errors.push(error.message))

  await page.goto(baseUrl,{waitUntil:'networkidle'})
  await page.locator('.finder-form select[name=brand]').selectOption('Tata')
  await page.locator('.finder-form select[name=model]').selectOption('SUV')
  await page.locator('.finder-form select[name=price]').selectOption('5-20')
  await page.locator('.finder-form select[name=fuel]').selectOption('Petrol')
  await page.locator('.finder-form').evaluate((form)=>form.requestSubmit())
  await page.waitForURL('**/search?**')
  if(!page.url().includes('type=vehicles')||!page.url().includes('brand=Tata')||!page.url().includes('model=SUV'))failures.push('desktop vehicle search did not preserve filters in URL')
  await page.locator('.search-results-page').waitFor({state:'visible'})
  if(await page.locator('.search-result-card').count()!==1)failures.push('desktop vehicle filters did not return one result')
  if(await page.locator('.search-result-card h3').innerText()!=='Tata Apex SUV')failures.push('desktop vehicle search returned the wrong result')

  await page.goto(baseUrl,{waitUntil:'networkidle'})
  await page.locator('.finder-tabs').getByRole('button',{name:'Spare Parts'}).click()
  await page.locator('.finder-form select[name=vehicle]').selectOption('Cars')
  await page.locator('.finder-form select[name=category]').selectOption('Brake Parts')
  await page.locator('.finder-form select[name=brand]').selectOption('Brembo')
  await page.locator('.finder-form input[name=q]').fill('Brake')
  await page.locator('.finder-form').evaluate((form)=>form.requestSubmit())
  await page.waitForURL('**/search?**')
  if(!page.url().includes('type=parts')||!page.url().includes('category=Brake+Parts'))failures.push('desktop spare parts search URL is incorrect')
  await page.locator('.search-results-page').waitFor({state:'visible'})
  if(await page.locator('.search-result-card').count()!==1)failures.push('desktop spare parts filters did not return one result')

  await page.goto(baseUrl,{waitUntil:'networkidle'})
  await page.locator('.finder-tabs').getByRole('button',{name:'Service'}).click()
  await page.locator('.finder-form select[name=vehicle]').selectOption('Cars')
  await page.locator('.finder-form select[name=category]').selectOption('AC Service')
  await page.locator('.finder-form select[name=city]').selectOption('Chennai')
  await page.locator('.finder-form').evaluate((form)=>form.requestSubmit())
  await page.waitForURL('**/search?**')
  await page.locator('.search-results-page').waitFor({state:'visible'})
  if(!page.url().includes('type=services')||await page.locator('.search-result-card').count()!==1)failures.push('desktop service search did not filter correctly')

  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)
  if(overflow>2)failures.push(`desktop search page overflows by ${overflow}px`)
  await page.locator('.search-results-page').screenshot({path:'search-desktop.png'})
  if(errors.length)failures.push('desktop console errors: '+errors.join(' | '))
  await context.close()
}

async function runMobile(browser,failures){
  const context=await browser.newContext({viewport:{width:390,height:844}})
  await mockApi(context)
  const page=await context.newPage()
  const errors=[]
  page.on('console',(message)=>{if(message.type()==='error')errors.push(message.text())})
  page.on('pageerror',(error)=>errors.push(error.message))
  await page.goto(baseUrl+'/search?type=vehicles&brand=Tata&fuel=Electric',{waitUntil:'networkidle'})
  await page.locator('.search-results-page').waitFor({state:'visible'})
  if(await page.locator('.search-result-card').count()!==1)failures.push('mobile vehicle URL filters did not return one result')
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)
  if(overflow>2)failures.push(`mobile search page overflows by ${overflow}px`)
  await page.locator('.search-results-page').screenshot({path:'search-mobile.png'})
  if(errors.length)failures.push('mobile console errors: '+errors.join(' | '))
  await context.close()
}

async function main(){
  const browser=await chromium.launch({headless:true})
  const failures=[]
  try{await runDesktop(browser,failures);await runMobile(browser,failures)}finally{await browser.close()}
  if(failures.length){failures.forEach((failure)=>console.error(failure));process.exit(1)}
  console.log('Search flow passed vehicle, parts, service, URL persistence, desktop/mobile console and overflow checks.')
}

main().catch((error)=>{console.error(error);process.exit(1)})
