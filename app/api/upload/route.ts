import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided." },
        { status: 400 }
      );
    }

    // ✅ Allowed image types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF formats are allowed.",
        },
        { status: 400 }
      );
    }

    // ✅ Max file size 5 MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File too large (max 5MB)." },
        { status: 400 }
      );
    }

    // ✅ Cloudinary credentials
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in your environment variables.",
        },
        { status: 500 }
      );
    }

    // ✅ Always use a safe folder path (no Windows-style local paths)
    const folder = "studio-insight/products";

    // ✅ Sanitize filename
    const safeFileName = file.name.split(/[/\\]/).pop() || "upload.jpg";
    const cleanFile = new File([file], safeFileName, { type: file.type });

    console.log("Uploading to Cloudinary:", safeFileName);

    // ✅ Prepare upload form data for Cloudinary
    const cloudForm = new FormData();
    cloudForm.append("file", cleanFile);
    cloudForm.append("upload_preset", uploadPreset);
    cloudForm.append("folder", folder);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudForm,
      }
    );

    if (!cloudRes.ok) {
      const errText = await cloudRes.text();
      console.error("Cloudinary upload failed:", errText);
      return NextResponse.json(
        { success: false, error: `Cloudinary upload failed: ${errText}` },
        { status: 500 }
      );
    }

    const result = await cloudRes.json();

    console.log("✅ Upload success:", result.secure_url);

    return NextResponse.json({
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Upload failed: ${msg}` },
      { status: 500 }
    );
  }
}
