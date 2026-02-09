// controllers/postController.js
import Post from "../models/Post.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary
} from "../utils/uploadToCloudinary.js";
import fs from "fs";

/* CREATE POST - Protected (requires login) */
const createPost = async (req, res) => {
  try {
    const { title, content, subtitle,imageUrl } = req.body;

    let coverImage = "";
    let coverImageId = "";

    if (req.file?.path) {
      const uploadResult = await uploadToCloudinary(req.file.path, "blog/posts");
      coverImage = uploadResult.url;
      coverImageId = uploadResult.public_id;
            fs.unlinkSync(req.file.path);
    }
    else if(imageUrl && imageUrl.length > 0){
     const uploadResult = await uploadToCloudinary(imageUrl , "blog/posts");
      coverImage = uploadResult.url;
      coverImageId = uploadResult.public_id;
    }

    const newPost = new Post({
      title,
      content,
      subtitle,
      coverImage,
      coverImageId
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET ALL POSTS */
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET SINGLE POST */
const getSinglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* EDIT POST - Protected (requires login) */
const editPost = async (req, res) => {
  try {
    console.log("=== Edit Post Request ===");
    console.log("Has file upload:", !!req.file);
    console.log("Has coverImage in body:", !!req.body.coverImage);
    console.log("CoverImage type:", typeof req.body.coverImage);
    console.log("CoverImage preview:", req.body.coverImage?.substring(0, 50) + "...");
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { title, content, subtitle, coverImage } = req.body;

    if (title) post.title = title;
    if (content) post.content = content;
    if (subtitle) post.subtitle = subtitle;

    // Handle file upload (multipart form data with actual file)
    if (req.file) {
      try {
        if (post.coverImageId) {
          await deleteFromCloudinary(post.coverImageId);
        }

        const uploadResult = await uploadToCloudinary(req.file.path, "blog/posts");
        post.coverImage = uploadResult.url;
        post.coverImageId = uploadResult.public_id;

        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw uploadError;
      }
    } 
    // Handle base64 image or URL
    else if (coverImage && coverImage !== post.coverImage) {
      try {
        if (post.coverImageId) {
          await deleteFromCloudinary(post.coverImageId);
        }

        // Cloudinary can handle both URLs and base64 data URLs
        const uploadResult = await uploadToCloudinary(coverImage, "blog/posts");
        post.coverImage = uploadResult.url;
        post.coverImageId = uploadResult.public_id;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        throw uploadError;
      }
    }

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);

  } catch (error) {
    console.error("Edit post error:", error);
    res.status(500).json({ message: error.message });
  }
};
/* DELETE POST - Protected (requires login) */
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.coverImageId) {
      await deleteFromCloudinary(post.coverImageId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* LIKE POST - Public */
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get user identifier (IP address or session ID)
    const userIdentifier = req.ip || req.connection.remoteAddress;

    // Check if user already liked
    if (post.likedBy.includes(userIdentifier)) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    // Remove from dislikes if previously disliked
    if (post.dislikedBy.includes(userIdentifier)) {
      post.dislikes -= 1;
      post.dislikedBy = post.dislikedBy.filter(id => id !== userIdentifier);
    }

    post.likes += 1;
    post.likedBy.push(userIdentifier);

    await post.save();
    res.status(200).json({ 
      likes: post.likes, 
      dislikes: post.dislikes,
      message: "Post liked successfully" 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* DISLIKE POST - Public */
const dislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userIdentifier = req.ip || req.connection.remoteAddress;

    // Check if user already disliked
    if (post.dislikedBy.includes(userIdentifier)) {
      return res.status(400).json({ message: "You already disliked this post" });
    }

    // Remove from likes if previously liked
    if (post.likedBy.includes(userIdentifier)) {
      post.likes -= 1;
      post.likedBy = post.likedBy.filter(id => id !== userIdentifier);
    }

    post.dislikes += 1;
    post.dislikedBy.push(userIdentifier);

    await post.save();
    res.status(200).json({ 
      likes: post.likes, 
      dislikes: post.dislikes,
      message: "Post disliked successfully" 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ADD COMMENT - Public */
const addComment = async (req, res) => {
  try {
    const { name, email, comment } = req.body;

    if (!name || !email || !comment) {
      return res.status(400).json({ message: "Name, email, and comment are required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      name,
      email,
      comment
    });

    await post.save();
    res.status(201).json({ 
      message: "Comment added successfully",
      comments: post.comments 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET COMMENTS */
const getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post.comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* DELETE COMMENT - Protected (requires login) */
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments = post.comments.filter(
      comment => comment._id.toString() !== commentId
    );

    await post.save();
    res.status(200).json({ 
      message: "Comment deleted successfully",
      comments: post.comments 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createPost,
  getPosts,
  getSinglePost,
  editPost,
  deletePost,
  likePost,
  dislikePost,
  addComment,
  getComments,
  deleteComment
};