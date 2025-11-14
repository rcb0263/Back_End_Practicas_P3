import { ObjectId } from "mongodb"

export type User={
    _id?: ObjectId,
    username: string,
    email: string,
    passwordHash: string,
    createdAt: Date
}