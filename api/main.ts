import {GitHubApi} from "./github";
import {NotionApi} from "./notion";
import {UpdateRepoWebhooksType} from "./types";
import {array2map, GitHubRepoType2RepoWebhooksType, RepoWebhooksType2GitHubRepoType} from "./utils";
import isEqual from "lodash/isEqual";
import _ from "lodash";
import {apiConfig} from "./config";


export class Service {
    github = new GitHubApi()
    notion = new NotionApi()
    // apiConfig: ApiConfig

    // constructor() {
    //     this.apiConfig
    // }

    /**
     * update notion: from github all webhooks
     * */
    async saveCurrentWebhooks() {
        let webhooks = await this.github.getAllUsedWebhooks()
        // webhooks.forEach(console.log)
        console.log(webhooks)
        let acts = webhooks.map(async (url) => {
            await this.notion.webhooks.set("", url)
        })
        await Promise.all(acts)
    }

    /**
     * update notion: properties: multi select
     * */
    async updateHooksSelect() {
        let data = await this.notion.webhooks.getAll()
        let webhooks = data.map(w => {
            return {name: w.name}
        })

        await Promise.all([
            this.notion.repoWebhooks.updateHooksSelect("webhooks", webhooks)
            // , notion.repoWebhooks.updateHooksSelect("permission",
            //     [{name: "public", color: "green"},
            //         {name: "private", color: "yellow"},]
            // )
        ])
    }


    /**
     *
     * */
    async updateNotionRepoInfo(deepSync: boolean = false) {
        // let webhooks = await notion.webhooks.getAll()
        // let nowRepoInfos = await notion.repoWebhooks.getAll()
        let [webhooks, nowRepoInfos, repoInfos] = await Promise.all([
            this.notion.webhooks.getAll(),
            this.notion.repoWebhooks.getAll(),
            this.github.getRepoInfo(),
        ])
        console.log("notion webhooks: ", webhooks.length)
        console.log("notion repoWebhooks: ", nowRepoInfos.length)
        console.log("github repoInfos: ", repoInfos.length)

        let nowRepoInfoMap = array2map(nowRepoInfos, "repo")
        // repoInfos = repoInfos.slice(0, 3)
        let fromGitRepos = repoInfos.map(r => GitHubRepoType2RepoWebhooksType(webhooks, r))
        let acts = fromGitRepos
            .filter(r => {
                return nowRepoInfoMap[r.repo] === undefined
            })
            .map(async (r) => {
                // let repoWebhooks: RepoWebhooksType = GitHubRepoType2RepoWebhooksType(webhookMap, r)
                await this.notion.repoWebhooks.set(r)
                console.log(`[updateNotionRepoInfo] set ${r.repo} success`)
            })
        await Promise.all(acts)

        if (deepSync === true) {
            let deepSyncActs = fromGitRepos
                .map(async (r) => {
                    // let r = GitHubRepoType2RepoWebhooksType(webhookMap, r)
                    let nowRepo = nowRepoInfoMap[r.repo]
                    if (nowRepo !== undefined) {
                        let repoWebhooks: UpdateRepoWebhooksType = {}
                        if (nowRepo.repo !== r.repo) repoWebhooks.repo = r.repo
                        if (!isEqual(nowRepo.webhooks, r.webhooks)) repoWebhooks.webhooks = r.webhooks
                        if (nowRepo.repo_update !== r.repo_update) repoWebhooks.repo_update = r.repo_update
                        if (nowRepo.permission !== r.permission) repoWebhooks.permission = r.permission
                        if (nowRepo.owner !== r.owner) repoWebhooks.owner = r.owner
                        if (nowRepo.html_url !== r.html_url) repoWebhooks.html_url = r.html_url

                        if (!(_.isEmpty(repoWebhooks))) {
                            repoWebhooks.id = nowRepo.id
                            let res = await this.notion.repoWebhooks.updatePage(repoWebhooks)
                            console.log(`[updateNotionRepoInfo] update ${r.repo} success`)
                            return res
                        }
                    }
                    return null
                })

            let notionDeleteOldActs = Object.values(nowRepoInfoMap)
                .map(async (r) => {
                    if (fromGitRepos.find(g => g.repo === r.repo) === undefined) {
                        console.log(`[updateNotionRepoInfo] delete ${r.repo}`)
                        await this.notion.repoWebhooks.delete(r.id)
                    }
                })

            // .filter(r => r !== null)
            // console.log("deepSyncActs: ", deepSyncActs.length)
            await Promise.all([...deepSyncActs, ...notionDeleteOldActs])
        }
    }


    async updateGithubWebhooks() {
        let webhooks = await this.notion.webhooks.getAll()
        let notionRepos = await this.notion.repoWebhooks.getAll()
        let acts = notionRepos
            .filter(r => !_.isEmpty(r.webhooks))
            .map(async (r) => {
                let update = RepoWebhooksType2GitHubRepoType(webhooks, r)
                let currentWebhooks = await this.github.getWebhooks(update.owner, update.repo)
                let currentWebhookUrls = currentWebhooks.data.map(h => h.config.url)
                if (!isEqual(currentWebhookUrls, update.webhooks)) {
                    await this.github.updateWebhook(update.owner, update.repo, update.webhooks)
                    console.log(`update `, update.owner, update.repo, update.webhooks)
                }
            })
        await Promise.all(acts)
    }


    async updateNotionButton() {
        let acts = Object.entries(apiConfig.notion.button)
            .map(async ([name, id]) => {
                let url = `${apiConfig.web.baseUrl}?p=${apiConfig.server.password}#/${name}`
                // a73f2f49de9e468f92120e15078d6fef
                // a50ab0ab0446440885e3e8206aee0b72
                await this.notion.notionClient.blocks.update({
                    block_id: id,
                    type: "embed",
                    embed: {
                        url: url
                    }
                })
            })
        await Promise.all(acts)
    }
}
