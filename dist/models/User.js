import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new Schema({
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
});
// hash user password
userSchema.pre("save", async function (next) {
    if (this.isNew || this.isModified("password")) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
});
userSchema.methods.isCorrectPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
userSchema.virtual("blogCount").get(function () {
    if (this.blogs) {
        return this.blogs.length;
    }
    return 0;
});
const User = model("User", userSchema);
export default User;
