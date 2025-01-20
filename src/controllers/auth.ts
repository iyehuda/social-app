import { NextFunction, Request, Response } from "express";
import userModel, { IUser } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import { refreshTokenExpires, tokenExpires, tokenSecret } from "../config";

// eslint-disable-next-line max-statements
const register = async (req: Request, res: Response) => {
    try {
        const existingUserByEmail = await userModel.findOne({ email: req.body.email });
        if (existingUserByEmail) {
            const CONFLICT_STATUS = 409;
            res.status(CONFLICT_STATUS).send("Email already in use");
            return;
        }

        const existingUserByUsername = await userModel.findOne({ username: req.body.username });
        if (existingUserByUsername) {
            const CONFLICT_STATUS = 409;
            res.status(CONFLICT_STATUS).send("Username already in use");
            return;
        }

        const { password } = req.body;
        const SALT_ROUNDS = 10;
        const salt = await bcrypt.genSalt(SALT_ROUNDS);

        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({
            email: req.body.email,
            password: hashedPassword,
            username: req.body.username,
        });
        res.status(200).send({
            _id: user._id,
            email: user.email,
            username: user.username,
        });
    } catch (err: any) {
        const INTERNAL_SERVER_ERROR = 500;
        res.status(INTERNAL_SERVER_ERROR).send("Server Error");
    }
};

interface tTokens {
    accessToken: string
    refreshToken: string
}

const generateToken = (userId: string): tTokens | null => {
    if (!tokenSecret) {
        return null;
    }
    // Generate token
    const random = Math.random().toString();
    const accessToken = jwt.sign({
        _id: userId,
        random,
    },
    tokenSecret,
    { expiresIn: tokenExpires });

    const refreshToken = jwt.sign({
        _id: userId,
        random,
    },
    tokenSecret,
    { expiresIn: refreshTokenExpires });
    return {
        accessToken,
        refreshToken,
    };
};
// eslint-disable-next-line max-statements
const login = async (req: Request, res: Response) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).send("wrong username or password");
            return;
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            res.status(400).send("wrong username or password");
            return;
        }
        if (!tokenSecret) {
            res.status(500).send("Server Error");
            return;
        }
        // Generate token
        const tokens = generateToken(user._id);
        if (!tokens) {
            res.status(500).send("Server Error");
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        res.status(200).send(
            {
                _id: user._id,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            });
    } catch (err) {
        res.status(400).send(err);
    }
};

type tUser = Document<unknown, unknown, IUser> & IUser & Required<{
    _id: string
}> & {
    __v: number
};
const verifyRefreshToken = (refreshToken: string | undefined) => new Promise<tUser>((resolve, reject) => {
    if (!refreshToken) {
        reject(new Error("fail"));
        return;
    }
    if (!tokenSecret) {
        reject(new Error("fail"));
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises,max-statements
    jwt.verify(refreshToken, tokenSecret, async (err: any, payload: any) => {
        if (err) {
            reject(new Error("fail"));
            return;
        }
        // eslint-disable-next-line no-use-before-define
        const userId: Payload = payload._id;
        try {
            const user = await userModel.findById(userId);
            if (!user) {
                reject(new Error("fail"));
                return;
            }
            if (!user.refreshToken?.includes(refreshToken)) {
                user.refreshToken = [];
                await user.save();
                reject(new Error("fail"));
                return;
            }
            const tokens = user.refreshToken.filter(token => token !== refreshToken);
            user.refreshToken = tokens;

            resolve(user);
            // eslint-disable-next-line no-shadow
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject("fail");
        }
    });
});

const logout = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        await user.save();
        res.status(200).send("success");
    } catch (err) {
        res.status(400).send("fail");
    }
};

// eslint-disable-next-line max-statements
const refresh = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        if (!user) {
            res.status(400).send("fail");
            return;
        }
        const tokens = generateToken(user._id);

        if (!tokens) {
            res.status(500).send("Server Error");
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        res.status(200).send(
            {
                _id: user._id,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            });
    } catch (err) {
        res.status(400).send("fail");
    }
};

interface Payload {
    _id: string
}

// eslint-disable-next-line max-statements
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header("authorization");
    const token = authorization?.split(" ")[1];

    const UNAUTHORIZED_STATUS = 401;
    if (!token) {
        res.status(UNAUTHORIZED_STATUS).send("Access Denied");
        return;
    }
    if (!tokenSecret) {
        const INTERNAL_SERVER_ERROR = 500;
        res.status(INTERNAL_SERVER_ERROR).send("Server Error");
        return;
    }

    jwt.verify(token, tokenSecret, (err, payload) => {
        if (err) {
            res.status(UNAUTHORIZED_STATUS).send("Access Denied");
            return;
        }
        req.params.userId = (payload as Payload)._id;
        next();
    });
};

export default {
    login,
    logout,
    refresh,
    register,
};
