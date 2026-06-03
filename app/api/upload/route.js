import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@/lib/supabase/server';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Helper internal untuk menghapus berkas foto dari Cloudinary berdasarkan URL-nya.
 * Mengambil Public ID secara dinamis dari URL Cloudinary.
 * 
 * @param {string} imageUrl - URL lengkap berkas gambar di Cloudinary
 * @returns {Promise<any>} Response dari API Cloudinary uploader.destroy
 */
async function deleteImageFromCloudinary(imageUrl) {
    if (imageUrl && imageUrl.includes('res.cloudinary.com')) {
        try {
            const urlParts = imageUrl.split('/');
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
                return destroyResult;
            }
        } catch (err) {
            console.error("Gagal menghapus aset lama dari Cloudinary:", err);
            throw err;
        }
    }
    return null;
}

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

        // --- 2. VALIDASI MIME TYPE & UKURAN: Pastikan hanya berkas gambar yang diunggah ---
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxBytes = 2 * 1024 * 1024; // 2MB
        if (!allowedMimeTypes.includes(file.type)) {
            return NextResponse.json({ 
                error: 'Format berkas tidak didukung. Harap unggah gambar (JPG, PNG, GIF, atau WEBP).' 
            }, { status: 400 });
        }
        if (file.size > maxBytes) {
            return NextResponse.json({ error: 'Ukuran foto maksimal adalah 2MB.' }, { status: 400 });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Database Select Error:', profileError);
            return NextResponse.json({ error: 'Gagal mengambil data profil.' }, { status: 500 });
        }

        const oldImageUrl = profile?.avatar_url;

        // --- 4. PROSES HAPUS FOTO LAMA DI CLOUDINARY (Menggunakan Helper) ---
        if (oldImageUrl) {
            await deleteImageFromCloudinary(oldImageUrl);
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

export async function DELETE(request) {
    try {
        // --- 1. OTORISASI: Cek session user via Supabase Server Client ---
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' }, { status: 401 });
        }

        // --- 2. AMBIL URL FOTO SEKARANG LANGSUNG DARI DATABASE (Aman dari manipulasi parameter) ---
        const { data: profile, error: dbError } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();

        if (dbError) {
            console.error('Database Select Error:', dbError);
            return NextResponse.json({ error: 'Gagal mengambil data profil.' }, { status: 500 });
        }

        const currentImageUrl = profile?.avatar_url;

        // Jika tidak ada foto profil, langsung sukses
        if (!currentImageUrl) {
            return NextResponse.json({ success: true, message: 'Tidak ada foto profil yang aktif.' });
        }

        // --- 3. PROSES HAPUS FOTO DI CLOUDINARY ---
        await deleteImageFromCloudinary(currentImageUrl);

        // --- 4. UPDATE DATABASE: Set avatar_url menjadi null ---
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: null })
            .eq('id', user.id);

        if (updateError) {
            console.error('Database Update Error:', updateError);
            throw updateError;
        }

        console.log("=== HAPUS FOTO PROFIL SUKSES ===");
        return NextResponse.json({ success: true, message: 'Foto profil berhasil dihapus.' });

    } catch (error) {
        console.error('API Delete Error:', error);
        return NextResponse.json({ error: 'Gagal menghapus foto profil di server' }, { status: 500 });
    }
}