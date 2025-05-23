import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { createBlogInput, updateBlogInput } from '@lakshayj17/common-app'

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    },
    Variables: {
        userId: string
    }
}>();

blogRouter.use('/*', async (c, next) => {
    const jwt = c.req.header('Authorization');
    if (!jwt) {
        c.status(401);
        return c.json({ error: "unauthorized" });
    }
    const token = jwt.split(' ')[1];
    const payload = await verify(token, c.env.JWT_SECRET);
    if (!payload) {
        c.status(401);
        return c.json({ error: "unauthorized" });
    }
    c.set('userId', payload.id);
    await next()
});

blogRouter.post('/', async (c) => {
    const userId = c.get('userId');

    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body);
    if (!success) {
        c.status(400);
        return c.json({ error: "Invalid input" });
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: userId,
        }
    });

    return c.json({
        id: post.id
    });
})

blogRouter.put('/', async (c) => {
    const userId = c.get('userId');

    const body = await c.req.json();
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
        c.status(400);
        return c.json({ error: "Invalid input" });
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    prisma.post.update({
        where: {
            id: body.id,
            authorId: userId,
        },
        data: {
            title: body.title,
            content: body.content
        }
    });

    return c.text('updated post');
})

blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const posts = await prisma.post.findMany({
        select: {
            content: true,
            title: true,
            id: true,
            date: true,
            author: {
                select: {
                    name: true
                }
            },
            _count: {
                select: {
                    likes: true, 
                },
            },
        }
    });

    return c.json({
        posts
    });
})

blogRouter.get('/:id', async (c) => {
    const id = c.req.param('id');

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const post = await prisma.post.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                title: true,
                content: true,
                date: true,
                author: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: {
                        likes: true, 
                    },
                },
            }
        })
        if (!post) {
            c.status(404)
            return c.json({ error: "Post not found" })
        }
        return c.json({ post })
    } catch (e) {
        console.log(e)
        return c.json({ error: "Post not found" })
    }
})

// Like / unlike the post
blogRouter.post('/:id/like', async (c) => {
    const userId = c.get('userId')
    const postId = c.req.param('id')

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const existing = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: userId,
                    postId: postId
                }
            }
        })

        if (existing) {
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId: userId,
                        postId: postId
                    }
                }
            })
            return c.json({ liked: false })
        } else {
            await prisma.like.create({
                data: {
                    userId: userId,
                    postId: postId
                }
            })
            return c.json({ liked: true })
        }
    } catch (e) {
        console.error("Error toggling like:", e);
        c.status(500);
        return c.json({ error: "Could not toggle like" });
    }
})

// Get likes count
// blogRouter.get('/:id/likes', async (c) => {
//     const postId = c.req.param('id');

//     const prisma = new PrismaClient({
//         datasourceUrl: c.env?.DATABASE_URL,
//     }).$extends(withAccelerate());

//     try {
//         const count = await prisma.like.count({
//             where: { postId }
//         });
//         return c.json({ count });
//     } catch (e) {
//         console.error("Error fetching like count:", e);
//         c.status(500);
//         return c.json({ error: "Could not fetch like count" });
//     }
// });

blogRouter.get('/:id/liked', async (c) => {
    const userId = c.get('userId');
    const postId = c.req.param('id');

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const liked = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        return c.json({ liked: !!liked });
    } catch (e) {
        console.error("Error checking like:", e);
        c.status(500);
        return c.json({ error: "Could not check like status" });
    }
});



