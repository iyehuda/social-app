import { SchemaOptions } from "mongoose";

export function commonSchemaOptions<DocType>(): SchemaOptions<DocType> {
    return {
        toJSON: {
            transform: function (_, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
};
