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


export function GitHubRepoType2RepoWebhooksType(webhookMap: Record<string, WebhookType>, t: GitHubRepoType) {
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
