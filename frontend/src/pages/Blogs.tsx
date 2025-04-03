// import { Appbar } from "../components/Appbar"
// import { BlogCard } from "../components/BlogCard"
// import { BlogSkeleton } from "../components/BlogSkeleton";
// import { useBlogs } from "../hooks"


// export const Blogs = () => {
//     const { loading, blogs } = useBlogs();

//     if (loading) {
//         return <div className="flex justify-center ">
//             <div>
//                 <BlogSkeleton />
//                 <BlogSkeleton />
//                 <BlogSkeleton />
//                 <BlogSkeleton />
//                 <BlogSkeleton />
//             </div>
//         </div>
//     }
    
//     return <div>
//         <Appbar />
//         <div className="flex justify-center px-10">
//             <div>
//                 {blogs.map(blog => (
//                     <BlogCard
//                         id={blog.id}
//                         authorName={blog.author.name || "Anonymous"}
//                         title={blog.title}
//                         content={blog.content}
//                         publishedDate={"2nd feb 2020"}
//                     />
//                 ))}

//             </div>
//         </div>
//     </div>

// }

import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";

export const Blogs = () => {
    const { loading, blogs } = useBlogs();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center gap-6 py-6">
                <BlogSkeleton />
                <BlogSkeleton />
                <BlogSkeleton />
                <BlogSkeleton />
                <BlogSkeleton />
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-x-hidden">
            <Appbar />
            <div className="flex justify-center px-4 md:px-10 py-6">
                <div className="w-full max-w-screen-md flex flex-col gap-6">
                    {blogs.map((blog) => (
                        <BlogCard
                            key={blog.id}
                            id={blog.id}
                            authorName={blog.author.name || "Anonymous"}
                            title={blog.title}
                            content={blog.content}
                            publishedDate={"2nd Feb 2020"}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
