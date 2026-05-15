-- Migration number: 0003
ALTER TABLE projects ADD COLUMN image_url TEXT;
ALTER TABLE projects ADD COLUMN tags TEXT;
ALTER TABLE projects ADD COLUMN seo_title TEXT;
ALTER TABLE projects ADD COLUMN seo_description TEXT;

ALTER TABLE articles ADD COLUMN image_url TEXT;
ALTER TABLE articles ADD COLUMN tags TEXT;
ALTER TABLE articles ADD COLUMN category TEXT;
ALTER TABLE articles ADD COLUMN seo_title TEXT;
ALTER TABLE articles ADD COLUMN seo_description TEXT;

CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'contact',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS ai_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    kind TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    provider TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    reset_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at);
CREATE INDEX IF NOT EXISTS idx_projects_status_created ON projects(status, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_ai_history_created ON ai_history(created_at);
