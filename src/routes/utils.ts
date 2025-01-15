import Joi from "joi";
import { Segments } from "celebrate";
import mongoose from "mongoose";

export function validObjectId(value: string, helpers: Joi.CustomHelpers) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("Invalid post ID");
    }

    return value;
}

export const idParamSchema = {
    [Segments.PARAMS]: Joi.object({ id: Joi.string().required().custom(validObjectId) }),
};
