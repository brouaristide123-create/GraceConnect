const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { signToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();
const db = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    // Super Admin
    const admin = await db.superAdmin.findUnique({ where: { email } });
    if (admin && await bcrypt.compare(password, admin.passwordHash)) {
      const token = signToken({ id: admin.id, email: admin.email, role: 'superadmin' });
      return res.json({ token, role: 'superadmin', user: { id: admin.id, name: admin.name, email: admin.email, role: 'superadmin' } });
    }

    // Church login
    const church = await db.church.findUnique({ where: { ownerEmail: email } });
    if (church && await bcrypt.compare(password, church.passwordHash)) {
      if (church.status === 'suspended') return res.status(403).json({ error: 'Compte suspendu' });
      const token = signToken({ id: church.id, email: church.ownerEmail, role: 'church', churchId: church.id });
      return res.json({
        token, role: 'church',
        user: { id: church.id, name: church.name, email: church.ownerEmail, role: 'church', mustChangePassword: church.mustChangePassword },
        church
      });
    }

    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'superadmin') {
      const admin = await db.superAdmin.findUnique({ where: { id: req.user.id }, select: { id: true, email: true, name: true } });
      return res.json({ ...admin, role: 'superadmin' });
    }
    if (req.user.role === 'church') {
      const church = await db.church.findUnique({ where: { id: req.user.churchId } });
      return res.json({ ...church, role: 'church' });
    }
    res.status(401).json({ error: 'Non autorisé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Mot de passe trop court (min 6 caractères)' });
    const hash = await bcrypt.hash(newPassword, 10);

    if (req.user.role === 'church') {
      const church = await db.church.findUnique({ where: { id: req.user.churchId } });
      if (!church.mustChangePassword && !(await bcrypt.compare(currentPassword, church.passwordHash))) {
        return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
      }
      await db.church.update({ where: { id: req.user.churchId }, data: { passwordHash: hash, mustChangePassword: false } });
    } else if (req.user.role === 'superadmin') {
      const admin = await db.superAdmin.findUnique({ where: { id: req.user.id } });
      if (!(await bcrypt.compare(currentPassword, admin.passwordHash))) {
        return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
      }
      await db.superAdmin.update({ where: { id: req.user.id }, data: { passwordHash: hash } });
    }

    res.json({ message: 'Mot de passe mis à jour' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
