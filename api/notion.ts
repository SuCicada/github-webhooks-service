import {Client} from "@notionhq/client";
import {
    PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import {RepoWebhooksType, UpdateRepoWebhooksType, WebhookType} from "./types";
import {apiConfig} from "./config";

// console.log("process.env.NOTION_TOKEN", process.env.NOTION_TOKEN)
// Initializing a client

// export const notionClient = notion

// function getNotionClient() {
//     notion = new Client({
//         auth: process.env.NOTION_TOKEN,
//     })
//     return notion
// }

export class RepoWebhooks {
    notion: Client

    constructor(_notion: Client) {
        this.notion = _notion
    }

    database_id = apiConfig.notion.database.RepoWebhooks

    async updatePage(repoWebhooks: UpdateRepoWebhooksType) {
        // let properties: Record<string, any> = {}
        return await this.notion.pages.update({
            page_id: repoWebhooks.id,
            properties: {
                ...(repoWebhooks.repo !== undefined ? {repo: set.title(repoWebhooks.repo)} : {}),
                ...(repoWebhooks.webhooks !== undefined ? {webhooks: set.multi_select(repoWebhooks.webhooks)} : {}),
                ...(repoWebhooks.repo_update !== undefined ? {repo_update: set.date(repoWebhooks.repo_update)} : {}),
                ...(repoWebhooks.permission !== undefined ? {permission: set.select(repoWebhooks.permission)} : {}),
                ...(repoWebhooks.owner !== undefined ? {owner: set.select(repoWebhooks.owner)} : {}),
                ...(repoWebhooks.html_url !== undefined ? {html_url: set.url(repoWebhooks.html_url)} : {}),
            }
        })
    }

    async updateHooksSelect(prop: string, webhooks_options: any[]) {
        console.log(webhooks_options)
        await this.notion.databases.update({
            database_id: this.database_id,
            properties: {
                [prop]: {
                    multi_select: {
                        options: webhooks_options
                    }
                }
            }
        })
    }

    async getAll() {
        let cursor = undefined
        let has_more = false
        let data = []
        do {
            let pageData = await this.notion.databases.query({
                database_id: this.database_id,
                sorts: [{
                    property: 'repo_update',
                    direction: 'descending',
                }],
                start_cursor: cursor,
            })
            data.push(pageData.results)
            has_more = pageData.has_more
            cursor = pageData.next_cursor
        } while (has_more)

        let res: RepoWebhooksType[] = data.flat()
            .map((r) => {
                // @ts-ignore
                let prop = r.properties
                let id = r.id
                let repo = prop.repo.title[0].plain_text
                // @ts-ignore
                let webhooks = prop.webhooks.multi_select.map(w => w.name)
                let repo_update = prop.repo_update.date.start
                let permission = prop.permission.select.name
                let owner = prop.owner.select?.name
                let html_url = prop.html_url.url
                let res: RepoWebhooksType = {id, repo, webhooks, repo_update, permission, owner, html_url}
                return res
            })
        console.log("[RepoWebhooks] getAll over")
        return res
    }

    async set(repoWebhooks: RepoWebhooksType) {
        let {repo, webhooks, repo_update, permission} = repoWebhooks
        await this.notion.pages.create({
            parent: {
                database_id: this.database_id,
            },
            properties: {
                repo: set.title(repo),
                webhooks: set.multi_select(webhooks),
                repo_update: set.date(repo_update),
                permission: set.select(permission),
                owner: set.select(repoWebhooks.owner),
                html_url: set.url(repoWebhooks.html_url),
            },
        });
    }

    async delete(id: string) {
        await this.notion.pages.update({
            page_id: id,
            archived: true,
        })
    }
}

export class Webhooks {
    database_id = apiConfig.notion.database.Webhooks
    notion: Client

    constructor(_notion: Client) {
        this.notion = _notion
    }

    async getAll() {
        let data = await this.notion.databases.query({
            database_id: this.database_id,
            sorts: [{
                property: 'id',
                direction: 'ascending',
            }]
        })
        let res = data.results
            .map((r) => {
                // if (r.object === "page") {
                let rr = r as PageObjectResponse
                let prop = rr.properties
                // @ts-ignore
                let name = prop.name.title[0].plain_text
                // @ts-ignore
                let url = prop.url.rich_text[0].plain_text
                return <WebhookType>{name, url}
                // }
            })
        console.log("[Webhooks] getAll over")
        return res
    }

    async set(name: string, url: string) {
        await this.notion.pages.create({
            parent: {
                database_id: this.database_id,
            },
            properties: {
                name: set.title(name),
                url: set.rich_text(url),
            },
        });
    }
}

export class NotionApi {
    notionClient = new Client({
        auth: process.env.NOTION_TOKEN,
    })
    repoWebhooks = new RepoWebhooks(this.notionClient)
    webhooks = new Webhooks(this.notionClient)
}

// exports.NotionApi = NotionApi

class NotionSet {
    title(str: string) {
        return {
            title: [{
                text: {content: str}
            }]
        }
    }

    rich_text(str: string) {
        return {
            rich_text: [{
                text: {content: str}
            }]
        }
    }

    multi_select(name_arr: string[]) {
        let res = {
            multi_select:
                name_arr.map(name => {
                    return {name: name}
                })
        }
        return res
    }

    select(name: string) {
        return {
            select: {
                name: name
            }
        }
    }

    date(start: string, end: string = null) {
        return {
            date: {
                start: start,
                ...(end !== null ? {end: end} : {})
            }
        }
    }

    url(str: string) {
        return {url: str}
    }
}

const set = new NotionSet()
export const notionSet = set
// exports.title = title
// exports.multi_select = multi_select
// exports.select = select
