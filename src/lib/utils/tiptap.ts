/* Render TipTap JSON content to safe HTML */

type TipTapMark = {
  type: string
  attrs?: Record<string, string | number | boolean | null>
}

type TipTapNode = {
  type: string
  text?: string
  attrs?: Record<string, string | number | boolean | null>
  marks?: TipTapMark[]
  content?: TipTapNode[]
}

function renderMark(text: string, mark: TipTapMark): string {
  switch (mark.type) {
    case 'bold':      return `<strong>${text}</strong>`
    case 'italic':    return `<em>${text}</em>`
    case 'strike':    return `<s>${text}</s>`
    case 'underline': return `<u>${text}</u>`
    case 'code':      return `<code>${text}</code>`
    case 'link': {
      const href = String(mark.attrs?.href ?? '#')
      const target = mark.attrs?.target ? ` target="${mark.attrs.target}"` : ''
      return `<a href="${href}"${target} rel="noopener noreferrer">${text}</a>`
    }
    default: return text
  }
}

function renderNode(node: TipTapNode): string {
  if (!node) return ''

  // Text node
  if (node.type === 'text') {
    let t = (node.text ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    for (const mark of node.marks ?? []) {
      t = renderMark(t, mark)
    }
    return t
  }

  const inner = (node.content ?? []).map(renderNode).join('')

  switch (node.type) {
    case 'doc':           return inner
    case 'paragraph':     return `<p>${inner || '&nbsp;'}</p>`
    case 'heading': {
      const lvl = Number(node.attrs?.level ?? 2)
      return `<h${lvl}>${inner}</h${lvl}>`
    }
    case 'bulletList':    return `<ul>${inner}</ul>`
    case 'orderedList':   return `<ol>${inner}</ol>`
    case 'listItem':      return `<li>${inner}</li>`
    case 'blockquote':    return `<blockquote>${inner}</blockquote>`
    case 'codeBlock':     return `<pre><code>${inner}</code></pre>`
    case 'hardBreak':     return '<br>'
    case 'horizontalRule':return '<hr>'
    case 'image': {
      const src = String(node.attrs?.src ?? '')
      const alt = String(node.attrs?.alt ?? '')
      return `<img src="${src}" alt="${alt}" />`
    }
    case 'table': return `<table>${inner}</table>`
    case 'tableRow':      return `<tr>${inner}</tr>`
    case 'tableHeader':   return `<th>${inner}</th>`
    case 'tableCell':     return `<td>${inner}</td>`
    default:              return inner
  }
}

export function renderTipTap(content: unknown): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  try {
    return renderNode(content as TipTapNode)
  } catch {
    return ''
  }
}
