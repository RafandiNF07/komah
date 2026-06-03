import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@/lib/supabase/server';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    try {
        // --- 1. OTORISASI: Cek session user via Supabase Server Client ---
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('foto');
        const role = formData.get('role') || 'customer';

        if (!file) {
            return NextResponse.json({ error: 'Tidak ada file yang dideteksi.' }, { status: 400 });
        }

        // --- 2. VALIDASI MIME TYPE: Pastikan hanya berkas gambar yang diunggah ---
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.type)) {
            return NextResponse.json({ 
                error: 'Format berkas tidak didukung. Harap unggah gambar (JPG, PNG, GIF, atau WEBP).' 
            }, { status: 400 });
        }

        // --- 3. AMBIL URL FOTO LAMA LANGSUNG DARI DATABASE (Lebih Aman dari Manipulasi Client) ---
        const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();

        const oldImageUrl = profile?.avatar_url;

        // --- 4. PROSES HAPUS FOTO LAMA DI CLOUDINARY ---
        if (oldImageUrl && oldImageUrl.includes('res.cloudinary.com')) {
            try {
                const urlParts = oldImageUrl.split('/');
                const uploadIndex = urlParts.indexOf('upload');

                if (uploadIndex !== -1) {
                    const hasVersion = urlParts[uploadIndex + 1].startsWith('v');
                    const startIndex = hasVersion ? uploadIndex + 2 : uploadIndex + 1;
                    const remainingPath = urlParts.slice(startIndex).join('/');
                    const publicId = remainingPath.substring(0, remainingPath.lastIndexOf('.'));

                    console.log("=== PROSES PEMBERSIHAN CLOUDINARY ===");
                    console.log("Menghapus Public ID:", publicId);

                    const destroyResult = await cloudinary.uploader.destroy(publicId);
                    console.log("Respon Hapus Cloudinary:", destroyResult);
                }
            } catch (err) {
                console.error("Gagal menghapus aset lama dari Cloudinary:", err);
            }
        }

        // Tentukan folder di Cloudinary
        const targetFolder = role === 'driver' ? 'driver_profiles' : 'customer_profiles';

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: targetFolder },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        console.log("=== UPLOAD FOTO BARU SUKSES ===");
        return NextResponse.json({ imageUrl: uploadResult.secure_url });

    } catch (error) {
        console.error('API Upload Error:', error);
        return NextResponse.json({ error: 'Gagal memproses di server' }, { status: 500 });
    }
}