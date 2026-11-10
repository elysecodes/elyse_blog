import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPublishedPosts } from '../lib/api'
import { formatDate } from '../lib/format'

export default function BlogPage() {
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchPublishedPosts()
      .then((data) => { if (active) setPosts(data ?? []) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    document.title = 'Blog | IRANKUNDA ELYSE'
  }, [])

  return (
    <div className="blog-page">
      <div className="projects-page-top">
        <Link to="/" className="projects-back" aria-label="Back to homepage">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Home
        </Link>
      </div>

      <header className="blog-header">
        <span className="section-label">Blog</span>
        <h1 className="section-title">Notes &amp; write-ups</h1>
        <p className="section-subtitle">Things I build, learn and care about.</p>
      </header>

      {error && <p className="blog-empty" role="alert">{error}</p>}
      {!error && posts === null && <p className="blog-empty">Loading…</p>}
      {!error && posts?.length === 0 && (
        <p className="blog-empty">No posts published yet. Check back soon.</p>
      )}

      {posts?.length > 0 && (
        <ul className="blog-list" role="list">
          {posts.map((post) => (
            <li key={post.id}>
              <Link to={`/blog/${post.slug}`} className="blog-card">
                {post.cover_url && (
                  <img className="blog-card-cover" src={post.cover_url} alt="" loading="lazy" />
                )}
                <div className="blog-card-body">
                  <time className="blog-card-date" dateTime={post.published_at || post.created_at}>
                    {formatDate(post.published_at || post.created_at)}
                  </time>
                  <h2 className="blog-card-title">{post.title}</h2>
                  {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
                  <span className="blog-card-more">Read post →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
