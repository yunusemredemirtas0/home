import PocketBase from 'pocketbase';

const PB_URL = "https://pb.yunusemredemirtas.com";
const ADMIN_EMAIL = "yunusemredmrts61@gmail.com";
const ADMIN_PASS = "89GYVOL2Qepr.!14611967";

async function updateContentSEOSchema() {
    const pb = new PocketBase(PB_URL);

    try {
        console.log("PocketBase Admin girişi yapılıyor...");
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
        console.log("Giriş başarılı.");

        const seoFields = [
            { name: "seo_title", type: "text", required: false },
            { name: "seo_description", type: "text", required: false },
            { name: "seo_keywords", type: "text", required: false }
        ];

        const collections = ["posts", "projects"];
        for (const collName of collections) {
            console.log(`'${collName}' koleksiyonu güncelleniyor...`);
            const coll = await pb.collections.getOne(collName);
            
            const existingFields = coll.fields || coll.schema || [];
            let updated = false;

            for (const field of seoFields) {
                const alreadyExists = existingFields.find(f => f.name === field.name);
                if (!alreadyExists) {
                    if (coll.fields) coll.fields.push(field);
                    else coll.schema.push(field);
                    updated = true;
                    console.log(`✅ '${collName}' koleksiyonuna '${field.name}' alanı eklendi.`);
                }
            }

            if (updated) {
                await pb.collections.update(coll.id, coll);
                console.log(`🚀 '${collName}' şeması başarıyla kaydedildi.`);
            } else {
                console.log(`ℹ️ '${collName}' koleksiyonunda tüm SEO alanları zaten mevcut.`);
            }
        }

        console.log("\n✨ Tüm işlemler başarıyla tamamlandı!");
    } catch (err) {
        console.error("\n❌ Hata oluştu:", err.message);
        if (err.data) console.error("Detay:", JSON.stringify(err.data, null, 2));
    }
}

updateContentSEOSchema();
