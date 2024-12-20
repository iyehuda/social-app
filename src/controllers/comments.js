import Comment from "../models/comment.js";
import BaseController from "./base-controller.js";

export default class CommentsController extends BaseController {
    constructor() {
        super(Comment);
    }
}
