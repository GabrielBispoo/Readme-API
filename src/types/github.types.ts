export interface GitHubProfile {
    login: string;
    name: string | null;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
    // Adicione mais campos conforme necessário
}

export interface GitHubRepo {
    name: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    watchers_count: number;
    // Adicione mais
}

export interface GitHubData {
    profile: GitHubProfile;
    repos: GitHubRepo[];
    metrics: {
        totalRepos: number;
        totalForks: number;
        totalSize?: number;
        prOpened?: number;
        followers?: number;
        commits?: number;
        prReviewed?: number;
        issuesOpened?: number;
        issueComments?: number;
        stargazers?: number;
        forks?: number;
        packages?: number;
        frameworks?: string[];
        databases?: string[];
    };
}