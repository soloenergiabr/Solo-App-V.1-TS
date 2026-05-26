import { createHash, createHmac } from 'crypto';

type UploadObjectInput = {
    key: string;
    body: Buffer;
    contentType: string;
};

type ObjectStorageConfig = {
    endpoint: string;
    port?: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    useSsl: boolean;
    region: string;
};

function getConfig(): ObjectStorageConfig {
    const endpoint = process.env.MINIO_ENDPOINT;
    const accessKeyId = process.env.MINIO_ROOT_USER;
    const secretAccessKey = process.env.MINIO_ROOT_PASSWORD;
    const bucket = process.env.MINIO_BUCKET_NAME;

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
        throw new Error('Object storage is not configured');
    }

    return {
        endpoint,
        port: process.env.MINIO_PORT,
        accessKeyId,
        secretAccessKey,
        bucket,
        useSsl: process.env.MINIO_USE_SSL === 'true',
        region: process.env.MINIO_REGION || 'us-east-1',
    };
}

function sha256Hex(value: string | Buffer): string {
    return createHash('sha256').update(value).digest('hex');
}

function hmac(key: Buffer | string, value: string): Buffer {
    return createHmac('sha256', key).update(value).digest();
}

function toAmzDate(date: Date): string {
    return date.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function encodeKeyPath(key: string): string {
    return key
        .split('/')
        .map(part => encodeURIComponent(part))
        .join('/');
}

function buildBaseUrl(config: ObjectStorageConfig): URL {
    const protocol = config.useSsl ? 'https' : 'http';
    const host = config.port ? `${config.endpoint}:${config.port}` : config.endpoint;
    return new URL(`${protocol}://${host}`);
}

function buildSigningKey(secretAccessKey: string, dateStamp: string, region: string): Buffer {
    const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
    const kRegion = hmac(kDate, region);
    const kService = hmac(kRegion, 's3');
    return hmac(kService, 'aws4_request');
}

export function getObjectUrl(key: string): string {
    const config = getConfig();
    const baseUrl = buildBaseUrl(config);
    baseUrl.pathname = `/${config.bucket}/${encodeKeyPath(key)}`;
    return baseUrl.toString();
}

export async function uploadObject({ key, body, contentType }: UploadObjectInput): Promise<{ key: string; url: string }> {
    const config = getConfig();
    const now = new Date();
    const amzDate = toAmzDate(now);
    const dateStamp = amzDate.slice(0, 8);
    const payloadHash = sha256Hex(body);
    const baseUrl = buildBaseUrl(config);
    const encodedPath = `/${config.bucket}/${encodeKeyPath(key)}`;
    const requestUrl = new URL(baseUrl.toString());

    requestUrl.pathname = encodedPath;

    const host = requestUrl.host;
    const headers: Record<string, string> = {
        'content-type': contentType,
        host,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
    };

    const signedHeaders = Object.keys(headers).sort().join(';');
    const canonicalHeaders = Object.keys(headers)
        .sort()
        .map(name => `${name}:${headers[name]}\n`)
        .join('');

    const canonicalRequest = [
        'PUT',
        encodedPath,
        '',
        canonicalHeaders,
        signedHeaders,
        payloadHash,
    ].join('\n');

    const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
    const stringToSign = [
        'AWS4-HMAC-SHA256',
        amzDate,
        credentialScope,
        sha256Hex(canonicalRequest),
    ].join('\n');

    const signature = createHmac('sha256', buildSigningKey(config.secretAccessKey, dateStamp, config.region))
        .update(stringToSign)
        .digest('hex');

    const authorization = [
        `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}`,
        `SignedHeaders=${signedHeaders}`,
        `Signature=${signature}`,
    ].join(', ');

    const response = await fetch(requestUrl, {
        method: 'PUT',
        headers: {
            ...headers,
            authorization,
        },
        body,
    });

    if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(`Object storage upload failed: ${response.status} ${errorBody}`);
    }

    return {
        key,
        url: getObjectUrl(key),
    };
}
