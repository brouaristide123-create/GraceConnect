const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/churches',      require('./routes/churches'));
app.use('/api/members',       require('./routes/members'));
app.use('/api/families',      require('./routes/families'));
app.use('/api/departments',   require('./routes/departments'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/contributions', require('./routes/contributions'));
app.use('/api/expenses',      require('./routes/expenses'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/employees',     require('./routes/employees'));
app.use('/api/admin',         require('./routes/admin'));

// ── Serve Frontend ────────────────────────────────────────────────────────────
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Route API introuvable' });
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ GraceConnect backend running on port ${PORT}`);
});
