import { Model, RootFilterQuery } from "mongoose";
import { Request, Response } from "express";

export default class BaseController<T> {
    private model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(req: Request, res: Response) {
        const item = await this.model.create(req.body);

        res.status(201).json(item);
    }

    async getItems(req: Request, res: Response) {
        const items = await this.model.find(req.query as RootFilterQuery<T>);

        res.json(items);
    }

    async getItemById(req: Request, res: Response) {
        const item = await this.model.findById(req.params.id);

        if (!item) {
            res.status(404).json({ error: "Item not found" });
        } else {
            res.json(item);
        }
    }

    async updateItemById(req: Request, res: Response) {
        const item = await this.model.findById(req.params.id);

        if (!item) {
            res.status(404).json({ error: "Item not found" });
        } else {
            Object.assign(item, req.body);
            await item.save();
            res.json(item);
        }
    }

    async deleteItemById(req: Request, res: Response) {
        const item = await this.model.findByIdAndDelete(req.params.id);

        if (!item) {
            res.status(404).json({ error: "Item not found" });
        } else {
            res.status(204).send();
        }
    }
}
