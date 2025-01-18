import { Model, MongooseError, RootFilterQuery } from "mongoose";
import { Request, Response } from "express";
import { MongoServerError } from "mongodb";

type ControllerMethod = (req: Request, res: Response) => Promise<void>;
type WrappedMongooseError = MongooseError & { cause: MongoServerError };
const DuplicateKeyErrorCode = 11000;

function handleDBError(error: unknown, res: Response) {
    if (!(error instanceof MongooseError)) {
        throw error;
    }

    switch ((error as WrappedMongooseError).cause.code) {
        case DuplicateKeyErrorCode:
            res.status(409).json({ error: error.message });
            break;
        default:
            throw error;
    }
}

function DBHandler<T>(target: ControllerMethod, context: ClassMethodDecoratorContext) {
    if (context.kind === "method") {
        return async function wrapWithDBHandling(this: T, req: Request, res: Response) {
            try {
                await target.apply(this, [req, res]);
            } catch (error) {
                handleDBError(error, res);
            }
        };
    }
}

export default class BaseController<T> {
    private model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    @DBHandler
    async create(req: Request, res: Response) {
        const item = await this.model.create(req.body);

        res.status(201).json(item);
    }

    @DBHandler
    async getItems(req: Request, res: Response) {
        const items = await this.model.find(req.query as RootFilterQuery<T>);

        res.json(items);
    }

    @DBHandler
    async getItemById(req: Request, res: Response) {
        const item = await this.model.findById(req.params.id);

        if (!item) {
            res.status(404).json({ error: "Item not found" });
        } else {
            res.json(item);
        }
    }

    @DBHandler
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

    @DBHandler
    async deleteItemById(req: Request, res: Response) {
        const item = await this.model.findByIdAndDelete(req.params.id);

        if (!item) {
            res.status(404).json({ error: "Item not found" });
        } else {
            res.status(204).send();
        }
    }
}
