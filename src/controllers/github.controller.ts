import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { fetchGitHubUser } from '../services/github.service.js';
import { generateSVG } from '../utils/svg.generator.js';
import { GitHubData } from '../types/github.types.js';

const usernameSchema = z.string().min(1).max(39).regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, 'Username inválido');

export async function getGitHubSvg(req: Request, res: Response, next: NextFunction): Promise<void> {  // Tipagem explícita
    try {
        const username = usernameSchema.parse(req.params.username);

        const data: GitHubData = await fetchGitHubUser(username);
        const svg = generateSVG(username, data);
        res.setHeader("Content-Type", "image/svg+xml");
        res.send(svg);
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).send(generateErrorSVG('Username inválido'));
        } else if (err instanceof Error && err.message === 'Usuário não encontrado') {
            res.status(404).send(generateErrorSVG('Usuário não encontrado'));
        } else {
            next(err); // Passa para middleware de erros
        }
    }
}

function generateErrorSVG(message: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg"><text x="10" y="20" fill="red">${message}</text></svg>`;
}