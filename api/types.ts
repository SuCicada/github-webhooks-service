export interface WebhookType extends Record<string, any> {
    name: string,
    url: string,
}

export type UpdateRepoWebhooksType = Partial<RepoWebhooksType>;
export type RepoWebhooksType = GitHubRepoType;

// export interface RepoWebhooksType extends Record<string, any> {
//     id?: string,
//     repo?: string,
//     webhooks?: string[],
//     repo_update?: string,
//     permission?: string,
//     owner?: string,
//     html_url?: string,
// }

export interface GitHubRepoType extends Record<string, any> {
    repo: string,
    webhooks: string[],
    repo_update: string,
    permission: string,
    owner: string,
    html_url: string,
}
