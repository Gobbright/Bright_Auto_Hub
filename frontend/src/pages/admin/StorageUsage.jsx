import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import AdminIcon from './AdminIcon.jsx'

const sizeLabel = (bytes = 0) => {
  const value = Number(bytes || 0)
  if (value < 1024) return value + ' B'
  if (value < 1024 ** 2) return (value / 1024).toFixed(1) + ' KB'
  if (value < 1024 ** 3) return (value / 1024 ** 2).toFixed(2) + ' MB'
  return (value / 1024 ** 3).toFixed(2) + ' GB'
}

export default function StorageUsage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setData(await api.get('/storage/stats')) }
    catch (requestError) { setError(requestError.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className='admin-empty'><span className='loader'/><h3>Calculating website and database storage...</h3></div>
  if (error) return <div className='admin-notice error'>{error}</div>

  const totals = data?.totals || {}
  const filesystem = data?.filesystem || {}
  const assets = data?.websiteAssets || {}
  const usedPercent = filesystem.total ? Math.min(100, (filesystem.used / filesystem.total) * 100) : 0

  return <div className='manager-page storage-usage-page'>
    <div className='page-intro'>
      <div><p className='eyebrow'>Website + MongoDB</p><h2>Storage &amp; Collections</h2><p>Track local website assets, GridFS images, database records and collection-level storage from one dashboard.</p></div>
      <button className='admin-secondary' type='button' onClick={load}><AdminIcon name='refresh'/> Refresh Usage</button>
    </div>

    <div className='storage-usage-cards'>
      <article><span>Overall stored</span><strong>{sizeLabel(totals.overallStoredSize)}</strong><small>Website assets + MongoDB</small></article>
      <article><span>Website assets</span><strong>{sizeLabel(assets.bytes)}</strong><small>{Number(assets.files || 0).toLocaleString('en-IN')} files · {Number(assets.images || 0).toLocaleString('en-IN')} images</small></article>
      <article><span>Website data</span><strong>{sizeLabel(totals.dataSize)}</strong><small>{Number(totals.documents || 0).toLocaleString('en-IN')} documents</small></article>
      <article><span>MongoDB allocated</span><strong>{sizeLabel(totals.totalSize || totals.storageSize)}</strong><small>Data and indexes on disk</small></article>
      <article><span>Reusable free</span><strong>{sizeLabel(totals.reusableFreeSize)}</strong><small>Space MongoDB can reuse</small></article>
      <article><span>GridFS images</span><strong>{sizeLabel(data?.gridfs?.bytes)}</strong><small>{data?.gridfs?.images || 0} stored images</small></article>
    </div>

    <section className='website-assets-panel'>
      <div className='database-breakdown-heading'><div><p className='eyebrow'>Website file storage</p><h3>Asset folders</h3></div><span>{Number(assets.files || 0).toLocaleString('en-IN')} files</span></div>
      <div className='asset-usage-grid'>
        {(assets.groups || []).map((group) => <article key={group.path}>
          <div><span>{group.label}</span><strong>{sizeLabel(group.bytes)}</strong></div>
          <p>{group.path}</p>
          <small>{Number(group.files || 0).toLocaleString('en-IN')} files · {Number(group.images || 0).toLocaleString('en-IN')} images</small>
        </article>)}
      </div>
    </section>

    <section className='database-capacity-panel'>
      <header><div><span>Server drive capacity</span><strong>{filesystem.available ? sizeLabel(filesystem.total) : 'Not reported'}</strong></div>{filesystem.available && <b>{sizeLabel(filesystem.free)} free</b>}</header>
      {filesystem.available ? <><div className='capacity-track'><i style={{ width: usedPercent + '%' }}/></div><footer><span>{sizeLabel(filesystem.used)} used</span><span>{usedPercent.toFixed(1)}%</span><span>{sizeLabel(filesystem.free)} free</span></footer></> : <p>Your MongoDB server did not expose filesystem capacity. Database and collection byte usage is still shown below.</p>}
    </section>

    <section className='data-panel database-breakdown'>
      <div className='database-breakdown-heading'><div><p className='eyebrow'>All MongoDB collections</p><h3>{data?.database || 'goautomobile'}</h3></div><span>{totals.collections || 0} collections</span></div>
      <div className='table-scroll'><table className='resource-table'><thead><tr><th>Collection</th><th>Documents</th><th>Data size</th><th>Allocated</th><th>Indexes</th><th>Total size</th></tr></thead><tbody>{(data?.collections || []).map((item) => <tr key={item.name}><td><span className='cell-primary'>{item.name}</span></td><td>{Number(item.count || 0).toLocaleString('en-IN')}</td><td>{sizeLabel(item.dataSize)}</td><td>{sizeLabel(item.storageSize)}</td><td>{sizeLabel(item.indexSize)}</td><td><strong>{sizeLabel(item.totalSize)}</strong></td></tr>)}</tbody></table></div>
    </section>
  </div>
}
