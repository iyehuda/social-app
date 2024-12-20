import Post from "../models/post.js";
import BaseController from "./base-controller.js";

export default class PostsController extends BaseController {
    constructor() {
        super(Post);
    }
}
