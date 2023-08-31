import express from "express";
import dotenv from 'dotenv';
import path from "path";
import {Service} from "./main";
import cors from 'cors';

const app = express();

const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({path: envPath});
if (result.error) {
    throw result.error;
}

const SERVER_PASSWORD = process.env.SERVER_PASSWORD;
const SERVER_PORT = process.env.SERVER_PORT;
console.log("SERVER_PASSWORD", SERVER_PASSWORD);
console.log("SERVER_PORT", SERVER_PORT);
// 中间件
// @ts-ignore
const passwordMiddleware = (req, res, next) => {
    const requestPassword = req.query.p; // 从请求的 URL 参数中获取密码
    console.log("requestPassword", requestPassword);

    if (requestPassword === SERVER_PASSWORD) {
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
const service = new Service()

// 处理根路由
app.post('/updateNotionRepoInfo', (req: any, res: any) => {
    console.log("updateNotionRepoInfo", req)
    void (async () => {
        await service.updateNotionRepoInfo()
        res.send({success: true});
    })();
});

// 启动服务器
app.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
});
