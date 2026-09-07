const app = require('./app');
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log(`Pulse.dev backend listening on http://localhost:${PORT}`));
