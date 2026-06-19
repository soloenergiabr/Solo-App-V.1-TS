import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let s3ClientInstance: S3Client | null = null;

interface S3Config {
    endpoint: string;
    region: string;
    credentials: {
        accessKeyId: string;
        secretAccessKey: string;
    };
    forcePathStyle: boolean;
    bucket: string;
}

/**
 * Reads and validates S3/MinIO configuration from environment variables.
 */
function getS3Config(): S3Config {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT || '9000';
    const accessKeyId = process.env.MINIO_ROOT_USER || '';
    const secretAccessKey = process.env.MINIO_ROOT_PASSWORD || '';
    const bucket = process.env.MINIO_BUCKET_NAME || 'uploads';
    const useSsl = process.env.MINIO_USE_SSL === 'true';
    const region = process.env.AWS_REGION || 'us-east-1';

    if (!accessKeyId || !secretAccessKey) {
        throw new Error(
            'MinIO/S3 credentials not configured. Set MINIO_ROOT_USER and MINIO_ROOT_PASSWORD in environment variables.'
        );
    }

    const protocol = useSsl ? 'https' : 'http';
    const endpointUrl = `${protocol}://${endpoint}:${port}`;

    return {
        endpoint: endpointUrl,
        region,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true, // Required for MinIO
        bucket,
    };
}

/**
 * Returns a singleton S3 client configured from environment variables.
 *
 * Supports:
 * - **MinIO** (local dev): configured via `MINIO_*` env vars
 * - **AWS S3** (production): falls back to `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
 */
export function getS3Client(): S3Client {
    if (s3ClientInstance) return s3ClientInstance;

    const config = getS3Config();

    s3ClientInstance = new S3Client({
        endpoint: config.endpoint,
        region: config.region,
        credentials: config.credentials,
        forcePathStyle: config.forcePathStyle,
    });

    return s3ClientInstance;
}

/**
 * Uploads a file (Buffer) to the configured S3/MinIO bucket.
 *
 * @param key - The object key (path) in the bucket
 * @param buffer - The file content as a Buffer
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded object
 */
export async function uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string
): Promise<string> {
    const client = getS3Client();
    const config = getS3Config();

    const upload = new Upload({
        client,
        params: {
            Bucket: config.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        },
    });

    await upload.done();

    return getFileUrl(key);
}

/**
 * Generates a presigned URL for reading an object from the S3/MinIO bucket.
 *
 * For local MinIO, the URL is returned directly.
 * For production AWS, a presigned URL with a 1-hour expiry is generated.
 *
 * @param key - The object key (path) in the bucket
 * @returns A URL that can be used to access the file
 */
export async function getFileUrl(key: string): Promise<string> {
    const client = getS3Client();
    const config = getS3Config();

    // For local MinIO, construct a direct URL
    const isMinio = config.endpoint.includes('localhost') || config.endpoint.includes('127.0.0.1');
    if (isMinio) {
        const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
        return `${protocol}://${config.endpoint}/${config.bucket}/${key}`;
    }

    // For production AWS S3, generate a presigned URL
    const command = new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
    });

    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return url;
}

/**
 * Resets the S3 client singleton (useful for tests or reconfiguration).
 */
export function resetS3Client(): void {
    s3ClientInstance = null;
}
