import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api, API_URL } from '../../lib/api.js'
import AdminIcon from './AdminIcon.jsx'

const sizeLabel = (bytes = 0) => {
  const value = Number(bytes || 0)
  if (value < 1024) return value + ' B'
  if (value < 1024 ** 2) return (value / 1024).toFixed(1) + ' KB'
  if (value < 1024 ** 3) return (value / 1024 ** 2).toFixed(2) + ' MB'
  return (value / 1024 ** 3).toFixed(2) + ' GB'
}

export default function StorageManager({ initialTab = 'overall', openToken = 0, onDataChange }) {
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [notice, setNotice] = useState({ kind: '', message: '' })
  const [backupBusy, setBackupBusy] = useState('')
  const imageImportRef = useRef(null)
  const dataImportRef = useRef(null)
  const lastOpenTokenRef = useRef(openToken)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [storageItems, storageStats] = await Promise.all([api.get('/storage'), api.get('/storage/stats')])
      setItems(storageItems)
      setStats(storageStats)
    }
    catch (error) { setNotice({ kind: 'error', message: error.message }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { setActiveTab(initialTab) }, [initialTab])
  useEffect(() => {
    if (openToken > lastOpenTokenRef.current) {
      lastOpenTokenRef.current = openToken
      setActiveTab('images')
      setEditor({ mode: 'create', title: '', alt: '', context: 'storage', file: null, preview: '' })
    }
  }, [openToken])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => !query || [item.filename, item.metadata?.title, item.metadata?.alt, item.metadata?.context].some((value) => String(value || '').toLowerCase().includes(query)))
  }, [items, search])

  const chooseFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setNotice({ kind: 'error', message: 'Image must be smaller than 2 MB.' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => setEditor((current) => ({ ...current, file, preview: reader.result, title: current.title || file.name }))
    reader.readAsDataURL(file)
  }

  const save = async (event) => {
    event.preventDefault()
    if (editor.mode === 'create' && !editor.file) return setNotice({ kind: 'error', message: 'Choose an image file.' })
    setSaving(true)
    try {
      if (editor.mode === 'create') {
        await api.post('/storage', { filename: editor.file.name, dataUrl: editor.preview, title: editor.title, alt: editor.alt, context: editor.context })
      } else {
        await api.put('/storage/' + editor._id, { title: editor.title, alt: editor.alt, context: editor.context })
      }
      setEditor(null)
      await load()
      onDataChange?.()
      setNotice({ kind: 'success', message: editor.mode === 'create' ? 'Image stored in MongoDB GridFS.' : 'Image details updated.' })
    } catch (error) { setNotice({ kind: 'error', message: error.message }) }
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    setSaving(true)
    try {
      await api.delete('/storage/' + deleting._id)
      setItems((current) => current.filter((item) => item._id !== deleting._id))
      setDeleting(null)
      setNotice({ kind: 'success', message: 'Image deleted from MongoDB GridFS.' })
      onDataChange?.()
    } catch (error) { setNotice({ kind: 'error', message: error.message }); setDeleting(null) }
    finally { setSaving(false) }
  }


  const downloadBackup = async (kind) => {
    setBackupBusy(kind)
    try {
      const response = await fetch(API_URL + '/storage/export/' + kind)
      if (!response.ok) throw new Error('Unable to export ' + kind + ' backup.')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'bright-auto-hub-' + kind + '-backup-' + new Date().toISOString().slice(0, 10) + '.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setNotice({ kind: 'success', message: (kind === 'images' ? 'Images' : 'Data') + ' backup exported.' })
    } catch (error) { setNotice({ kind: 'error', message: error.message }) }
    finally { setBackupBusy('') }
  }

  const importBackup = async (kind, event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBackupBusy('import-' + kind)
    try {
      const payload = JSON.parse(await file.text())
      const result = await api.post('/storage/import/' + kind, payload)
      await load()
      onDataChange?.()
      const count = kind === 'images' ? result.imported : Object.values(result.imported || {}).reduce((sum, value) => sum + Number(value || 0), 0)
      setNotice({ kind: 'success', message: (kind === 'images' ? 'Image' : 'Data') + ' backup imported. ' + count + ' records restored.' })
    } catch (error) { setNotice({ kind: 'error', message: error.message || 'Unable to import backup.' }) }
    finally { setBackupBusy('') }
  }

  const totals = stats?.totals || {}
  const assets = stats?.websiteAssets || {}
  const assetGroups = assets.groups || []
  const collections = stats?.collections || []
  const gridfsBytes = stats?.gridfs?.bytes ?? items.reduce((sum, item) => sum + item.length, 0)
  const dbBytes = totals.totalSize || totals.storageSize || 0
  const overallBytes = totals.overallStoredSize || gridfsBytes + (assets.bytes || 0) + dbBytes
  const contextCounts = useMemo(() => items.reduce((counts, item) => {
    const key = item.metadata?.context || 'admin'
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {}), [items])
  const topCollections = collections.slice(0, 4)

  return <div className='manager-page storage-page'>
    {notice.message && <div className={'admin-notice ' + notice.kind}>{notice.message}</div>}
    <nav className='storage-tabs' aria-label='Storage sections'>
      {[{ id: 'overall', label: 'Overall Size', note: sizeLabel(overallBytes) }, { id: 'images', label: 'Uploaded Images', note: items.length + ' files' }, { id: 'backup', label: 'Import / Export', note: backupBusy ? 'Working' : 'Ready' }].map((tab) => <button key={tab.id} type='button' className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}><span>{tab.label}</span><strong>{tab.note}</strong></button>)}
    </nav>

    {activeTab === 'overall' && <>
      <div className='storage-summary storage-total-summary'><div><span>Overall storage</span><strong>{sizeLabel(overallBytes)}</strong><small>Website assets + MongoDB + GridFS</small></div><div><span>GridFS images</span><strong>{sizeLabel(gridfsBytes)}</strong><small>{stats?.gridfs?.images || items.length} uploaded images</small></div><div><span>Website assets</span><strong>{sizeLabel(assets.bytes)}</strong><small>{Number(assets.files || 0).toLocaleString('en-IN')} files / {Number(assets.images || 0).toLocaleString('en-IN')} images</small></div><div><span>MongoDB database</span><strong>{sizeLabel(dbBytes)}</strong><small>{stats?.totals?.collections || 0} collections</small></div><div><span>Reusable free</span><strong>{sizeLabel(totals.reusableFreeSize)}</strong><small>Database free storage</small></div></div>
      <section className='data-panel storage-detail-panel'>
        <div className='database-breakdown-heading'><div><p className='eyebrow'>More details</p><h3>Website used storage</h3></div><span>{sizeLabel(overallBytes)}</span></div>
        <div className='storage-detail-grid'>
          <article><span>Data size</span><strong>{sizeLabel(totals.dataSize)}</strong><small>Documents only</small></article>
          <article><span>Index size</span><strong>{sizeLabel(totals.indexSize)}</strong><small>MongoDB indexes</small></article>
          <article><span>Allocated</span><strong>{sizeLabel(totals.storageSize)}</strong><small>Collection storage</small></article>
          <article><span>Stored total</span><strong>{sizeLabel(totals.totalSize)}</strong><small>DB total size</small></article>
        </div>
      </section>
      {assetGroups.length > 0 && <section className='data-panel database-breakdown storage-inline-usage'><div className='database-breakdown-heading'><div><p className='eyebrow'>Website assets</p><h3>Asset folders</h3></div><span>{Number(assets.files || 0).toLocaleString('en-IN')} files</span></div><div className='table-scroll'><table className='resource-table'><thead><tr><th>Folder</th><th>Path</th><th>Files</th><th>Images</th><th>Size</th></tr></thead><tbody>{assetGroups.map((item) => <tr key={item.path}><td><span className='cell-primary'>{item.label}</span></td><td>{item.path}</td><td>{Number(item.files || 0).toLocaleString('en-IN')}</td><td>{Number(item.images || 0).toLocaleString('en-IN')}</td><td><strong>{sizeLabel(item.bytes)}</strong></td></tr>)}</tbody></table></div></section>}
      {collections.length > 0 && <section className='data-panel database-breakdown storage-inline-usage'><div className='database-breakdown-heading'><div><p className='eyebrow'>All collections</p><h3>MongoDB collection usage</h3></div><span>{stats.totals?.collections || 0} collections</span></div><div className='storage-collection-chips'>{topCollections.map((item) => <article key={item.name}><span>{item.name}</span><strong>{sizeLabel(item.totalSize)}</strong><small>{Number(item.count || 0).toLocaleString('en-IN')} docs</small></article>)}</div><div className='table-scroll'><table className='resource-table'><thead><tr><th>Collection</th><th>Documents</th><th>Data size</th><th>Allocated</th><th>Indexes</th><th>Total size</th></tr></thead><tbody>{collections.map((item) => <tr key={item.name}><td><span className='cell-primary'>{item.name}</span></td><td>{Number(item.count || 0).toLocaleString('en-IN')}</td><td>{sizeLabel(item.dataSize)}</td><td>{sizeLabel(item.storageSize)}</td><td>{sizeLabel(item.indexSize)}</td><td><strong>{sizeLabel(item.totalSize)}</strong></td></tr>)}</tbody></table></div></section>}
    </>}

    {activeTab === 'images' && <section className='data-panel'>
      <div className='data-toolbar'><div className='search-box'><AdminIcon name='search'/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Search filename, title or context...'/></div><div className='record-count'>{visible.length} images</div><button className='admin-primary' type='button' onClick={() => setEditor({ mode: 'create', title: '', alt: '', context: 'storage', file: null, preview: '' })}><AdminIcon name='plus'/> Upload</button><button className='icon-button' type='button' onClick={load} aria-label='Refresh'><AdminIcon name='refresh'/></button></div>
      <div className='storage-context-strip'>{Object.entries(contextCounts).map(([context, count]) => <span key={context}>{context}: <strong>{count}</strong></span>)}</div>
      {loading ? <div className='admin-empty'><span className='loader'/><h3>Loading images...</h3></div> : visible.length ? <div className='storage-grid'>{visible.map((item) => <article className='storage-card' key={item._id}><a href={item.url} target='_blank' rel='noreferrer'><img src={item.url} alt={item.metadata?.alt || item.filename}/></a><div><small>{item.metadata?.context || 'admin'} - {sizeLabel(item.length)}</small><h3>{item.metadata?.title || item.filename}</h3><p>{item.filename}</p><label className='storage-live-url'><span>Live URL</span><input readOnly value={item.url}/></label><footer><a href={item.url} target='_blank' rel='noreferrer'><AdminIcon name='eye'/> Open URL</a><button type='button' onClick={() => navigator.clipboard?.writeText(item.url)}><AdminIcon name='copy'/> Copy URL</button><button type='button' onClick={() => setEditor({ ...item, mode: 'edit', title: item.metadata?.title || '', alt: item.metadata?.alt || '', context: item.metadata?.context || 'admin', preview: item.url })}><AdminIcon name='edit'/> Edit</button><button className='danger' type='button' onClick={() => setDeleting(item)}><AdminIcon name='trash'/> Delete</button></footer></div></article>)}</div> : <div className='admin-empty'><span className='empty-symbol'><AdminIcon name='image'/></span><h3>No GridFS images found</h3><p>Upload the first image to MongoDB.</p></div>}
    </section>}

    {activeTab === 'backup' && <section className='data-panel storage-backup-panel storage-backup-page'>
      <div><p className='eyebrow'>Backup centre</p><h3>Import / Export storage</h3><p>All uploaded images and website data can be backed up separately. Images restore into MongoDB GridFS; data restores every supported collection.</p></div>
      <div className='storage-backup-matrix'>
        <article><AdminIcon name='image'/><h4>Images backup</h4><p>Exports all input-uploaded images and other GridFS files with metadata and live URL source.</p><button className='admin-secondary' type='button' disabled={backupBusy === 'images'} onClick={() => downloadBackup('images')}>{backupBusy === 'images' ? 'Exporting...' : 'Export Images'}</button><button className='admin-primary' type='button' disabled={backupBusy === 'import-images'} onClick={() => imageImportRef.current?.click()}>{backupBusy === 'import-images' ? 'Importing...' : 'Import Images'}</button></article>
        <article><AdminIcon name='storage'/><h4>Data backup</h4><p>Exports website collections such as vehicles, parts, services, categories, pages, enquiries and activity data.</p><button className='admin-secondary' type='button' disabled={backupBusy === 'data'} onClick={() => downloadBackup('data')}>{backupBusy === 'data' ? 'Exporting...' : 'Export Data'}</button><button className='admin-primary' type='button' disabled={backupBusy === 'import-data'} onClick={() => dataImportRef.current?.click()}>{backupBusy === 'import-data' ? 'Importing...' : 'Import Data'}</button></article>
      </div>
      <input ref={imageImportRef} className='storage-backup-input' type='file' accept='application/json,.json' onChange={(event) => importBackup('images', event)} />
      <input ref={dataImportRef} className='storage-backup-input' type='file' accept='application/json,.json' onChange={(event) => importBackup('data', event)} />
    </section>}

    {editor && <div className='admin-modal-backdrop' role='presentation' onMouseDown={(event) => event.target === event.currentTarget && !saving && setEditor(null)}><section className='admin-modal storage-editor' role='dialog' aria-modal='true'><header><div><p className='eyebrow'>MongoDB GridFS</p><h2>{editor.mode === 'create' ? 'Upload image' : 'Edit image details'}</h2></div><button type='button' onClick={() => setEditor(null)}><AdminIcon name='close'/></button></header><form onSubmit={save}><div className='admin-form-grid'>{editor.mode === 'create' && <div className='admin-field wide'><label className='storage-upload-zone'><input type='file' accept='image/png,image/jpeg,image/webp,image/svg+xml' onChange={chooseFile}/>{editor.preview ? <img src={editor.preview} alt='Upload preview'/> : <span><AdminIcon name='image' size={28}/><strong>Choose image</strong><small>PNG, JPG, WEBP or SVG · Max 2 MB</small></span>}</label></div>}<div className='admin-field'><label>Title</label><input value={editor.title} onChange={(event) => setEditor((current) => ({ ...current, title: event.target.value }))}/></div><div className='admin-field'><label>Usage / context</label><input value={editor.context} onChange={(event) => setEditor((current) => ({ ...current, context: event.target.value }))}/></div><div className='admin-field wide'><label>Alternative text</label><input value={editor.alt} onChange={(event) => setEditor((current) => ({ ...current, alt: event.target.value }))}/></div></div><footer><button className='admin-secondary' type='button' onClick={() => setEditor(null)}>Cancel</button><button className='admin-primary' type='submit' disabled={saving}>{saving ? 'Saving...' : editor.mode === 'create' ? 'Store in GridFS' : 'Update details'}</button></footer></form></section></div>}

    {deleting && <div className='admin-modal-backdrop' role='presentation'><section className='admin-modal delete-confirm-modal' role='alertdialog' aria-modal='true'><div className='delete-confirm-icon'><AdminIcon name='trash' size={24}/></div><div className='delete-confirm-copy'><p className='eyebrow'>Confirm deletion</p><h2>Delete stored image?</h2><p>This permanently removes <strong>{deleting.metadata?.title || deleting.filename}</strong> from MongoDB GridFS.</p></div><footer><button className='admin-secondary' type='button' disabled={saving} onClick={() => setDeleting(null)}>Cancel</button><button className='admin-danger' type='button' disabled={saving} onClick={confirmDelete}><AdminIcon name='trash'/> {saving ? 'Deleting...' : 'Delete Image'}</button></footer></section></div>}
  </div>
}
