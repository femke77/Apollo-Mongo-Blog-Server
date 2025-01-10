import type { IBlog } from "../models/Blog";
import type { Types } from "mongoose";

export default interface IUserDocument {
  _id: Types.ObjectId | string;
  username: string | null;
  email: string | null;
  blogs?: Types.ObjectId[] | IBlog[] | []  | null;
  isCorrectPassword(password: string): Promise<boolean>;
  blogCount: number | null;
}
