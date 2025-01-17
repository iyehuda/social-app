import { Model, MongooseError, RootFilterQuery } from "mongoose";
import { Request, Response } from "express";
import { MongoServerError } from "mongodb";

type WrappedMongooseError = MongooseError & { cause: MongoServerError };
const DuplicateKeyErrorCode = 11000;

export default class BaseController<T> {
    private model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(req: Request, res: Response) {
        try {
            const item = await this.model.create(req.body);

            res.status(201).json(item);
        } catch (error) {
            if (error instanceof MongooseError && (error as WrappedMongooseError).cause.code === DuplicateKeyErrorCode) {
                res.status(429).json({ error: error.message });
            } else {
                throw error;
            }
        }
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
