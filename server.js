// server.js - 보이드 다이버 랭킹 서버
const express = require('express');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json()); // JSON 요청 본문 파싱

// DB 파일 열기 (없으면 자동 생성)
const db = new Database('ranking.db');

// 랭킹 테이블 생성 (없을 때만)
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// [POST] /score - 점수 저장
app.post('/score', (req, res) => {
  const { name, score } = req.body;

  // 입력 검증
  if (typeof name !== 'string' || typeof score !== 'number') {
    return res.status(400).json({ error: 'invalid name or score' });
  }

  // DB에 삽입 (prepared statement로 SQL 인젝션 방지)
  const stmt = db.prepare('INSERT INTO scores (name, score) VALUES (?, ?)');
  const info = stmt.run(name, score);

  res.json({ success: true, id: info.lastInsertRowid });
});

// [GET] /ranking - 상위 10개 조회
app.get('/ranking', (req, res) => {
  // 점수 높은 순 상위 10개
  const rows = db.prepare(
    'SELECT name, score FROM scores ORDER BY score DESC LIMIT 10'
  ).all();

  res.json(rows);
});

// 서버 실행
const PORT = process.env.PORT || 3000; // Render가 주는 포트, 없으면 로컬 3000
app.listen(PORT, () => {
  console.log(`Ranking server running on port ${PORT}`);
});