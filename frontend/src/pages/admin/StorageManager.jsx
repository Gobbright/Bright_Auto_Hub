import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api.js'
import AdminIcon from './AdminIcon.jsx'

const sizeLabel = (bytes = 0) => bytes < 1024 * 1024 ? Math.max(1, Math.round(bytes / 1024)) + ' KB' : (bytes / 1024 / 1024).toFixed(2) + ' MB'

export default function StorageManager({ openToken = 0, onDataChange }) {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [notice, setNotice] = useState({ kind: '', message: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try { setItems(await api.get('/storage')) }
    catch (error) { setNotice({ kind: 'error', message: error.message }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { if (openToken > 0) setEditor({ mode: 'create', title: '', alt: '', context: 'storage', file: null, preview: '' }) }, [openToken])

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

  return <div className='manager-page storage-page'>
    <div className='page-intro'><div><p className='eyebrow'>MongoDB GridFS</p><h2>Image Gallery</h2><p>Upload, preview and manage every database image with its exact file size.</p></div><button className='admin-primary' type='button' onClick={() => setEditor({ mode: 'create', title: '', alt: '', context: 'storage', file: null, preview: '' })}><AdminIcon name='plus'/> Add Image</button></div>
    {notice.message && <div className={'admin-notice ' + notice.kind}>{notice.message}</div>}
    <div className='storage-summary'><div><span>Total images</span><strong>{items.length}</strong></div><div><span>GridFS usage</span><strong>{sizeLabel(items.reduce((sum, item) => sum + item.length, 0))}</strong></div><div><span>Database</span><strong>goautomobile</strong></div></div>
    <section className='data-panel'>
      <div className='data-toolbar'><div className='search-box'><AdminIcon name='search'/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Search filename, title or context...'/></div><div className='record-count'>{visible.length} images</div><button className='icon-button' type='button' onClick={load} aria-label='Refresh'><AdminIcon name='refresh'/></button></div>
      {loading ? <div className='admin-empty'><span className='loader'/><h3>Loading images...</h3></div> : visible.length ? <div className='storage-grid'>{visible.map((item) => <article className='storage-card' key={item._id}><a href={item.url} target='_blank' rel='noreferrer'><img src={item.url} alt={item.metadata?.alt || item.filename}/></a><div><small>{item.metadata?.context || 'admin'} · {sizeLabel(item.length)}</small><h3>{item.metadata?.title || item.filename}</h3><p>{item.filename}</p><footer><button type='button' onClick={() => setEditor({ ...item, mode: 'edit', title: item.metadata?.title || '', alt: item.metadata?.alt || '', context: item.metadata?.context || 'admin', preview: item.url })}><AdminIcon name='edit'/> Edit</button><button className='danger' type='button' onClick={() => setDeleting(item)}><AdminIcon name='trash'/> Delete</button></footer></div></article>)}</div> : <div className='admin-empty'><span className='empty-symbol'><AdminIcon name='image'/></span><h3>No GridFS images found</h3><p>Upload the first image to MongoDB.</p></div>}
    </section>

    {editor && <div className='admin-modal-backdrop' role='presentation' onMouseDown={(event) => event.target === event.currentTarget && !saving && setEditor(null)}><section className='admin-modal storage-editor' role='dialog' aria-modal='true'><header><div><p className='eyebrow'>MongoDB GridFS</p><h2>{editor.mode === 'create' ? 'Upload image' : 'Edit image details'}</h2></div><button type='button' onClick={() => setEditor(null)}><AdminIcon name='close'/></button></header><form onSubmit={save}><div className='admin-form-grid'>{editor.mode === 'create' && <div className='admin-field wide'><label className='storage-upload-zone'><input type='file' accept='image/png,image/jpeg,image/webp,image/svg+xml' onChange={chooseFile}/>{editor.preview ? <img src={editor.preview} alt='Upload preview'/> : <span><AdminIcon name='image' size={28}/><strong>Choose image</strong><small>PNG, JPG, WEBP or SVG · Max 2 MB</small></span>}</label></div>}<div className='admin-field'><label>Title</label><input value={editor.title} onChange={(event) => setEditor((current) => ({ ...current, title: event.target.value }))}/></div><div className='admin-field'><label>Usage / context</label><input value={editor.context} onChange={(event) => setEditor((current) => ({ ...current, context: event.target.value }))}/></div><div className='admin-field wide'><label>Alternative text</label><input value={editor.alt} onChange={(event) => setEditor((current) => ({ ...current, alt: event.target.value }))}/></div></div><footer><button className='admin-secondary' type='button' onClick={() => setEditor(null)}>Cancel</button><button className='admin-primary' type='submit' disabled={saving}>{saving ? 'Saving...' : editor.mode === 'create' ? 'Store in GridFS' : 'Update details'}</button></footer></form></section></div>}

    {deleting && <div className='admin-modal-backdrop' role='presentation'><section className='admin-modal delete-confirm-modal' role='alertdialog' aria-modal='true'><div className='delete-confirm-icon'><AdminIcon name='trash' size={24}/></div><div className='delete-confirm-copy'><p className='eyebrow'>Confirm deletion</p><h2>Delete stored image?</h2><p>This permanently removes <strong>{deleting.metadata?.title || deleting.filename}</strong> from MongoDB GridFS.</p></div><footer><button className='admin-secondary' type='button' disabled={saving} onClick={() => setDeleting(null)}>Cancel</button><button className='admin-danger' type='button' disabled={saving} onClick={confirmDelete}><AdminIcon name='trash'/> {saving ? 'Deleting...' : 'Delete Image'}</button></footer></section></div>}
  </div>
}
