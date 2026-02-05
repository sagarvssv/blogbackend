// routes/postRoutes.js
import express from "express";
import {
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
} from "../contollers/postcontroller.js";
import { authMiddleware } from "../middlewares/auth.js";
import multer from "multer";

const postRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
 postRouter.get("/all", getPosts);
 postRouter.get("/:id", getSinglePost);
 postRouter.post("/:id/like", likePost);
 postRouter.post("/:id/dislike", dislikePost);
 postRouter.post("/:id/comments", addComment);
 postRouter.get("/:id/comments", getComments);

// Protected routes (require authentication)
 postRouter.delete("/:postId/comments/:commentId", authMiddleware, deleteComment);
 postRouter.post("/", authMiddleware, upload.single("coverImage"), createPost);
 postRouter.put("/:id", authMiddleware, upload.single("coverImage"), editPost);
 postRouter.delete("/:id", authMiddleware, deletePost);

export default  postRouter;