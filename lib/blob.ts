import { del, list, put } from "@vercel/blob";
import { animalsBlobPrefix } from "@/lib/config";

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

export async function uploadPublicBlob(
  pathname: string,
  body: Blob | ArrayBuffer | Uint8Array,
  contentType: string,
) {
  const payload = body instanceof Uint8Array ? Buffer.from(body) : body;
  return put(pathname, payload, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    token: blobToken(),
  });
}

export async function deleteBlobsByPrefix(prefix: string) {
  const token = blobToken();
  let cursor: string | undefined;
  let deleted = 0;

  do {
    const page = await list({ prefix, cursor, token });
    if (page.blobs.length > 0) {
      await del(
        page.blobs.map((blob) => blob.url),
        { token },
      );
      deleted += page.blobs.length;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return deleted;
}

export async function wipeEventAnimalBlobs() {
  return deleteBlobsByPrefix(animalsBlobPrefix());
}

export async function deleteBlobUrls(urls: Array<string | null | undefined>) {
  const token = blobToken();
  const existing = urls.filter((url): url is string => Boolean(url));
  if (existing.length === 0) return;
  await del(existing, { token });
}
