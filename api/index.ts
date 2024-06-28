import express, {NextFunction, RequestHandler} from "express";
import dotenv from 'dotenv';
import path from "path";
import cors from 'cors';
import {ParamsDictionary, RequestHandlerParams} from "express-serve-static-core";
import {Service} from "./service";

const app = express();
const service = new Service()
import {Request, Response} from 'express';
import {ParsedQs} from "qs";


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
app.use(cors());

// 应用中间件
app.use(passwordMiddleware);

// app.use(express.static(path.join(__dirname, '../build')));

// 设置路由，返回 HTML 页面
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });
app.get("/getRepoInfo", async (req: any, res: any) => {
    try {
        let {owner, repo} = req.query
        let data = await service.github.getRepoInfo(owner, repo)
        res.send({success: true, data});
    } catch (e: any) {
        console.error(e)
        res.send({success: false, message: e.message});
    }
})
app.get("/getRepoWebhooks", async (req, res) => {
    try {
        let {owner, repo, full} = req.query as any
        full = full === "true"
        let data = await service.github.getWebhooks(owner, repo)
        let resData = data.data
        if (!full) {
            // resData = resData.map((d:any)=>d.config.url)
        }
        res.send({success: true, data: resData});
    } catch (e: any) {
        console.error(e)
        res.send({success: false, message: e.message});
    }
})
app.post("/updateWebhook", asyncHandler(async (req, res) => {
    let {owner, repo, webhooks} = req.body
    await service.github.updateWebhook(owner, repo, webhooks)
    res.send({success: true});
}))

// @ts-ignore
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({success: false, message: err.message});
});
app.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
});
