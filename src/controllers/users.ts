import User, { IUser } from "../models/user";
import BaseController from "./base-controller";

export default class UsersController extends BaseController<IUser> {
    constructor() {
        super(User);
    }
}
