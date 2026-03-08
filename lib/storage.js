import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function generateDownloadUrl(fileKey, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw error;
  }
}

export async function generateEbookDownloadUrl(ebookId, userId) {
  try {
    // Verify user has access to this ebook
    const { prisma } = await import('./prisma');
    
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId,
        productId: ebookId,
        productType: 'ebook',
      },
    });

    if (!purchase) {
      throw new Error('Access denied: No valid purchase found');
    }

    const ebook = await prisma.ebook.findUnique({
      where: { id: ebookId },
    });

    if (!ebook) {
      throw new Error('Ebook not found');
    }

    // Extract file key from S3 URL
    const fileKey = ebook.fileUrl.split('/').pop();
    const downloadUrl = await generateDownloadUrl(fileKey, 3600); // 1 hour

    return {
      success: true,
      downloadUrl,
      expiresAt: new Date(Date.now() + 3600 * 1000),
    };
  } catch (error) {
    console.error('Error generating ebook download URL:', error);
    return {
      success: false,
      message: error.message,
    };
  }
}
