const crypto = require('crypto');
const { ApiError } = require('../middleware/core');
const db = require('../data/data');
const makeId = prefix => `${prefix}-${crypto.randomBytes(4).toString('hex')}`;
const notFound = (type, id) => { throw new ApiError(404, `${type} '${id}' not found`, 'NOT_FOUND'); };
const resource = (collection, type, prefix) => ({
  list: (req, res) => res.json(db[collection]),
  get: (req, res) => { const item = db[collection].find(x => x.id === req.params.id); if (!item) notFound(type, req.params.id); res.json(item); },
  create: (req, res) => { const item = { id: makeId(prefix), ...req.body }; db[collection].push(item); res.status(201).json(item); },
  update: (req, res) => { const index = db[collection].findIndex(x => x.id === req.params.id); if (index < 0) notFound(type, req.params.id); db[collection][index] = { ...db[collection][index], ...req.body }; res.json(db[collection][index]); },
  remove: (req, res) => { const index = db[collection].findIndex(x => x.id === req.params.id); if (index < 0) notFound(type, req.params.id); db[collection].splice(index, 1); res.status(204).send(); }
});
const users = resource('users', 'User', 'u');
const projects = resource('projects', 'Project', 'p');
const tasks = resource('tasks', 'Task', 't');
projects.list = (req, res) => { const result = req.query.status ? db.projects.filter(p => p.status === req.query.status) : db.projects; res.json(result); };
tasks.list = (req, res) => { let result = db.tasks.filter(t => (!req.query.status || t.status === req.query.status) && (!req.query.priority || t.priority === req.query.priority) && (!req.query.projectId || t.projectId === req.query.projectId)); if (req.query.sort) { const [field, direction] = req.query.sort.split(':'); result = [...result].sort((a,b) => String(a[field] ?? '').localeCompare(String(b[field] ?? '')) * (direction === 'desc' ? -1 : 1)); } res.json(result); };
tasks.create = (req, res) => { const item = { id: makeId('t'), createdAt: new Date().toISOString(), ...req.body }; db.tasks.push(item); res.status(201).json(item); };
tasks.cycleStatus = (req, res) => { const task = db.tasks.find(t => t.id === req.params.id); if (!task) notFound('Task', req.params.id); if (req.body.status) { task.status = req.body.status; } else { const cycle = ['todo','in-progress','review','blocked','done']; task.status = cycle[(cycle.indexOf(task.status) + 1) % cycle.length]; } res.json(task); };
const focus = {
  start: (req, res) => { if (!db.users.some(u => u.id === req.body.userId) || !db.tasks.some(t => t.id === req.body.taskId)) throw new ApiError(404, 'User or task not found', 'NOT_FOUND'); if (db.focusSessions.some(s => s.userId === req.body.userId && s.status === 'active')) throw new ApiError(409, 'User already has an active focus session', 'CONFLICT'); const session = { id: makeId('fs'), ...req.body, startTime: new Date().toISOString(), endTime: null, status: 'active', durationSeconds: 0, dailyTargetSeconds: 14400 }; db.focusSessions.push(session); res.status(201).json(session); },
  pause: (req, res) => transition(req, res, 'paused', 'focus_pause'),
  resume: (req, res) => transition(req, res, 'active', 'focus_resume'),
  stop: (req, res) => transition(req, res, 'completed', 'focus_stop'),
  today: (req, res) => { const now = Date.now(); const sessions = db.focusSessions.filter(s => (!req.query.userId || s.userId === req.query.userId) && new Date(s.startTime).toDateString() === new Date().toDateString()); const seconds = sessions.reduce((sum, s) => sum + elapsed(s, now), 0); const target = sessions[0]?.dailyTargetSeconds || 14400; res.json({ date: new Date().toISOString().slice(0,10), userId: req.query.userId || null, focusedSeconds: seconds, focusedHours: +(seconds / 3600).toFixed(2), dailyTargetSeconds: target, targetPercent: Math.min(100, +(seconds / target * 100).toFixed(1)) }); }
};
function elapsed(s, now = Date.now()) { if (s.status === 'completed') return s.durationSeconds || 0; if (s.status === 'active') return Math.max(0, Math.floor((now - new Date(s.startTime)) / 1000)); return s.durationSeconds || 0; }
function transition(req, res, status, eventType) { const s = db.focusSessions.find(x => x.id === req.body.sessionId); if (!s) notFound('Focus session', req.body.sessionId); if ((status === 'paused' && s.status !== 'active') || (status === 'active' && s.status !== 'paused') || (status === 'completed' && ['completed'].includes(s.status))) throw new ApiError(409, `Cannot transition session from '${s.status}' to '${status}'`, 'CONFLICT'); if (s.status === 'active' && status !== 'active') s.durationSeconds = (s.durationSeconds || 0) + elapsed(s); s.status = status; if (status === 'active') s.startTime = new Date().toISOString(); if (status === 'completed') s.endTime = new Date().toISOString(); db.activity.unshift({ id: makeId('act'), timestamp: new Date().toISOString(), type: eventType, message: `Focus session ${status}`, userId: s.userId, projectId: db.tasks.find(t => t.id === s.taskId)?.projectId }); res.json(s); }
const activity = (req, res) => { const days = req.query.range === 'monthly' ? 30 : 7; const cutoff = Date.now() - days * 86400000; res.json(db.activity.filter(a => new Date(a.timestamp).getTime() >= cutoff && (!req.query.projectId || a.projectId === req.query.projectId))); };
const velocity = (req, res) => { const completed = db.tasks.filter(t => t.status === 'done').length; res.json({ sprintDays: 14, completedTasks: completed, velocityPointsPerDay: +(completed * 3 / 14).toFixed(2) }); };
const contributions = (req, res) => { const result = {}; for (let i=364;i>=0;i--) { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-i); const key = d.toISOString().slice(0,10); result[key] = 0; } db.activity.filter(a => a.type === 'commit' || a.type === 'git_push').forEach(a => { const key = a.timestamp.slice(0,10); if (key in result) result[key]++; }); res.json(result); };
module.exports = { users, projects, tasks, focus, activity, velocity, contributions };
