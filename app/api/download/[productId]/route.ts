// app/api/download/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { DigitalProductDatabaseService } from '@/lib/digital-products-database'
import { getSessionFromRequest } from '@/lib/session-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const userId = searchParams.get('userId')

    if (!token || !userId) {
      return NextResponse.json(
        { error: 'Missing authentication parameters' },
        { status: 400 }
      )
    }

    // Verify token (in production, use proper JWT verification)
    // Token format: userId::productId::expiresAt (using :: as separator since UUIDs contain -)
    let expiresAt: string
    try {
      const decoded = atob(token)
      const parts = decoded.split('::')
      
      if (parts.length !== 3) {
        console.error('[Download] Invalid token format: wrong number of parts', parts.length)
        return NextResponse.json(
          { error: 'Invalid token format' },
          { status: 401 }
        )
      }
      
      const [tokenUserId, tokenProductId, tokenExpiresAt] = parts
      expiresAt = tokenExpiresAt
      
      console.log(`[Download] Token verification: userId=${tokenUserId === userId}, productId=${tokenProductId === productId}, expiresAt=${expiresAt}`)
      
      if (tokenUserId !== userId || tokenProductId !== productId) {
        console.error(`[Download] Token mismatch: tokenUserId=${tokenUserId}, userId=${userId}, tokenProductId=${tokenProductId}, productId=${productId}`)
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      // Check expiration
      const expirationDate = new Date(parseInt(expiresAt))
      if (expirationDate < new Date()) {
        console.error(`[Download] Token expired: ${expirationDate} < ${new Date()}`)
        return NextResponse.json(
          { error: 'Download link expired' },
          { status: 410 }
        )
      }
    } catch (error) {
      console.error('[Download] Token decode error:', error)
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      )
    }

    // CRITICAL: Verify userId from session matches request (prevent user impersonation)
    const session = getSessionFromRequest(request)
    if (!session || session.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access attempt' },
        { status: 403 }
      )
    }

    // CRITICAL SECURITY CHECK: Verify user has purchased and can download
    const canDownload = await DigitalProductDatabaseService.canUserDownload(userId, productId)
    
    if (!canDownload) {
      return NextResponse.json(
        { error: 'You have not purchased this product or download limit exceeded. Access denied.' },
        { status: 403 }
      )
    }

    // Get digital product WITH file data (if stored in database)
    const digitalProduct = await DigitalProductDatabaseService.getDigitalProductWithData(productId)
    if (!digitalProduct) {
      return NextResponse.json(
        { error: 'Digital product not found' },
        { status: 404 }
      )
    }

    console.log(`[Download] Digital product details:`, {
      id: digitalProduct.id,
      productId: digitalProduct.productId,
      fileName: digitalProduct.fileName,
      fileUrl: digitalProduct.fileUrl,
      fileSize: digitalProduct.fileSize,
      hasFileData: !!digitalProduct.fileData,
      fileDataSize: digitalProduct.fileData?.length || 0
    })

    // PRIORITY 1: If file is stored in database (fileData), serve it directly
    if (digitalProduct.fileData && digitalProduct.fileData.length > 0) {
      console.log(`[Download] ✅ Serving file from database (${digitalProduct.fileData.length} bytes)`)
      
      // Get product name for filename
      const { DatabaseProductService } = await import('@/lib/products-database')
      const product = await DatabaseProductService.getProduct(digitalProduct.productId)
      
      const originalFileName = digitalProduct.fileName || 'download'
      const fileExtension = originalFileName.split('.').pop() || 'pdf'
      const productName = product ? 
        product.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 
        'product'
      const safeFileName = `${productName}-${digitalProduct.productId}.${fileExtension}`
      
      // Track download
      await DigitalProductDatabaseService.trackDownload(userId, productId)
      
      // Determine content type
      const contentType = digitalProduct.fileType || 
        (fileExtension === 'pdf' ? 'application/pdf' :
         fileExtension === 'zip' ? 'application/zip' :
         fileExtension === 'epub' ? 'application/epub+zip' :
         'application/octet-stream')
      
      // Convert fileData (Buffer/Uint8Array) to ArrayBuffer for NextResponse
      // Create a copy to ensure we have a proper ArrayBuffer
      let fileBuffer: ArrayBuffer
      if (digitalProduct.fileData instanceof Buffer) {
        // Buffer to ArrayBuffer
        fileBuffer = new Uint8Array(digitalProduct.fileData).buffer
      } else if (digitalProduct.fileData instanceof Uint8Array) {
        // Uint8Array to ArrayBuffer
        fileBuffer = new Uint8Array(digitalProduct.fileData).buffer
      } else {
        // Assume it's already an ArrayBuffer - create a copy to be safe
        const view = new Uint8Array(digitalProduct.fileData as ArrayBuffer)
        fileBuffer = view.buffer
      }
      
      // Return file with proper headers
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(safeFileName)}`,
          'Content-Length': digitalProduct.fileData.length.toString(),
          'Cache-Control': 'no-cache',
        },
      })
    }
    
    // PRIORITY 2: Fallback to external storage (Cloudinary, etc.)
    if (!digitalProduct.fileUrl || digitalProduct.fileUrl.trim() === '') {
      return NextResponse.json(
        { error: 'File not available (no file data or URL found)' },
        { status: 404 }
      )
    }

    // Get product name for filename
    const { DatabaseProductService } = await import('@/lib/products-database')
    const product = await DatabaseProductService.getProduct(digitalProduct.productId)
    
    // Generate filename: productName-productId.extension
    const originalFileName = digitalProduct.fileName || 'download'
    const fileExtension = originalFileName.split('.').pop() || 'pdf'
    const productName = product ? 
      product.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 
      'product'
    const safeFileName = `${productName}-${digitalProduct.productId}.${fileExtension}`

    // Track download
    await DigitalProductDatabaseService.trackDownload(userId, productId)

    // Fetch file from Cloudinary/storage and stream it
    console.log(`[Download] Fallback: Attempting to fetch file from external URL: ${digitalProduct.fileUrl.substring(0, 100)}...`)
    
    // Extract public_id from Cloudinary URL and generate signed URL if needed
    // Format: https://res.cloudinary.com/cloudname/resource_type/upload/v1234567/folder/public_id.ext
    let fileUrl = digitalProduct.fileUrl
    const isCloudinaryUrl = fileUrl.includes('cloudinary.com')
    
    try {
      
      if (isCloudinaryUrl) {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME
        const apiKey = process.env.CLOUDINARY_API_KEY
        const apiSecret = process.env.CLOUDINARY_API_SECRET
        
        // Extract public_id from URL (includes folder path)
        // Format: https://res.cloudinary.com/cloudname/resource_type/upload/v1234567/folder/subfolder/file
        const cloudinaryMatch = fileUrl.match(/cloudinary\.com\/[^\/]+\/([^\/]+)\/upload\/v\d+\/(.+)$/)
        
        if (cloudinaryMatch && cloudName && apiKey && apiSecret) {
          const resourceType = cloudinaryMatch[1] // 'raw', 'video', etc.
          const pathWithExt = cloudinaryMatch[2] // 'studio-insight/digital-products/product-123/file.pdf'
          
          // Extract public_id: remove file extension but keep folder path
          const publicId = pathWithExt.replace(/\.\w+$/, '') // 'studio-insight/digital-products/product-123/file'
          
          console.log(`[Download] Extracted public_id: ${publicId}, resource_type: ${resourceType}`)
          
          // Use Cloudinary SDK to generate signed URL (works even if file is "Blocked for delivery")
          try {
            const { v2: cloudinary } = await import('cloudinary')
            cloudinary.config({
              cloud_name: cloudName,
              api_key: apiKey,
              api_secret: apiSecret,
            })
            
            // Generate signed URL using Cloudinary SDK
            const resourceTypeForSDK = resourceType === 'video' ? 'video' : 'raw'
            const signedUrl = cloudinary.url(publicId, {
              resource_type: resourceTypeForSDK,
              secure: true,
              sign_url: true,
              type: 'upload', // Explicitly set to upload type
            })
            
            console.log(`[Download] ✅ Generated signed URL using Cloudinary SDK for public_id: ${publicId}`)
            console.log(`[Download] Signed URL: ${signedUrl.substring(0, 150)}...`)
            fileUrl = signedUrl
          } catch (sdkError) {
            console.error(`[Download] Cloudinary SDK failed:`, sdkError)
            // Fallback: Use original URL (may fail if blocked)
            console.warn(`[Download] Falling back to original URL`)
          }
        } else {
          console.warn(`[Download] Could not extract public_id from Cloudinary URL: ${fileUrl}`)
        }
      } else {
        console.log(`[Download] Not a Cloudinary URL, using as-is: ${fileUrl.substring(0, 100)}...`)
      }
    } catch (urlError) {
      console.error(`[Download] Error processing URL:`, urlError)
      // Continue with original URL
    }
    
    // For Cloudinary files, try to use Admin API to download directly (works even if blocked)
    // This is more reliable than signed URLs for blocked files
    if (isCloudinaryUrl && process.env.CLOUDINARY_API_SECRET) {
      try {
        // Extract public_id from URL
        const cloudinaryMatch = digitalProduct.fileUrl.match(/cloudinary\.com\/[^\/]+\/([^\/]+)\/upload\/(?:v\d+\/|s--[^\/]+--\/v\d+\/)?(.+)$/)
        if (cloudinaryMatch) {
          const resourceType = cloudinaryMatch[1]
          const pathWithExt = cloudinaryMatch[2]
          // Remove signature and version if present, keep only the path
          const cleanPath = pathWithExt.replace(/^s--[^\/]+--\/v\d+\//, '').replace(/^v\d+\//, '')
          const publicId = cleanPath.replace(/\.\w+$/, '')
          
          console.log(`[Download] Using Admin API to download file with public_id: ${publicId}, resource_type: ${resourceType}`)
          
          // Use Cloudinary Admin API to get the file directly via API (bypasses delivery restrictions)
          const cloudName = process.env.CLOUDINARY_CLOUD_NAME!
          const apiKey = process.env.CLOUDINARY_API_KEY!
          const apiSecret = process.env.CLOUDINARY_API_SECRET!
          
          // Generate authentication signature for Admin API
          const crypto = await import('crypto')
          const timestamp = Math.floor(Date.now() / 1000)
          const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
          const signature = crypto.createHash('sha1').update(signatureString).digest('hex')
          
          // Use Admin API endpoint to download the file directly
          // This works even if file is "Blocked for delivery"
          const resourceTypeForAPI = resourceType === 'video' ? 'video' : 'raw'
          const adminApiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceTypeForAPI}/download?public_id=${encodeURIComponent(publicId)}&api_key=${apiKey}&timestamp=${timestamp}&signature=${signature}`
          
          console.log(`[Download] Fetching via Admin API: ${adminApiUrl.substring(0, 150)}...`)
          
          const adminResponse = await fetch(adminApiUrl, {
            method: 'GET',
          })
          
          if (adminResponse.ok) {
            console.log(`[Download] ✅ Admin API download successful, streaming file`)
            // Stream the file directly from Admin API response
            const fileBuffer = await adminResponse.arrayBuffer()
            
            // Get product name for filename
            const { DatabaseProductService } = await import('@/lib/products-database')
            const product = await DatabaseProductService.getProduct(digitalProduct.productId)
            
            const originalFileName = digitalProduct.fileName || 'download'
            const fileExtension = originalFileName.split('.').pop() || 'pdf'
            const productName = product ? 
              product.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 
              'product'
            const safeFileName = `${productName}-${digitalProduct.productId}.${fileExtension}`
            
            // Track download
            await DigitalProductDatabaseService.trackDownload(userId, productId)
            
            // Determine content type
            const contentType = digitalProduct.fileType || 
              (fileExtension === 'pdf' ? 'application/pdf' :
               fileExtension === 'zip' ? 'application/zip' :
               fileExtension === 'epub' ? 'application/epub+zip' :
               'application/octet-stream')
            
            // Return file with proper headers
            return new NextResponse(fileBuffer, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(safeFileName)}`,
                'Content-Length': fileBuffer.byteLength.toString(),
                'Cache-Control': 'no-cache',
              },
            })
          } else {
            console.error(`[Download] Admin API download failed: ${adminResponse.status} ${adminResponse.statusText}`)
            // Fall through to try regular signed URL
          }
        }
      } catch (adminError) {
        console.error(`[Download] Admin API error:`, adminError)
        // Fall through to try regular fetch
      }
    }
    
    // Fallback: Try regular fetch with signed URL
    try {
      let fileResponse = await fetch(fileUrl, {
        redirect: 'follow'
      })
      
      if (!fileResponse.ok) {
        console.error(`[Download] Failed to fetch file from ${fileUrl}:`, {
          status: fileResponse.status,
          statusText: fileResponse.statusText,
          headers: Object.fromEntries(fileResponse.headers.entries())
        })
        
        // More helpful error message with instructions
        let errorMessage = `File not found in storage (Status: ${fileResponse.status})`
        let details = 'Check Cloudinary console for file access settings'
        
        if (fileResponse.status === 403 || fileResponse.status === 401) {
          errorMessage = 'Bestand is geblokkeerd in Cloudinary (Blocked for delivery). Dit gebeurt vaak met PDF/ZIP bestanden op free tier accounts.'
          details = 'Oplossing: Ga naar Cloudinary Console → Security Settings → Zet "Allow delivery of PDF and ZIP files" aan. Of gebruik het admin endpoint /api/admin/fix-cloudinary-access om het automatisch te proberen.'
        } else if (fileResponse.status === 404) {
          errorMessage = 'Bestand niet gevonden in Cloudinary. Het bestand kan verwijderd zijn of de URL is incorrect.'
          details = 'Controleer of het bestand nog bestaat in Cloudinary Media Library.'
        }
        
        return NextResponse.json(
          { 
            error: errorMessage, 
            url: fileUrl.substring(0, 150), 
            details: details,
            status: fileResponse.status,
            solution: fileResponse.status === 403 || fileResponse.status === 401 ? 
              'Activeer PDF/ZIP delivery in Cloudinary Security Settings' : 
              'Controleer of het bestand bestaat in Cloudinary'
          },
          { status: fileResponse.status || 404 }
        )
      }
      
      console.log(`[Download] ✅ Successfully fetched file, size: ${fileResponse.headers.get('Content-Length')} bytes`)

      // Get file content
      const fileBuffer = await fileResponse.arrayBuffer()
      
      // Determine content type
      const contentType = digitalProduct.fileType || 
        (fileExtension === 'pdf' ? 'application/pdf' :
         fileExtension === 'zip' ? 'application/zip' :
         fileExtension === 'epub' ? 'application/epub+zip' :
         'application/octet-stream')

      // Return file with proper headers for download
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(safeFileName)}`,
          'Content-Length': fileBuffer.byteLength.toString(),
          'Cache-Control': 'no-cache',
        },
      })
    } catch (error) {
      console.error('[Download] Error fetching file:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve file' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Generate secure download link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const { userId } = await request.json()

    // Check authentication via session
    const session = getSessionFromRequest(request)
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // CRITICAL: Verify userId from request matches session (prevent user impersonation)
    if (userId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized access attempt' },
        { status: 403 }
      )
    }

    // CRITICAL SECURITY CHECK: Verify user has purchased the product
    const canDownload = await DigitalProductDatabaseService.canUserDownload(userId, productId)
    
    if (!canDownload) {
      return NextResponse.json(
        { error: 'You have not purchased this product or download limit exceeded. Access denied.' },
        { status: 403 }
      )
    }
    
    // Get digital product to generate download URL
    const digitalProduct = await DigitalProductDatabaseService.getDigitalProduct(productId)
    
    if (!digitalProduct) {
      return NextResponse.json(
        { error: 'Digital product not found' },
        { status: 404 }
      )
    }

    // Generate a secure download URL with token (30 days expiry)
    // Using :: as separator since UUIDs contain - characters
    const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days expiry
    const token = btoa(`${userId}::${productId}::${expiryTime}`)
    const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/download/${productId}?token=${encodeURIComponent(token)}&userId=${userId}`
    
    console.log(`[Download] Generated token for userId=${userId}, productId=${productId}, expiresAt=${expiryTime}`)

    return NextResponse.json({
      success: true,
      downloadUrl: downloadUrl
    })

  } catch (error) {
    console.error('Generate download link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

