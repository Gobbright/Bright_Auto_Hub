const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
]

const publishOptions = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
]

export const primaryVehicleCategorySlugs = ['2-wheelers', '4-wheelers', 'commercial-vehicles', 'farm-vehicles', 'construction-vehicles', 'ev-vehicles']

export const brandConfig = {
  resource: 'brands',
  title: 'Brands',
  singular: 'Brand',
  simple: true,
  eyebrow: 'Vehicle catalogue',
  description: 'Manage brand names, logo files and publishing status.',
  columns: [
    { key: 'logoUrl', label: 'Logo', image: true },
    { key: 'name', label: 'Brand name', primary: true },
    { key: 'status', label: 'Status', status: true },
  ],
  fields: [
    { name: 'name', label: 'Brand name', required: true, placeholder: 'e.g. Tata Motors' },
    { name: 'logoUrl', label: 'Brand logo', type: 'file', accept: 'image/png,image/jpeg,image/webp,image/svg+xml', wide: true, required: true, hint: 'Upload PNG, JPG, WEBP or SVG. Maximum 2 MB.' },
    { name: 'status', label: 'Status', type: 'select', options: statusOptions, defaultValue: 'active', required: true },
  ],
}

const categoryBase = {
  resource: 'categories',
  title: 'Categories',
  singular: 'Category',
  eyebrow: 'Website navigation',
  description: 'Manage the complete vehicle, compare, parts, services and finance menu hierarchy.',
  columns: [
    { key: 'name', label: 'Category', primary: true },
    { key: 'group', label: 'Main group' },
    { key: 'parentId', label: 'Parent', format: (value, _item, lookups) => value?.name || lookups.categories?.find((entry) => String(entry._id) === String(value))?.name || 'Top level' },
    { key: 'sortOrder', label: 'Order' },
    { key: 'status', label: 'Status', status: true },
  ],
  fields: [
    { name: 'name', label: 'Category name', required: true, placeholder: 'e.g. Electric Cars' },
    { name: 'parentId', label: 'Parent category', type: 'select', lookup: 'categories', emptyLabel: 'Top-level category' },
    { name: 'group', label: 'Main group', placeholder: 'e.g. Vehicles', hint: 'Useful for grouping menus.' },
    { name: 'sortOrder', label: 'Display order', type: 'number', defaultValue: 0, min: 0 },
    { name: 'icon', label: 'Category image', type: 'file', accept: 'image/png,image/jpeg,image/webp,image/svg+xml', wide: true, hint: 'Stored in MongoDB GridFS. Maximum 2 MB.' },
    { name: 'description', label: 'Description', type: 'textarea', wide: true, rows: 3 },
    { name: 'status', label: 'Status', type: 'select', options: statusOptions, defaultValue: 'active', required: true },
  ],
}

const categoryView = (group, title, singular) => ({
  ...categoryBase,
  title,
  singular,
  filterGroup: group,
  categoryLevel: 'sub',
  description: 'Manage ' + group.toLowerCase() + ' sub-categories separately from the main navigation categories.',
  fields: categoryBase.fields.map((field) => {
    if (field.name === 'parentId') return { ...field, lookupGroup: group, treeOptions: true, emptyLabel: 'Select parent category', required: true }
    if (field.name === 'group') return { ...field, type: 'select', options: [{ value: group, label: group }], defaultValue: group, required: true }
    return field
  }),
})

export const mainCategoryConfig = {
  ...categoryBase,
  title: 'Main Categories',
  singular: 'Main Category',
  categoryLevel: 'main',
  simple: true,
  description: 'Only top-level website categories are shown here. Sub-categories are managed from their separate navigation pages.',
  columns: categoryBase.columns.filter((column) => column.key !== 'parentId'),
  fields: categoryBase.fields.filter((field) => field.name !== 'parentId'),
}

