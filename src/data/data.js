const daysAgo = (days, hour = 10) => { const d = new Date(); d.setDate(d.getDate() - days); d.setHours(hour, 0, 0, 0); return d.toISOString(); };

const users = [
  { id: 'u-alice', username: 'Alice', role: 'LEAD FRONTEND', avatarInitials: 'AL', velocityPercent: 92, activeTaskCount: 3, completedTaskCount: 28, checkoutToken: 'co_alice' },
  { id: 'u-bob', username: 'Bob', role: 'SECURITY & BACKEND', avatarInitials: 'BO', velocityPercent: 86, activeTaskCount: 2, completedTaskCount: 24, checkoutToken: 'co_bob' },
  { id: 'u-charlie', username: 'Charlie', role: 'INFRASTRUCTURE', avatarInitials: 'CH', velocityPercent: 78, activeTaskCount: 2, completedTaskCount: 19, checkoutToken: 'co_charlie' },
  { id: 'u-dave', username: 'Dave', role: 'PRODUCT DESIGN', avatarInitials: 'DA', velocityPercent: 88, activeTaskCount: 1, completedTaskCount: 22, checkoutToken: 'co_dave' }
];

const projects = [
  { id: 'p-pulse-core', name: 'pulse-core', branch: 'main', status: 'in-progress', linesAdded: 18420, linesRemoved: 3210, progressPercent: 72, techStack: ['React', 'Node.js', 'TypeScript'], ownerIds: ['u-alice', 'u-bob'], dueDate: '2026-09-18' },
  { id: 'p-query-engine', name: 'query-engine', branch: 'feature/streaming', status: 'review', linesAdded: 9630, linesRemoved: 1440, progressPercent: 88, techStack: ['Node.js', 'PostgreSQL', 'Redis'], ownerIds: ['u-bob'], dueDate: '2026-09-10' },
  { id: 'p-auth-service', name: 'auth-service', branch: 'release/v2', status: 'done', linesAdded: 7420, linesRemoved: 980, progressPercent: 100, techStack: ['Go', 'OAuth2', 'JWT'], ownerIds: ['u-bob', 'u-charlie'], dueDate: '2026-08-29' },
  { id: 'p-infra-deploy', name: 'infra-deploy', branch: 'main', status: 'blocked', linesAdded: 3280, linesRemoved: 620, progressPercent: 46, techStack: ['Docker', 'Kubernetes', 'Terraform'], ownerIds: ['u-charlie'], dueDate: '2026-09-25' },
  { id: 'p-design-system', name: 'design-system', branch: 'feature/tokens', status: 'in-progress', linesAdded: 5210, linesRemoved: 870, progressPercent: 64, techStack: ['Figma', 'Storybook', 'CSS'], ownerIds: ['u-alice', 'u-dave'], dueDate: '2026-09-21' }
];

const tasks = [
  { id: 'f8e3c1d', title: 'Implement streaming query cache', projectId: 'p-query-engine', status: 'in-progress', priority: 'high', assigneeId: 'u-bob', createdAt: daysAgo(8), targetDate: '2026-09-06' },
  { id: 'a12b7ef', title: 'Add keyboard navigation to command palette', projectId: 'p-pulse-core', status: 'review', priority: 'medium', assigneeId: 'u-alice', createdAt: daysAgo(6), targetDate: '2026-09-04' },
  { id: 'c44d9aa', title: 'Rotate production service credentials', projectId: 'p-auth-service', status: 'done', priority: 'critical', assigneeId: 'u-bob', createdAt: daysAgo(14), targetDate: '2026-08-29' },
  { id: '7bd21f0', title: 'Fix staging cluster autoscaler', projectId: 'p-infra-deploy', status: 'blocked', priority: 'critical', assigneeId: 'u-charlie', createdAt: daysAgo(5), targetDate: '2026-09-08' },
  { id: 'e92ab31', title: 'Publish semantic color tokens', projectId: 'p-design-system', status: 'in-progress', priority: 'high', assigneeId: 'u-dave', createdAt: daysAgo(4), targetDate: '2026-09-12' },
  { id: 'd10fe88', title: 'Write API contract tests', projectId: 'p-pulse-core', status: 'todo', priority: 'medium', assigneeId: 'u-alice', createdAt: daysAgo(3), targetDate: '2026-09-15' },
  { id: 'b09c3a2', title: 'Upgrade dependency audit pipeline', projectId: 'p-infra-deploy', status: 'todo', priority: 'low', assigneeId: 'u-charlie', createdAt: daysAgo(2), targetDate: '2026-09-20' },
  { id: '91aa4bc', title: 'Document OAuth callback flow', projectId: 'p-auth-service', status: 'done', priority: 'low', assigneeId: 'u-dave', createdAt: daysAgo(20), targetDate: '2026-08-28' }
];

const focusSessions = [{ id: 'fs-seed', userId: 'u-alice', taskId: 'a12b7ef', startTime: daysAgo(0, 8), endTime: daysAgo(0, 9), status: 'completed', durationSeconds: 3600, dailyTargetSeconds: 14400 }];
const activity = [
  { id: 'act-1', timestamp: daysAgo(0, 9), type: 'focus_stop', message: 'Alice completed a focus session', userId: 'u-alice', projectId: 'p-pulse-core' },
  { id: 'act-2', timestamp: daysAgo(1, 16), type: 'pr_merged', message: 'PR #184 merged into main', userId: 'u-bob', projectId: 'p-query-engine' },
  { id: 'act-3', timestamp: daysAgo(2, 11), type: 'git_push', message: 'Pushed 12 commits to feature/tokens', userId: 'u-dave', projectId: 'p-design-system' },
  { id: 'act-4', timestamp: daysAgo(3, 14), type: 'metrics_publish', message: 'Weekly engineering metrics published', userId: 'u-charlie', projectId: 'p-infra-deploy' },
  { id: 'act-5', timestamp: daysAgo(5, 10), type: 'commit', message: 'Added cache invalidation tests', userId: 'u-bob', projectId: 'p-query-engine' }
];
const settings = { developerHandle: 'pulse-team', workspaceRoot: '/workspace/pulse.dev', syncIntervalSeconds: 30, enableGitStream: true, telemetryReporting: false, colorThemeAccent: '#8B5CF6', editorKeybindings: 'vscode' };
module.exports = { users, projects, tasks, focusSessions, activity, settings };
