import PocketBase from 'pocketbase';

const PB_URL = "https://pb.yunusemredemirtas.com";
const ADMIN_EMAIL = "yunusemredmrts61@gmail.com";
const ADMIN_PASS = "89GYVOL2Qepr.!14611967";

async function check() {
    const pb = new PocketBase(PB_URL);
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
    
    try {
        const posts = await pb.collection('posts').getList(1, 1);
        console.log("Posts found:", posts.items.length);
        if (posts.items.length > 0) {
            console.log("First post slug:", posts.items[0].slug);
            console.log("First post status:", posts.items[0].status);
        }

        const projects = await pb.collection('projects').getList(1, 1);
        console.log("Projects found:", projects.items.length);
        if (projects.items.length > 0) {
            console.log("First project slug:", projects.items[0].slug);
            console.log("First project status:", projects.items[0].status);
        }
    } catch (e) {
        console.error("Error:", e.message);
        if (e.data) console.log(JSON.stringify(e.data));
    }
}

check();
