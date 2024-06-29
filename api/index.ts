import express, {NextFunction} from "express";
import cors from 'cors';
import {Service} from "./service";
import {initEnv} from "./config";

// @ts-ignore
import openapi from "@wesleytodd/openapi";

initEnv()

const app = express();
const service = new Service()
import {Request, Response} from 'express';
import webhooksRouter from "./webhooks";


const SERVER_PASSWORD = process.env.SERVER_PASSWORD;
const SERVER_PORT = process.env.SERVER_PORT;
console.log("SERVER_PASSWORD", SERVER_PASSWORD);
console.log("SERVER_PORT", SERVER_PORT);

const asyncHandler = (fn: {
    (req: express.Request,
     res: express.Response,
     next: express.NextFunction): Promise<void>;
}) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// @ts-ignore
const passwordMiddleware = (req, res, next) => {
    let authorization = req.headers.authorization
    console.log("authorization", authorization)
    if (authorization === SERVER_PASSWORD) {
        // 密码匹配，继续处理请求
        next();
    } else {
        console.log('Unauthorized');
        // 密码不匹配，返回错误响应
        // res.status(401).send('Unauthorized');
        res.send({success: false, message: 'Unauthorized'});
    }
};
const oapi = openapi({
    openapi: '3.0.0',
    info: {
        title: 'Express Application',
        description: 'Generated docs from an Express api',
        version: '1.0.0',
    }
})
app.use(oapi)

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// 应用中间件
app.use(passwordMiddleware);
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.query, req.body);
    next();
})

app.get("/me", asyncHandler(async (req, res) => {
    const data = await service.github.getMe()
    res.send({success: true, data});
}))
app.get("/getRepoInfo", oapi.path({
    description: 'Get a foo',
    requestBody: {
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        owner: {type: 'string'},
                        repo: {type: 'string'}
                    }
                }
            }
        }
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            foo: {type: 'string'}
                        }
                    }
                }
            }
        }
    }
}), asyncHandler(async (req: any, res: any) => {
    let {owner, repo} = req.query
    let data = await service.github.getRepoInfo(owner, repo)
    res.send({success: true, data});
}))

app.get("/getAllRepoInfo", asyncHandler(async (req, res) => {
    let {page, per_page} = req.query as any
    console.log("getAllRepoInfo", req.query)
    let data = await service.github.getPageRepoInfo(page, per_page)
    res.send({success: true, data});
}))

app.get("/getRepoWebhooks", asyncHandler(async (req, res) => {
    // try {
    let {owner, repo, full} = req.query as any
    full = full === "true"
    let data = await service.github.getWebhooks(owner, repo)
    let resData = data.data
    if (!full) {
        // resData = resData.map((d:any)=>d.config.url)
    }
    res.send({success: true, data: resData});
}))

app.post("/updateWebhook", asyncHandler(async (req, res) => {
    let {owner, repo, webhooks, events} = req.body
    console.log("updateWebhook", req.body)
    await service.github.updateWebhook(owner, repo, webhooks, events)
    res.send({success: true});
}))

app.use("/webhooks", webhooksRouter)
// @ts-ignore
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({success: false, message: err.message});
});
app.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
});
