import express from "express";
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const webhooksRouter = express.Router();

webhooksRouter.get("/", async (req, res) => {
    const data = await prisma.$queryRaw`SELECT * FROM webhooks`;
    console.log(data)
    res.send(data);
})

webhooksRouter.post("/", async (req, res) => {
    const { name, url } = req.body;
    const data = await prisma.webhooks.create({
        data: {
            name,
            url
        }
    });
    res.send(data);
})

webhooksRouter.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const data = await prisma.webhooks.delete({
        where: {
            id: parseInt(id)
        }
    });
    res.send(data);
})

webhooksRouter.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, url } = req.body;
    const data = await prisma.webhooks.update({
        where: {
            id: parseInt(id)
        },
        data: {
            name,
            url
        }
    });
    res.send(data);
})
export default webhooksRouter;
