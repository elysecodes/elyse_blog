import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPostBySlug } from '../lib/api'
import { formatDate } from '../lib/format'

function Paragraphs({ body }) {
  const blocks = String(body || '')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
  return blocks.map((block, i) => (
    <p key={i}>
      {block.split('\n').map((line, j) => (
        <span key={j}>
          {line}
          {j < block.split('\n').length - 1 && <br />}
        </span>
      ))}
    </p>
  ))
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setPost(undefined)
    setError('')
    fetchPostBySlug(slug)
      .then((data) => { if (active) setPost(data) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [slug])

  useEffect(() => {
    if (post?.title) document.title = `${post.title} | IRANKUNDA ELYSE`
    return () => { document.title = 'IRANKUNDA ELYSE | Software Developer Portfolio' }
  }, [post])

  return (
    <article className="blog-page">
      <div className="projects-page-top">
        <Link to="/blog" className="projects-back" aria-label="Back to blog">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          All posts
        </Link>
      </div>

      {error && <p className="blog-empty" role="alert">{error}</p>}
      {post === undefined && !error && <p className="blog-empty">Loading…</p>}
      {post === null && !error && (
        <div className="blog-empty">
          <p>That post doesn&apos;t exist or isn&apos;t published.</p>
          <Link to="/blog" className="adm-back-link">Back to the blog →</Link>
        </div>
      )}

      {post && (
        <article className="blog-article">
          {post.cover_url && <img className="blog-article-cover" src={post.cover_url} alt="" />}
          <time className="blog-card-date" dateTime={post.published_at || post.created_at}>
            {formatDate(post.published_at || post.created_at)}
          </time>
          <h1 className="blog-article-title">{post.title}</h1>
          {post.excerpt && <p className="blog-article-excerpt">{post.excerpt}</p>}
          <div className="blog-article-body">
            <Paragraphs body={post.body} />
          </div>
        </article>
      )}
    </article>
  )
}
