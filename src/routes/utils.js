import Joi from "joi";
import mongoose from "mongoose";

export function validObjectId(value, helpers) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid post ID");
    }

    return value;
}

export const idParamSchema = Joi.object({ id: Joi.string().required().custom(validObjectId) });
