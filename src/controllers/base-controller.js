export default class BaseController {
    constructor(model) {
        this.model = model;
    }

    async create(req, res) {
        const item = await this.model.create(req.body);

        res.status(201).json(item);
    }

    async getItems(req, res) {
        const items = await this.model.find(req.query);

        res.json(items);
    }

    async getItemById(req, res) {
        const item = await this.model.findById(req.params.id);

        if (!item) {
            res.status(404).json({ error: "Item not found" });
        } else {
            res.json(item);
        }
    }

    async updateItemById(req, res) {
        const item = await this.model.findById(req.params.id);

        if (!item) {
            res.status(404).json({ error: "Item not found" });
        } else {
            item.message = req.body.message;
            await item.save();
            res.json(item);
        }
    }

    async deleteItemById(req, res) {
        const item = await this.model.findByIdAndDelete(req.params.id);

        if (!item) {
            res.status(404).json({ error: "Item not found" });
        } else {
            res.status(204).send();
        }
    }
}