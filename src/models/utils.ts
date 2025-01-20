import { SchemaOptions } from "mongoose";

export function commonSchemaOptions<DocType>(): SchemaOptions<DocType> {
    return {
        toJSON: {
            transform(_doc, ret: { id?: string, _id?: string, __v?: number }) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    };
};
