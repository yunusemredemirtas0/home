import PocketBase from 'pocketbase';

const PB_URL = "https://pb.yunusemredemirtas.com";
const ADMIN_EMAIL = "yunusemredmrts61@gmail.com";
const ADMIN_PASS = "89GYVOL2Qepr.!14611967";

async function setupAnalyticsAndSEO() {
    const pb = new PocketBase(PB_URL);

    try {
        console.log("PocketBase Admin girişi yapılıyor...");
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
        console.log("Giriş başarılı.");

        // 1. 'views' alanlarını ekleme
        const collectionsToTrack = ["posts", "projects"];
        for (const collName of collectionsToTrack) {
            console.log(`'${collName}' koleksiyonuna 'views' alanı ekleniyor...`);
            const coll = await pb.collections.getOne(collName);
            
            const fields = coll.fields || coll.schema || [];
            const hasViews = fields.find(f => f.name === "views");

            if (!hasViews) {
                const viewsField = {
                    name: "views",
                    type: "number",
                    required: false,
                    options: { min: 0 }
                };

                if (coll.fields) coll.fields.push(viewsField);
                else coll.schema.push(viewsField);

                await pb.collections.update(coll.id, coll);
                console.log(`✅ '${collName}' koleksiyonuna 'views' alanı eklendi.`);
            } else {
                console.log(`ℹ️ '${collName}' koleksiyonunda 'views' alanı zaten mevcut.`);
            }
        }

        // 2. 'seo_settings' koleksiyonunu oluşturma
        try {
            await pb.collections.getOne("seo_settings");
            console.log("ℹ️ 'seo_settings' koleksiyonu zaten mevcut.");
        } catch (err) {
            console.log("'seo_settings' koleksiyonu oluşturuluyor...");
            const seoCollection = {
                name: "seo_settings",
                type: "base",
                schema: [
                    { name: "page_path", type: "text", required: true, unique: true },
                    { name: "title", type: "text", required: false },
                    { name: "description", type: "text", required: false },
                    { name: "keywords", type: "text", required: false }
                ],
                listRule: "", // Herkese açık (veya admin kısıtlaması ekleyebilirsin)
                viewRule: "",
                createRule: null, // Sadece admin
                updateRule: null, // Sadece admin
                deleteRule: null  // Sadece admin
            };
            await pb.collections.create(seoCollection);
            console.log("✅ 'seo_settings' koleksiyonu başarıyla oluşturuldu.");
        }

        console.log("\n🚀 Tüm işlemler başarıyla tamamlandı!");
    } catch (err) {
        console.error("\n❌ Hata oluştu:", err.message);
        if (err.data) console.error("Detay:", JSON.stringify(err.data, null, 2));
    }
}

setupAnalyticsAndSEO();
