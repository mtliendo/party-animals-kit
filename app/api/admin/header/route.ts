import { headerBlobPath } from "@/lib/config";
import { requireOperatorApi } from "@/lib/operator";
import { deleteBlobUrls, uploadPublicBlob } from "@/lib/blob";
import { ensureBoothSettings, updateBoothSettings } from "@/lib/db/queries";

export async function POST(request: Request) {
  const { error } = await requireOperatorApi();
  if (error) return error;

  const formData = await request.formData();
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return Response.json({ error: "Choose a header image." }, { status: 400 });
  }

  const settings = await ensureBoothSettings();
  const pathname = `${headerBlobPath()}.${extensionFor(image.type)}`;
  const stored = await uploadPublicBlob(pathname, image, image.type || "image/png");

  if (settings.headerImageUrl && settings.headerImageUrl !== stored.url) {
    await deleteBlobUrls([settings.headerImageUrl]);
  }

  const updated = await updateBoothSettings({
    headerImageUrl: stored.url,
    headerBlobPathname: pathname,
  });

  return Response.json({
    headerImageUrl: updated.headerImageUrl,
    headerMode: "custom",
  });
}

export async function DELETE() {
  const { error } = await requireOperatorApi();
  if (error) return error;
  const settings = await ensureBoothSettings();
  if (settings.headerImageUrl) {
    await deleteBlobUrls([settings.headerImageUrl]);
  }
  await updateBoothSettings({
    headerImageUrl: null,
    headerBlobPathname: null,
  });
  return Response.json({ headerImageUrl: null, headerMode: "default" });
}

function extensionFor(type: string) {
  if (type.includes("jpeg") || type.includes("jpg")) return "jpg";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  return "png";
}
