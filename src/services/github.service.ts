import NodeCache from "node-cache";
import 'dotenv/config';
import { GitHubData, GitHubProfile, GitHubRepo } from '../types/github.types.js';

const cache = new NodeCache({ stdTTL: 3600 });

const headers = process.env.GITHUB_TOKEN ? {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "GitHub-SVG-App"
} : { "User-Agent": "GitHub-SVG-App" };

async function fetchAllRepos(username: string): Promise<GitHubRepo[]> {
    let repos: GitHubRepo[] = [];
    let page = 1;
    while (true) {
        const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`, { headers });
        if (!res.ok) throw new Error(`Erro ao buscar repos: ${res.status}`);
        const data = await res.json() as GitHubRepo[];  // <-- Type assertion aqui
        if (data.length === 0) break;
        repos = [...repos, ...data];
        page++;
    }
    return repos;
}

export async function fetchGitHubUser(username: string): Promise<GitHubData> {
    const cached = cache.get<GitHubData>(username);  // <-- Genérico para cache
    if (cached) return cached;

    const profileRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!profileRes.ok) {
        if (profileRes.status === 404) throw new Error('Usuário não encontrado');
        throw new Error(`Erro ao buscar perfil: ${profileRes.status}`);
    }
    const profile = await profileRes.json() as GitHubProfile;  // <-- Type assertion aqui

    const repos = await fetchAllRepos(username);

    const metrics = {
        registeredYears: Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)),
        totalRepos: repos.length,
        totalForks: repos.reduce((sum, r) => sum + r.forks_count, 0),
        stargazers: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
        forks: repos.reduce((sum, r) => sum + r.forks_count, 0),
        watchers: repos.reduce((sum, r) => sum + r.watchers_count, 0),
        languages: Array.from(new Set(repos.map(r => r.language).filter(Boolean))),
        followers: profile.followers,
    };

    const data: GitHubData = { profile, repos, metrics };
    cache.set(username, data);
    return data;
}