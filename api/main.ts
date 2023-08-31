import {GitHubApi} from "./github";
import {NotionApi} from "./notion";
import {UpdateRepoWebhooksType} from "./types";
import {array2map, GitHubRepoType2RepoWebhooksType} from "./utils";
import isEqual from "lodash/isEqual";
import _ from "lodash";


export class Service {
    github = new GitHubApi()
    notion = new NotionApi()

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

        let webhookMap = array2map(webhooks, "url")
        let nowRepoInfoMap = array2map(nowRepoInfos, "repo")
        // repoInfos = repoInfos.slice(0, 3)
        let fromGitRepos = repoInfos.map(r => GitHubRepoType2RepoWebhooksType(webhookMap, r))
        let acts = fromGitRepos
            .filter(r => {
                return nowRepoInfoMap[r.repo] === undefined
            })
            .map(async (r) => {
                // let repoWebhooks: RepoWebhooksType = GitHubRepoType2RepoWebhooksType(webhookMap, r)
                await this.notion.repoWebhooks.set(r)
                console.log(`set ${r.repo} success`)
            })
        await Promise.all(acts)

        if (deepSync === true) {
            let deepSyncActs = fromGitRepos.map(async (r) => {
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
                        await this.notion.repoWebhooks.updatePage(repoWebhooks)
                        console.log(`update ${repoWebhooks.repo} success`)
                    }
                }
            })

            await Promise.all(deepSyncActs)
        }
    }


    async updateGithubWeebhooks() {
        let notionRepo = await this.notion.repoWebhooks.getAll()
        // notionRepo.map(async (r) => {
        //     // github.
        // }
    }
}
// ;(async () => {
//
//     // res = await github.getRepoInfo()
//     // res = res
//     //     .map(r =>r.hookUrls )
//     //     .flat()
//     // res = [...new Set(res)]
//     //
//     // console.log(res)
//     // await notion.webhooks.set(["https://www.baidu.com"])
//     // await updateHooksSelect()
//     await updateNotionRepoInfo(true)
// // res = await notion.repoWebhooks.get_all()
// // console.log(res)
// })()
