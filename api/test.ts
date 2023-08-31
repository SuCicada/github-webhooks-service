import {GitHubApi} from "./github";

import {NotionApi, notionClient, notionSet} from "./notion";


let github = new GitHubApi()
let notion = new NotionApi()
;(async () => {

    // res = await github.getWebhook("SuCicada","C-plus-plus-knowladge-points")
    // await github.octokit.rest.repos.get({
    //     owner: "SuCicada",
    //     repo: "utils",
    // })
    // res = await notion.repoWebhooks.updateHooksSelect("permission")
    // console.log(res)
    // // let res = await notion.webhooks.getAll()
    // res = await notion.repoWebhooks.updateHooksSelect("permission",
    //     [
    //         {name: "public", color: "green"},
    //         {name: "private", color: "yellow"},])
    async function set() {
       let res = await notionClient.pages.create({
            parent: {
                database_id: notion.repoWebhooks.database_id,
            },
            properties: {
                repo: notionSet.title("test"),
                webhooks: notionSet.multi_select(["discord:lain"]),
                repo_update: {
                    date: {
                        start: "2023/08/18 19:58 (JST)",
                    }
                },
                permission: notionSet.multi_select(["public"]),
            },
        });
    }
    async function getnotion() {
        let res = await notion.repoWebhooks.getAll()
        console.log(res)
    }
    async function getgit() {
        let res = await github.getRepoInfo()
        console.log(res)
    }
    async function git(){
        // github.octokit.rest.repos.listWebhooks({
        //
        // }
        let res = await github.getWebhooks("SuCicada","so-vits-svc")
        console.log(res)
    }
    async function setwebhooks(){
        await github.updateWebhook("SuCicada",
        "lain_voice_extractor",
        // "so-vits-svc",
        ["https://api.netlify.com/hooks/github"])
    }
    // await getgit()
    // await getnotion()
    // await set()
    await setwebhooks()
// res = await notion.repoWebhooks.get_all()
// console.log(res)
})()
