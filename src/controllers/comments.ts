import Comment, { IComment } from "../models/comment";
import BaseController from "./base-controller";

export default class CommentsController extends BaseController<IComment> {
    constructor() {
        super(Comment);
    }
}
