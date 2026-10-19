CREATE TABLE IF NOT EXISTS destinations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  destination   VARCHAR(150) NOT NULL,
  country       VARCHAR(100) NOT NULL,
  category      VARCHAR(50),
  best_season   VARCHAR(50),
  avg_cost_usd  INTEGER,
  rating        REAL,
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
