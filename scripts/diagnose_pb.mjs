import PocketBase from 'pocketbase';

const PB_URL = "https://pb.yunusemredemirtas.com";
const ADMIN_EMAIL = "yunusemredmrts61@gmail.com";
const ADMIN_PASS = "89GYVOL2Qepr.!14611967";

async function diagnose() {
    const pb = new PocketBase(PB_URL);

    try {
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
        console.log("Admin logged in.\n");

        const collections = ["posts", "projects"];
        for (const collName of collections) {
            console.log(`--- Checking ${collName} ---`);
            try {
                const coll = await pb.collections.getOne(collName);
                console.log(`List Rule: ${JSON.stringify(coll.listRule)}`);
                console.log(`View Rule: ${JSON.stringify(coll.viewRule)}`);

                const records = await pb.collection(collName).getFullList({
                    sort: '-created',
                    requestKey: null // Disable auto cancellation
                });
                console.log(`Total records: ${records.length}`);
                if (records.length > 0) {
                    console.log("Recent records (Title - Slug - Status):");
                    records.slice(0, 5).forEach(r => {
                        console.log(`- ${r.title} | ${r.slug} | ${r.status}`);
                    });
                }
            } catch (innerErr) {
                console.error(`Error checking ${collName}:`, innerErr.message);
                if (innerErr.data) console.error("Data:", innerErr.data);
            }
            console.log("\n");
        }

    } catch (err) {
        console.error("Global error:", err.message);
    }
}

diagnose();
