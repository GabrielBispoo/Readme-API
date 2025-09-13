import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { getGitHubSvg } from './controllers/github.controller.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet()); // Segurança headers
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // Rate limit: 100 req/15min

app.get('/github-svg/:username', getGitHubSvg);

// Middleware de erros global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err); // Logging simples; use Pino em prod
    res.status(500).send('<svg xmlns="http://www.w3.org/2000/svg"><text x="10" y="20" fill="red">Erro interno</text></svg>');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));