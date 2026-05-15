-- Migration number: 0005
ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN notes TEXT;
ALTER TABLE leads ADD COLUMN updated_at TEXT;

UPDATE leads SET updated_at = created_at WHERE updated_at IS NULL;

ALTER TABLE webhook_events ADD COLUMN processed_at TEXT;
ALTER TABLE webhook_events ADD COLUMN action_result TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
