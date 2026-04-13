import PocketBase from 'pocketbase';

const PB_URL = "https://pb.yunusemredemirtas.com";
const ADMIN_EMAIL = "yunusemredmrts61@gmail.com";
const ADMIN_PASS = "89GYVOL2Qepr.!14611967";

async function updateSchema() {
    const pb = new PocketBase(PB_URL);

    try {
        console.log("Admin girişi yapılıyor...");
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
        console.log("Giriş başarılı.");

        const collections = ["posts", "projects"];

        for (const collName of collections) {
            console.log(`'${collName}' koleksiyonu güncelleniyor...`);
            const coll = await pb.collections.getOne(collName);
            
            const fields = coll.fields || coll.schema || [];
            const hasStatus = fields.find(f => f.name === "status");

            if (!hasStatus) {
                const statusField = {
                    name: "status",
                    type: "select",
                    required: true,
                    values: ["draft", "published", "archived"],
                    maxSelect: 1
                };

                if (coll.fields) coll.fields.push(statusField);
                else coll.schema.push(statusField);

                await pb.collections.update(coll.id, coll);
                console.log(`'${collName}' koleksiyonuna 'status' alanı eklendi.`);
            } else {
                console.log(`'${collName}' koleksiyonunda 'status' alanı zaten mevcut.`);
            }
        }

        console.log("Şema güncelleme başarıyla tamamlandı!");
    } catch (err) {
        console.error("Hata oluştu:", err.message);
        if (err.data) console.error("Detay:", JSON.stringify(err.data, null, 2));
    }
}

updateSchema();
