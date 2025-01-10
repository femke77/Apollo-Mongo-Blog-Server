import { GraphQLError } from "graphql";
import { User, Blog } from "../models/index.js";
import { signToken } from "../utils/auth.js";
const forbiddenException = new GraphQLError("You are not authorized to perform this action.", {
    extensions: {
        code: "FORBIDDEN",
    },
});
const resolvers = {
    Query: {
        me: async (_parent, _args, context) => {
            if (context.user) {
                const user = await User.findById(context.user._id).populate({ path: "blogs", options: { sort: { dateCreated: -1 } } });
                return user;
            }
            throw forbiddenException;
        },
        blogs: async () => {
            return Blog.find().sort({ dateCreated: -1 });
        },
        blog: async (_parent, { blogId }) => {
            return Blog.findById(blogId).populate("comments");
        },
    },
    Mutation: {
        addUser: async (_parent, args) => {
            const user = await User.create(args);
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        login: async (_parent, { email, password }) => {
            const user = await User.findOne({ email }).populate("blogs");
            if (!user || !(await user.isCorrectPassword(password))) {
                throw new GraphQLError("Incorrect credentials. Please try again.", {
                    extensions: {
                        code: "FORBIDDEN",
                    },
                });
            }
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        addBlog: async (_parent, { blogData }, context) => {
            if (context.user) {
                const blog = await Blog.create({
                    ...blogData,
                    username: context.user.username,
                });
                await User.findByIdAndUpdate(context.user._id, { $push: { blogs: blog._id } }, { new: true });
                return blog;
            }
            throw forbiddenException;
        },
        addComment: async (_parent, { blogId, comment }, context) => {
            if (context.user) {
                const blog = await Blog.findByIdAndUpdate(blogId, { $push: { comments: { comment, username: context.user.username } } }, { new: true });
                return blog;
            }
            throw forbiddenException;
        },
        removeBlog: async (_parent, { blogId }, context) => {
            if (context.user) {
                const blog = await Blog.findByIdAndDelete(blogId);
                await User.findByIdAndUpdate(context.user._id, {
                    $pull: { blogs: blogId },
                });
                return blog;
            }
            throw forbiddenException;
        },
        editBlog: async (_parent, { blogId, title, content, }, context) => {
            if (context.user) {
                const blog = await Blog.findByIdAndUpdate(blogId, { title, content }, { new: true });
                return blog;
            }
            throw forbiddenException;
        },
    },
};
export default resolvers;
