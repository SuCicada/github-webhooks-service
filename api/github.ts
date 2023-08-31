// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
// import {Octokit} from "@octokit/core";
import {Octokit} from "@octokit/rest";
import {GitHubRepoType} from "./types";


export class GitHubApi {
    octokit: Octokit

    constructor() {
        let token = process.env.GITHUB_TOKEN;
        const octokit = new Octokit({auth: token});
        this.octokit = octokit
    }

    async getMe() {
        let me = this.octokit.rest.users.getAuthenticated()
        return me
    }

    async getWebhooks(owner: string, repo: string) {
        // console.log(owner, repo)
        try {
            return await this.octokit.rest.repos.listWebhooks({
                owner: owner,
                repo: repo
            })
        } catch (error) {
            console.error('An error occurred:', owner, repo, error);
            return null;
        }
    }

    async getRepoInfo() {
        let me = (await this.getMe()).data
        let login = me.login

        let reposCount = me.public_repos + me.owned_private_repos
        let pageCnt = Math.ceil(reposCount / 100)
        let acts = Array.from({length: pageCnt}, (_, index) => index + 1)
            .map(i => async () => {
                let res = await this.octokit.rest.repos.listForAuthenticatedUser({
                    sort: "updated",
                    per_page: 100,
                    page: i
                })
                return res.data
            })
        let repos0 = await Promise.all(acts.map(r => r()))
        let repos = repos0
            .flat()
            .filter(r => r.owner.login === login)
            .filter(r => r.name !== "utils")

        let resActs = repos
            .map(r => async () => {
                let hooks = await this.getWebhooks(r.owner.login, r.name)
                let hookUrls = hooks.data.map(h => h.config.url)
                let permission = r.private ? "private" : "public"
                let updated_at = r.updated_at
                let res: GitHubRepoType = {
                    repo: r.name, webhooks: hookUrls, repo_update: updated_at, permission,
                    owner: r.owner.login,
                    html_url: r.html_url,
                }
                return res
            })

        let res = await Promise.all(resActs.map(r => r()))
        res = res
            .sort((a, b) =>
                // @ts-ignore
                b.repo_update - a.repo_update
            )
        // res = res.map(r => {
        //     return {
        //         repo: r.repo,
        //         webhooks: r.webhooks,
        //         repo_update: r.repo_update,
        //         permission: r.permission,
        //     }
        // })
        console.log("[GitHubApi] getRepoInfo over")
        return res
    }

    async getAllUsedWebhooks() {
        let repoInfos = await this.getRepoInfo()
        let res = repoInfos
            .map(r => r.webhooks)
            .flat()
        // res = Array.from(new Set(res))
        res = [...new Set(res)]
        return res
    }

    async updateWebhook(owner: string, repo: string, webhooks: string[]) {
        let hooks = await this.getWebhooks(owner, repo)
        let deleteActs = hooks.data.map(async (h) => {
            await this.octokit.rest.repos.deleteWebhook({
                owner: owner,
                repo: repo,
                hook_id: h.id
            })
            console.log(`[updateWebhook] ${owner} ${repo}: delete ${h.id} success`)
        })

        let createActs = webhooks.map(async (webhook) => {
            await this.octokit.rest.repos.createWebhook({
                owner: owner,
                repo: repo,
                config: {
                    url: webhook,
                    content_type: "json",
                },
                events: ["*"],
            })
            console.log(`[updateWebhook] ${owner} ${repo}: create ${webhook} success`)
        })

        await Promise.all([...deleteActs, ...createActs])
    }
}

// exports.GitHubApi = GitHubApi
