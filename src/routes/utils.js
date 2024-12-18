import mongoose from "mongoose";

export function validObjectId(value, helpers) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid post ID");
    }

    return value;
}
