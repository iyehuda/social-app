import Post, { IPost } from "../models/post";
import BaseController from "./base-controller";

export default class PostsController extends BaseController<IPost> {
    constructor() {
        super(Post);
    }
}
