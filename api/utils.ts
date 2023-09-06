import {GitHubRepoType, RepoWebhooksType, WebhookType} from "./types";
import moment from "moment-timezone";

const TIME_ZONE = 'Asia/Tokyo';

export function array2map<T extends Record<string, string>>(arr: T [], key: string) {
    let res: Record<string, T> = {}
    arr.forEach(a => {
        res[a[key]] = a
    })
    return res
}


export function GitHubRepoType2RepoWebhooksType(webhooks:  WebhookType[], t: GitHubRepoType) {
    let webhookMap = array2map(webhooks, "url")
    let webhookNames = t.webhooks.map(url => {
        return webhookMap[url].name
    })
    const formattedTime = moment(t.repo_update)
        .tz(TIME_ZONE)
        .seconds(0) // because notion seconds is 0
        .toISOString(true)
    let repoWebhooks: RepoWebhooksType = {
        repo: t.repo,
        permission: t.permission,
        webhooks: webhookNames,
        repo_update: formattedTime,
        owner: t.owner,
        html_url: t.html_url,
    }
    return repoWebhooks
}
export function RepoWebhooksType2GitHubRepoType(webhooks:  WebhookType[], t:RepoWebhooksType){
    let webhookTagMap = array2map(webhooks, "name")
    let webhookUrls = t.webhooks.map(name => {
        return webhookTagMap[name].url
    })
    // const formattedTime = moment(t.repo_update)
    //     .tz(TIME_ZONE)
    //     .seconds(0) // because notion seconds is 0
    //     .toISOString(true)
    let res: GitHubRepoType = {
        repo: t.repo,
        permission: t.permission,
        webhooks: webhookUrls,
        repo_update: t.repo_update, // todo 未验证
        owner: t.owner,
        html_url: t.html_url,
    }
    return res
}
