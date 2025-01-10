import { Types } from "mongoose";

export default interface IJwtPayload {
  _id: Types.ObjectId;
  username: string;
  email: string;
}
