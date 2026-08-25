import { useState } from 'react'
import ResourceManager from './ResourceManager.jsx'
import { contentConfig, pageConfig } from './resourceConfigs.js'

const sections = [
  { id: 'pages', label: 'Public Pages', config: pageConfig },
  { id: 'dynamic', label: 'Dynamic Content', config: contentConfig },
]

export default function WebsiteContentManager({ onDataChange }) {
  const [active, setActive] = useState('pages')
  const section = sections.find((item) => item.id === active) || sections[0]

  return <div className='website-content-manager'>
    <div className='content-view-tabs' role='tablist' aria-label='Website content sections'>
      {sections.map((item) => <button
        className={active === item.id ? 'active' : ''}
        type='button'
        role='tab'
        aria-selected={active === item.id}
        key={item.id}
        onClick={() => setActive(item.id)}
      >{item.label}</button>)}
    </div>
    <ResourceManager config={section.config} onDataChange={onDataChange}/>
  </div>
}
