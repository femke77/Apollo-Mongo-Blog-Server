import { Schema, model } from "mongoose";
import commentSchema from "./Comment.js";
const blogSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    // leaving it in default unix time
    dateCreated: {
        type: Date,
        default: Date.now,
        // get: (timestamp: Date): string =>
        //   dayjs(timestamp).format("MMM DD, YYYY [at] hh:mm A"),
    },
    comments: [commentSchema],
}, {
    toJSON: {
        getters: true,
    },
});
blogSchema.virtual("commentCount").get(function () {
    if (this.comments) {
        return this.comments.length;
    }
    return 0;
});
const Blog = model("Blog", blogSchema);
export default Blog;
/**
 * Advantages of Using username Instead of userId
Readability: The username is more human-readable than a database-generated userId.
Avoids Circular References in GraphQL: By storing a string like username instead of a full User object, you avoid creating deeply nested circular references in your GraphQL schema.
Simplified Queries: You can fetch blogs by the author's username directly without needing to resolve userId to username in your queries.

Disadvantages of Using username Instead of userId
Update Complexity: If the username ever changes (e.g., a user updates their username), you'll need to update all related Blog documents. This isn't an issue with an immutable userId.
Consistency Risk: If you allow usernames to change and forget to propagate updates, it could lead to inconsistencies.
Storage Redundancy: username might already exist in the User document, and duplicating it in the Blog documents could lead to slightly higher storage usage.
 
For purposes of this application, usernames will NOT be updatable eliminating 2/3 of the disadvantages.
I disagree with storge redundancy as the username is no more redundant than the userId, however this IS an example
of denormalization of a database (repeating data other than an ID)


*/
