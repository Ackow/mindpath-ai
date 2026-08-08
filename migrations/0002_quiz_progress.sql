CREATE TABLE IF NOT EXISTS quiz_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id TEXT NOT NULL,
  quiz_key TEXT NOT NULL,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, document_id, quiz_key)
);
