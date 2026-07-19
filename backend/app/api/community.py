from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.auth.auth_handler import get_current_user_token
from app.repositories.community_repository import CommunityRepository
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/api/community", tags=["Anonymous Community"])

class PostCreate(BaseModel):
    content: str
    mood_tag: Optional[str] = None

class CommentCreate(BaseModel):
    post_id: str
    content: str

class LikeToggle(BaseModel):
    post_id: str

@router.post("/post")
async def create_post(req: PostCreate, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    user = await UserRepository.get_by_id(user_id)
    # Use randomized/anonymous representation for privacy
    author_name = "Anonymous Peer"
    post = await CommunityRepository.create_post(
        author_name=author_name,
        content=req.content,
        mood_tag=req.mood_tag
    )
    return post

@router.get("/posts")
@router.get("")
async def get_posts(token: dict = Depends(get_current_user_token)):
    posts = await CommunityRepository.get_active_posts()
    return posts

@router.post("/comment")
async def create_comment(req: CommentCreate, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    comment = await CommunityRepository.add_comment(
        post_id=req.post_id,
        author_name="Anonymous Peer",
        text=req.content
    )
    return comment

@router.post("/like")
async def toggle_like(req: LikeToggle, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    liked = await CommunityRepository.toggle_like(post_id=req.post_id, user_id=user_id)
    return {"liked": liked}

@router.get("/comments/{post_id}")
async def get_comments(post_id: str, token: dict = Depends(get_current_user_token)):
    comments = await CommunityRepository.get_comments_for_post(post_id)
    return comments

@router.post("/report/{post_id}")
async def report_post(post_id: str, token: dict = Depends(get_current_user_token)):
    success = await CommunityRepository.report_post(post_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    return {"status": "success", "message": "Post successfully reported and queued for admin moderation."}
