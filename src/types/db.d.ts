import { Post, Subreddit, Vote,Comment,User} from "@prisma/client";


export type ExtendedPost =Post & {
    subreddit:Subreddit,
    votes:Vote[],
    author:User,
    comments:Comment[]
}