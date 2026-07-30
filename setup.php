<?php
$db = new SQLite3('licenses.db');
$db->exec("CREATE TABLE IF NOT EXISTS licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    fingerprint TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    activated_at DATETIME,
    status TEXT DEFAULT 'active'
)");
echo "✅ Banco de dados criado com sucesso!";
?>