// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
// import {Octokit} from "@octokit/core";
import {Octokit} from "@octokit/rest";
import {GitHubRepoType} from "./types";
import {RestEndpointMethods} from "@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types";
import {Api} from "@octokit/plugin-rest-endpoint-methods/dist-types/types";

// import async from "async";
// import {components} from "@octokit/openapi-types";
import pLimit from "p-limit";
// import fetch from "node-fetch";
// const fetch = require('node-fetch');

export class GitHubApi {
    octokit: {
        paginate: import("@octokit/plugin-paginate-rest").PaginateInterface
    } & RestEndpointMethods & Api & Octokit

    constructor() {
        let token = process.env.GITHUB_TOKEN;
        // console.log("token", token)
        const octokit: {
            paginate: import("@octokit/plugin-paginate-rest").PaginateInterface
        } & RestEndpointMethods & Api & Octokit = new Octokit({auth: token,
            // request: {fetch: fetch},
            // log: {
                // debug: console.log,
                // info: console.log,
                // warn: console.log,
                // error: console.log
            // }
        });
        this.octokit = octokit
    }

    async getMe() {
        let me = await this.octokit.rest.users.getAuthenticated()
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
            process.exit(1);
        }
    }

    async getRepoInfo() {
        let me = (await this.getMe()).data
        let login = me.login
        console.log("[GitHubApi] login: ", login)

        let reposCount = me.public_repos + me.owned_private_repos
        let pageCnt = Math.ceil(reposCount / 100)
        let acts =
            // async.mapLimit(
            Array.from({length: pageCnt}, (_, index) => index + 1)
                .map(i => async () => {
                    // 1,
                    // async (i:number) => {
                    let res = await this.octokit.rest.repos.listForAuthenticatedUser({
                        // sort: "updated",
                        per_page: 100,
                        page: i
                    })
                    console.log(`[GitHubApi] listForAuthenticatedUser: ${i}/${pageCnt}`)
                    return res.data
                })
        let repos0 = await Promise.all(acts.map(a => a()))
        // let repos0 = await acts

        let repos = repos0
            .flat()
            .filter(r => r.owner.login === login)
            .filter(r => r.name !== "utils")

        console.log("[GitHubApi] repos: ", repos.length)
        let index = 0
        // let resActs = await async.mapLimit(repos, 10,
        let resActs = repos
            .map(
                // async (r: components["schemas"]["repository"]) => {
                r => async () =>{
                    // })
                    try {
                        // let resActs1 = repos
                        //     .map(r => async () => {
                        let hooks = await this.getWebhooks(r.owner.login, r.name)
                        let hookUrls = hooks.data.map(h => h.config.url)
                        let permission = r.private ? "private" : "public"
                        let updated_at = r.pushed_at
                        let res: GitHubRepoType = {
                            repo: r.name,
                            webhooks: hookUrls,
                            repo_update: updated_at,
                            permission,
                            owner: r.owner.login,
                            html_url: r.html_url,
                        }
                        // console.log(`[GitHubApi] getWebhooks: ${index}/${repos.length}`)
                        index++
                        return res
                    } catch (error) {
                        console.error('An error occurred:', r, error);
                        // return null;
                        process.exit(1);
                    }
                })
        // let limit = pLimit(10)
        // let res = await Promise.all(resActs.map(r => limit(r)))
        let res = await  promiseAllInBatches(resActs.map(r => r()), 1)
        // let res = resActs
        res = res
            // .filter(r => r !== null)
            .sort((a, b) =>
                // if b > a: [b, a]
                b.repo_update.localeCompare(a.repo_update)
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
async function promiseAllInBatches<T>(items:Promise<T>[], batchSize:number) {
    let position = 0;
    let results:T[] = [];
    while (position < items.length) {
        const itemsForBatch = items.slice(position, position + batchSize);
        results = [...results, ...await Promise.all(itemsForBatch)];
        position += batchSize;
    }
    return results;
}
