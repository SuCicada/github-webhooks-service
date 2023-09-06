export interface WebhookType extends Record<string, any> {
    name: string,
    url: string,
}

export interface UpdateRepoWebhooksType extends Partial<RepoWebhooksType> {
}

export interface RepoWebhooksType extends GitHubRepoType {
    id: string,
    webhooks: string[],  //  url tag, not real
}

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
    webhooks: string[], // real url
    repo_update: string,
    permission: string,
    owner: string,
    html_url: string,
}


export interface ApiConfig {
    server: {
        password: string,
    }
    web: {
        baseUrl: string,
    }
    notion: {
        database: {
            RepoWebhooks: string,
            Webhooks: string,
        }
        button: Record<string, string>,
        // [name: string]: string;
        // }
    }
    apiConfig: {}
}
