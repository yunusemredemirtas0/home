import PocketBase from 'pocketbase';

const PB_URL = "https://pb.yunusemredemirtas.com";
const ADMIN_EMAIL = "yunusemredmrts61@gmail.com";
const ADMIN_PASS = "89GYVOL2Qepr.!14611967";

async function checkSchema() {
    const pb = new PocketBase(PB_URL);
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
    
    const collections = ["posts", "projects"];
    for (const name of collections) {
        const coll = await pb.collections.getOne(name);
        console.log(`--- Collection: ${name} ---`);
        console.log("Using fields:", !!coll.fields);
        console.log("Using schema:", !!coll.schema);
        
        const fields = coll.fields || coll.schema || [];
        console.log("Fields found:", fields.map(f => f.name).join(", "));
        
        const statusField = fields.find(f => f.name === "status");
        console.log("Status field config:", JSON.stringify(statusField));
    }
}

checkSchema();
