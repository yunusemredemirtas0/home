import PocketBase from 'pocketbase';

const PB_URL = "https://pb.yunusemredemirtas.com";

async function replicate() {
    const pb = new PocketBase(PB_URL); // No auth, just like the server component
    
    try {
        const slug = "123";
        console.log(`Fetching post with slug: ${slug}...`);
        const post = await pb.collection('posts').getFirstListItem(`slug="${slug}" && status="published"`, {
            expand: 'author'
        });
        console.log("Post found:", post.title);
    } catch (e) {
        console.error("Replication Error:", e.message);
        console.log("Status code:", e.status);
    }

    try {
        const slug = "123";
        console.log(`\nFetching project with slug: ${slug}...`);
        const project = await pb.collection('projects').getFirstListItem(`slug="${slug}" && status="published"`);
        console.log("Project found:", project.title);
    } catch (e) {
        console.error("Replication Error:", e.message);
        console.log("Status code:", e.status);
    }
}

replicate();
