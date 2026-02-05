// models/Post.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ""
  },
  content: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: ""
  },
  coverImageId: {
    type: String,
    default: ""
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String  // Store IP addresses or session IDs
  }],
  dislikedBy: [{
    type: String  // Store IP addresses or session IDs
  }],
  comments: [commentSchema]
}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;