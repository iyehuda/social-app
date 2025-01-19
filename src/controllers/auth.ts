import { NextFunction, Request, Response } from "express";
import userModel, { IUser } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import { refreshTokenExpires, tokenExpires, tokenSecret } from "../config";

const register = async (req: Request, res: Response) => {
    try {
        const existingUserByEmail = await userModel.findOne({ email: req.body.email });
        if (existingUserByEmail) {
            res.status(409).send("Email already in use");
            return;
        }

        const existingUserByUsername = await userModel.findOne({ username: req.body.username });
        if (existingUserByUsername) {
            res.status(409).send("Username already in use");
            return;
        }

        const { password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
        res.status(200).send({
            username: user.username,
            email: user.email,
            _id: user._id,
        });
    } catch (err: any) {
        res.status(500).send("Server Error");
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
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                _id: user._id,
            });
    } catch (err) {
        res.status(400).send(err);
    }
};

type tUser = Document<unknown, {}, IUser> & IUser & Required<{
    _id: string
}> & {
    __v: number
};
const verifyRefreshToken = (refreshToken: string | undefined) => new Promise<tUser>((resolve, reject) => {
    // Get refresh token from body
    if (!refreshToken) {
        reject("fail");
        return;
    }
    // Verify token
    if (!tokenSecret) {
        reject("fail");
        return;
    }
    jwt.verify(refreshToken, tokenSecret, async (err: any, payload: any) => {
        if (err) {
            reject("fail");
            return;
        }
        // Get the user id from token
        const userId = payload._id;
        try {
            // Get the user from the db
            const user = await userModel.findById(userId);
            if (!user) {
                reject("fail");
                return;
            }
            if (!user.refreshToken?.includes(refreshToken)) {
                user.refreshToken = [];
                await user.save();
                reject("fail");
                return;
            }
            const tokens = user.refreshToken.filter(token => token !== refreshToken);
            user.refreshToken = tokens;

            resolve(user);
        } catch (err) {
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
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                _id: user._id,
            });
        // Send new token
    } catch (err) {
        res.status(400).send("fail");
    }
};

interface Payload {
    _id: string
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header("authorization");
    const token = authorization?.split(" ")[1];

    if (!token) {
        res.status(401).send("Access Denied");
        return;
    }
    if (!tokenSecret) {
        res.status(500).send("Server Error");
        return;
    }

    jwt.verify(token, tokenSecret, (err, payload) => {
        if (err) {
            res.status(401).send("Access Denied");
            return;
        }
        req.params.userId = (payload as Payload)._id;
        next();
    });
};

export default {
    register,
    login,
    refresh,
    logout,
};