export const vehicleCategoryConfig = {
  ...categoryView('Vehicles', 'Vehicle Categories', 'Vehicle Category'),
  categoryMode: 'vehicle-primary',
  primarySlugs: primaryVehicleCategorySlugs,
  noCreate: true,
  simple: true,
  description: 'The six fixed vehicle groups used by the public website. Edit these groups here and add their children under Vehicle Sub-categories.',
}
export const vehicleSubcategoryConfig = {
  ...categoryView('Vehicles', 'Vehicle Sub-categories', 'Vehicle Sub-category'),
  categoryMode: 'vehicle-sub',
  primarySlugs: primaryVehicleCategorySlugs,
}
export const partSubcategoryConfig = categoryView('Spare Parts', 'Spare Part Sub-categories', 'Spare Part Sub-category')
export const serviceSubcategoryConfig = categoryView('Services', 'Service Sub-categories', 'Service Sub-category')

export const vehicleConfig = {
  resource: 'vehicles',
  title: 'Vehicles',
  singular: 'Vehicle',
  eyebrow: 'Product catalogue',
  description: 'Create new, pre-owned, commercial, farm and construction vehicle listings.',
  columns: [
    { key: 'imageUrl', label: 'Image', image: true },
    { key: 'name', label: 'Vehicle', primary: true },
    { key: 'vehicleType', label: 'Type' },
    { key: 'brand.name', label: 'Brand' },
    { key: 'category.name', label: 'Category' },
    { key: 'price', label: 'Starting price', money: true },
    { key: 'status', label: 'Status', status: true },
  ],
  fields: [
    { name: 'name', label: 'Vehicle name', required: true, placeholder: 'e.g. Nexon EV' },
    { name: 'vehicleType', label: 'Vehicle type', type: 'select', defaultValue: 'Car', required: true, options: ['Car','Bike','Scooter','Commercial','Farm','Construction','Electric','Other'].map((value) => ({ value, label: value })) },
    { name: 'brand', label: 'Brand', type: 'select', lookup: 'brands', required: true },
    { name: 'category', label: 'Category / sub-category', type: 'select', lookup: 'categories', lookupGroup: 'Vehicles', leafOnly: true, treeOptions: true, required: true },
    { name: 'variant', label: 'Variant / trim', placeholder: 'e.g. XZ Plus Lux' },
    { name: 'registrationNumber', label: 'Registration number', placeholder: 'Used vehicles only' },
    { name: 'modelYear', label: 'Model year', type: 'number', defaultValue: new Date().getFullYear(), min: 1900 },
    { name: 'condition', label: 'Condition', type: 'select', defaultValue: 'new', options: [{value:'new',label:'New vehicle'},{value:'used',label:'Used vehicle'}] },
    { name: 'fuelType', label: 'Fuel type', type: 'select', defaultValue: 'Petrol', options: ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid', 'LPG'].map((value) => ({ value, label: value })) },
    { name: 'transmission', label: 'Transmission', type: 'select', defaultValue: 'Manual', options: ['Manual','Automatic','AMT','CVT','DCT'].map(value=>({value,label:value})) },
    { name: 'mileage', label: 'Kilometres driven (used)', type: 'number', min: 0 },
    { name: 'location', label: 'Location' },
    { name: 'color', label: 'Colour' },
    { name: 'seatingCapacity', label: 'Seats / capacity', type: 'number', min: 0 },
    { name: 'price', label: 'Starting price (â‚¹)', type: 'number', defaultValue: 0, min: 0 },
    { name: 'imageUrl', label: 'Vehicle image', type: 'file', accept: 'image/png,image/jpeg,image/webp,image/svg+xml', wide: true, required: true, hint: 'Upload PNG, JPG, WEBP or SVG. Maximum 2 MB.' },
    { name: 'description', label: 'Overview / description', type: 'textarea', wide: true, rows: 6 },
    { name: 'specifications', label: 'Specifications JSON', type: 'textarea', wide: true, rows: 7, hint: 'Add flexible specifications as valid JSON.' },
    { name: 'details', label: 'More details JSON', type: 'textarea', wide: true, rows: 8, hint: 'Optional JSON cards for the public product detail page.' },
    { name: 'status', label: 'Status', type: 'select', options: statusOptions, defaultValue: 'draft', required: true },
    { name: 'featured', label: 'Featured vehicle', type: 'checkbox', hint: 'Show on home page and featured sections.' },
  ],
}

export const contentConfig = {
  resource: 'content',
  title: 'Dynamic Content',
  singular: 'Page',
  eyebrow: 'Content management',
  description: 'Edit service, calculator, finance, dealer and general website pages from one place.',
  columns: [
    { key: 'title', label: 'Page title', primary: true },
    { key: 'type', label: 'Page type' },
    { key: 'slug', label: 'URL slug' },
    { key: 'status', label: 'Status', status: true },
  ],
  fields: [
    { name: 'title', label: 'Page title', required: true, placeholder: 'e.g. Car Service' },
    { name: 'type', label: 'Page type', type: 'select', defaultValue: 'page', required: true, options: [
      { value: 'page', label: 'General page' }, { value: 'service', label: 'Service' }, { value: 'tool', label: 'Tool / Calculator' },
      { value: 'finance', label: 'Finance / Insurance' }, { value: 'dealer', label: 'Dealer / Location' },
    ] },
    { name: 'slug', label: 'Custom URL slug', placeholder: 'auto-created-from-title', hint: 'Leave empty to create automatically.' },
    { name: 'heroImage', label: 'Hero image', type: 'file', accept: 'image/png,image/jpeg,image/webp,image/svg+xml', wide: true, hint: 'Stored in MongoDB GridFS. Maximum 2 MB.' },
    { name: 'summary', label: 'Short summary', type: 'textarea', wide: true, rows: 3 },
    { name: 'body', label: 'Full page content', type: 'textarea', wide: true, rows: 10, hint: 'HTML content is supported by the public website renderer.' },
    { name: 'seoTitle', label: 'SEO title', wide: true },
    { name: 'seoDescription', label: 'SEO description', type: 'textarea', wide: true, rows: 3 },
    { name: 'status', label: 'Publishing status', type: 'select', options: publishOptions, defaultValue: 'draft', required: true },
  ],
}

export const blogConfig = {
  resource: 'blogs',
  title: 'Blog Posts',
  singular: 'Blog Post',
  eyebrow: 'Content management',
  description: 'Write, save as draft and publish automotive articles from the admin panel.',
  columns: [
    { key: 'imageUrl', label: 'Cover', image: true },
    { key: 'title', label: 'Article', primary: true },
    { key: 'author', label: 'Author' },
    { key: 'publishedAt', label: 'Published', format: (value) => value ? new Date(value).toLocaleDateString('en-IN') : 'Not yet' },
    { key: 'status', label: 'Status', status: true },
  ],
  fields: [
    { name: 'title', label: 'Article title', required: true, wide: true },
    { name: 'slug', label: 'Custom URL slug', placeholder: 'auto-created-from-title', hint: 'Leave empty to create automatically.' },
    { name: 'author', label: 'Author', defaultValue: 'GoAuto Team' },
    { name: 'imageUrl', label: 'Cover image', type: 'file', accept: 'image/png,image/jpeg,image/webp,image/svg+xml', wide: true, hint: 'Stored in MongoDB GridFS. Maximum 2 MB.' },
    { name: 'imageAlt', label: 'Cover image alt text', wide: true, placeholder: 'Describe the cover image for accessibility and SEO' },
    { name: 'excerpt', label: 'Short excerpt', type: 'textarea', wide: true, rows: 3 },
    { name: 'content', label: 'Article content', type: 'textarea', wide: true, rows: 12, required: true },
    { name: 'galleryImages', label: 'Article content images', type: 'files', accept: 'image/png,image/jpeg,image/webp,image/svg+xml', wide: true, hint: 'Upload multiple images. They are stored in MongoDB GridFS and shown inside the article.' },
    { name: 'tags', label: 'Tags', wide: true, placeholder: 'EV, Buying Guide, Maintenance', hint: 'Separate multiple tags with commas.' },
    { name: 'readingTime', label: 'Reading time (minutes)', type: 'number', defaultValue: 5, min: 1 },
    { name: 'status', label: 'Publishing status', type: 'select', options: publishOptions, defaultValue: 'draft', required: true },
  ],
}

export const partConfig = {
  resource:'parts',title:'Spare Parts',singular:'Spare Part',eyebrow:'Commerce catalogue',description:'Manage parts, prices, stock and product images.',
  columns:[{key:'imageUrl',label:'Image',image:true},{key:'name',label:'Part',primary:true},{key:'brand',label:'Brand'},{key:'category',label:'Category'},{key:'price',label:'Price',money:true},{key:'stock',label:'Stock'},{key:'status',label:'Status',status:true}],
  fields:[{name:'name',label:'Part name',required:true},{name:'categoryId',label:'Category / sub-category',type:'select',lookup:'categories',lookupGroup:'Spare Parts',leafOnly:true,treeOptions:true,required:true},{name:'partNumber',label:'Part number'},{name:'brand',label:'Brand'},{name:'price',label:'Price (â‚¹)',type:'number',min:0},{name:'originalPrice',label:'Original price (â‚¹)',type:'number',min:0},{name:'stock',label:'Stock quantity',type:'number',min:0},{name:'compatibleVehicleTypes',label:'Compatible vehicles',wide:true,placeholder:'Cars, Bikes, Commercial',hint:'Comma separated vehicle types'},{name:'imageUrl',label:'Part image',type:'file',accept:'image/png,image/jpeg,image/webp,image/svg+xml',wide:true,required:true,hint:'Stored in MongoDB GridFS. Maximum 2 MB.'},{name:'description',label:'Description',type:'textarea',wide:true},{name:'details',label:'More details JSON',type:'textarea',wide:true,rows:8,hint:'Optional JSON cards for the public product detail page.'},{name:'status',label:'Status',type:'select',options:statusOptions,defaultValue:'active'},{name:'featured',label:'Featured product',type:'checkbox'}],
}
export const serviceConfig = {
  resource:'services',title:'Vehicle Services',singular:'Service',eyebrow:'Service catalogue',description:'Manage bookable services, packages, prices and images.',
  columns:[{key:'imageUrl',label:'Image',image:true},{key:'name',label:'Service',primary:true},{key:'category',label:'Category'},{key:'brands',label:'Brands'},{key:'price',label:'From price',money:true},{key:'duration',label:'Duration'},{key:'status',label:'Status',status:true}],
  fields:[{name:'name',label:'Service name',required:true},{name:'categoryId',label:'Category / sub-category',type:'select',lookup:'categories',lookupGroup:'Services',leafOnly:true,treeOptions:true,required:true},{name:'price',label:'Starting price (â‚¹)',type:'number',min:0},{name:'duration',label:'Duration',placeholder:'e.g. 2 to 3 hours'},{name:'vehicleTypes',label:'Available for',wide:true,placeholder:'Cars, Bikes, Commercial',hint:'Comma separated vehicle types'},{name:'brands',label:'Brands serviced',wide:true,placeholder:'Maruti Suzuki, Hyundai, Tata, Mahindra',hint:'Comma separated brands shown in Brands We Service on the public services page.'},{name:'imageUrl',label:'Service image',type:'file',accept:'image/png,image/jpeg,image/webp,image/svg+xml',wide:true,required:true,hint:'Stored in MongoDB GridFS. Maximum 2 MB.'},{name:'description',label:'Description',type:'textarea',wide:true},{name:'features',label:'Package features',wide:true,hint:'Comma separated features'},{name:'details',label:'More service details JSON',type:'textarea',wide:true,rows:8,hint:'Optional JSON cards for the public service detail page.'},{name:'status',label:'Status',type:'select',options:statusOptions,defaultValue:'active'},{name:'featured',label:'Featured service',type:'checkbox'}],
}
export const pageConfig = {
  resource:'pages',title:'Public Website Pages',singular:'Website Page',eyebrow:'Website content',description:'View and edit the hero, text, images, calls to action, SEO and structured content for every public website page.',
  columns:[{key:'name',label:'Page',primary:true},{key:'slug',label:'Route'},{key:'title',label:'Hero title'},{key:'status',label:'Status',status:true}],
  fields:[{name:'name',label:'Admin name',required:true},{name:'slug',label:'Route slug',required:true},{name:'eyebrow',label:'Hero eyebrow'},{name:'title',label:'Hero title',required:true},{name:'highlight',label:'Highlighted words'},{name:'description',label:'Hero description',type:'textarea',wide:true},{name:'heroImage',label:'Hero image',type:'file',accept:'image/png,image/jpeg,image/webp,image/svg+xml',wide:true,hint:'Stored in MongoDB GridFS. Maximum 2 MB.'},{name:'ctaLabel',label:'CTA label'},{name:'ctaUrl',label:'CTA URL'},{name:'sections',label:'Advanced sections JSON',type:'textarea',wide:true,rows:10,hint:'Structured content used by public page modules.'},{name:'seoTitle',label:'SEO title',wide:true},{name:'seoDescription',label:'SEO description',type:'textarea',wide:true},{name:'status',label:'Status',type:'select',options:publishOptions,defaultValue:'published'}],
}
export const legacyEnquiryConfig = {
  resource:'enquiries',title:'Enquiries',singular:'Enquiry',eyebrow:'Customer inbox',description:'Review contact, vehicle, service and parts enquiries.',
  columns:[{key:'name',label:'Customer',primary:true},{key:'email',label:'Email'},{key:'phone',label:'Phone'},{key:'subject',label:'Subject'},{key:'source',label:'Source'},{key:'createdAt',label:'Received',format:(value)=>value?new Date(value).toLocaleDateString('en-IN'):'â€”'},{key:'status',label:'Status',status:true}],
  filters:[{key:'source',label:'All sources'},{key:'subject',label:'All subjects'},{key:'createdAt',label:'All dates',type:'date',options:[{value:'today',label:'Today'},{value:'7days',label:'Last 7 days'},{value:'30days',label:'Last 30 days'}]}],
  fields:[{name:'name',label:'Customer name',required:true},{name:'email',label:'Email',type:'email',required:true},{name:'phone',label:'Phone'},{name:'subject',label:'Subject'},{name:'message',label:'Message',type:'textarea',wide:true,required:true},{name:'source',label:'Source'},{name:'status',label:'Status',type:'select',options:[{value:'new',label:'New'},{value:'in-progress',label:'In progress'},{value:'resolved',label:'Resolved'}],defaultValue:'new'}],
}

export const enquiryConfig = {
  resource:'enquiries',title:'Enquiries',singular:'Enquiry',eyebrow:'Customer inbox',description:'Review every enquiry with its selected product, location, account and source-page context.',
  columns:[{key:'name',label:'Customer',primary:true},{key:'phone',label:'Phone'},{key:'itemName',label:'Item / service'},{key:'location',label:'Location'},{key:'source',label:'Source'},{key:'createdAt',label:'Received',format:(value)=>value?new Date(value).toLocaleDateString('en-IN'):'â€”'},{key:'status',label:'Status',status:true}],
  filters:[{key:'source',label:'All sources'},{key:'subject',label:'All subjects'},{key:'createdAt',label:'All dates',type:'date',options:[{value:'today',label:'Today'},{value:'7days',label:'Last 7 days'},{value:'30days',label:'Last 30 days'}]}],
  fields:[{name:'name',label:'Customer name',required:true},{name:'email',label:'Email',type:'email',required:true},{name:'phone',label:'Phone'},{name:'subject',label:'Subject'},{name:'itemName',label:'Selected item / service'},{name:'category',label:'Category'},{name:'enquiryType',label:'Enquiry type'},{name:'location',label:'Selected location',wide:true},{name:'pageTitle',label:'Source page title',wide:true},{name:'pageUrl',label:'Source page URL',wide:true},{name:'accountEmail',label:'Signed-in account'},{name:'latitude',label:'Latitude',type:'number'},{name:'longitude',label:'Longitude',type:'number'},{name:'message',label:'Message',type:'textarea',wide:true,required:true},{name:'context',label:'Automatic context',type:'textarea',wide:true,rows:5},{name:'emailNotificationStatus',label:'Email notification status'},{name:'emailNotifiedAt',label:'Email sent at'},{name:'customerAcknowledgementSent',label:'Customer acknowledgement'},{name:'emailNotificationError',label:'Email error',type:'textarea',wide:true},{name:'ip',label:'IP address'},{name:'userAgent',label:'Browser / device',type:'textarea',wide:true,rows:3},{name:'source',label:'Source'},{name:'status',label:'Status',type:'select',options:[{value:'new',label:'New'},{value:'in-progress',label:'In progress'},{value:'resolved',label:'Resolved'}],defaultValue:'new'}],
  noCreate:true,
  simple:true,
  columns:[{key:'name',label:'Customer',primary:true},{key:'phone',label:'Phone'},{key:'itemName',label:'Service / item'},{key:'pageTitle',label:'Submitted from page'},{key:'emailNotificationStatus',label:'Email',status:true},{key:'source',label:'Type'},{key:'createdAt',label:'Received',format:(value)=>value?new Date(value).toLocaleString('en-IN'):'â€”'},{key:'status',label:'Status',status:true}],
  filters:[{key:'itemName',label:'All services / items'},{key:'category',label:'All categories'},{key:'enquiryType',label:'All enquiry types'},{key:'source',label:'All sources'},{key:'pageTitle',label:'All source pages'},{key:'subject',label:'All subjects'},{key:'createdAt',label:'All dates',type:'date',options:[{value:'today',label:'Today'},{value:'7days',label:'Last 7 days'},{value:'30days',label:'Last 30 days'}]}],
}

export const activityConfig = {
  resource:'activities',title:'Login Activity',singular:'Activity',eyebrow:'Security activity',description:'View successful logins, failed attempts, quick logins, registrations and logouts from the website.',
  noCreate:true,noEdit:true,
  columns:[
    {key:'username',label:'User',primary:true},
    {key:'event',label:'Event'},
    {key:'method',label:'Method'},
    {key:'status',label:'Status',status:true},
    {key:'source',label:'Source'},
    {key:'ip',label:'IP address'},
    {key:'createdAt',label:'Date & time',format:(value)=>value?new Date(value).toLocaleString('en-IN'):'â€”'},
  ],
  filters:[
    {key:'event',label:'All events'},
    {key:'method',label:'All methods'},
    {key:'source',label:'All sources'},
    {key:'createdAt',label:'All dates',type:'date',options:[{value:'today',label:'Today'},{value:'7days',label:'Last 7 days'},{value:'30days',label:'Last 30 days'}]},
  ],
  fields:[
    {name:'username',label:'User name'},
    {name:'event',label:'Event'},
    {name:'method',label:'Login method'},
    {name:'status',label:'Status'},
    {name:'source',label:'Source'},
    {name:'ip',label:'IP address'},
    {name:'userAgent',label:'Device / browser',wide:true},
    {name:'details',label:'Details',wide:true},
    {name:'createdAt',label:'Date & time'},
  ],
}
export const websiteActivityConfig = {
  resource: 'website-activities',
  title: 'Website Activity',
  singular: 'Website Event',
  eyebrow: 'Website traffic',
  description: 'Track page views and important click actions from the public website.',
  noCreate: true,
  noEdit: true,
  simple: true,
  columns: [
    { key: 'pageTitle', label: 'Page', primary: true },
    { key: 'event', label: 'Event' },
    { key: 'action', label: 'Action' },
    { key: 'target', label: 'Target' },
    { key: 'pagePath', label: 'Path' },
    { key: 'createdAt', label: 'Tracked', format: (value) => value ? new Date(value).toLocaleString('en-IN') : 'â€”' },
  ],
  filters: [
    { key: 'event', label: 'All events' },
    { key: 'pageTitle', label: 'All pages' },
    { key: 'pagePath', label: 'All paths' },
    { key: 'createdAt', label: 'All dates', type: 'date', options: [{ value: 'today', label: 'Today' }, { value: '7days', label: 'Last 7 days' }, { value: '30days', label: 'Last 30 days' }] },
  ],
  fields: [
    { name: 'event', label: 'Event' },
    { name: 'pageTitle', label: 'Page title' },
    { name: 'pageUrl', label: 'Page URL', wide: true },
    { name: 'pagePath', label: 'Page path' },
    { name: 'action', label: 'Action' },
    { name: 'target', label: 'Target' },
    { name: 'referrer', label: 'Referrer', wide: true },
    { name: 'source', label: 'Source' },
    { name: 'details', label: 'Details', type: 'textarea', wide: true, rows: 3 },
    { name: 'ip', label: 'IP address' },
    { name: 'userAgent', label: 'Browser / device', type: 'textarea', wide: true, rows: 3 },
    { name: 'createdAt', label: 'Date & time' },
  ],
}