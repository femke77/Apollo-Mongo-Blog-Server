import { Schema, model, Types } from "mongoose";
import bcrypt from "bcrypt";

interface IUser {
  _id: Types.ObjectId
  username: string;
  email: string;
  password: string;
  isCorrectPassword(password: string): Promise<boolean>;
  blogs?: Types.ObjectId[] | null | [];
  blogCount: number;
  isNew: boolean
  isModified: (password: string) => boolean
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true, // instantly creates a b-tree index on the username field for fast lookups
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "Must use a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },
    // Referenced pattern (similar to a foreign key in SQL)
    blogs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],
  },
  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  },
);

// hash user password
userSchema.pre<IUser>("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

userSchema.methods.isCorrectPassword = async function (
  password: string,
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.virtual("blogCount").get(function (this: IUser) {
  if (this.blogs) {
    return this.blogs.length;
  }
  return 0;
});

const User = model<IUser>("User", userSchema);

export default User;
