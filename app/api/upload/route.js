import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('foto');
        const role = formData.get('role') || 'user_profiles';
        const oldImageUrl = formData.get('oldImageUrl');

        if (!file) {
            return NextResponse.json({ error: 'Tidak ada file yang dideteksi.' }, { status: 400 });
        }

        // --- PROSES HAPUS FOTO LAMA ---
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
                console.error("Gagal menghapus aset lama:", err);
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