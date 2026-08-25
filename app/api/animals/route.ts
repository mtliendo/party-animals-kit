import { after } from "next/server";
import { animalDrawingPath } from "@/lib/config";
import { createAnimal, listAnimals, updateAnimal } from "@/lib/db/queries";
import { toPublicAnimal } from "@/lib/animals";
import { uploadPublicBlob } from "@/lib/blob";
import { processAnimal } from "@/lib/pipeline";

export const maxDuration = 300;

export async function GET() {
  try {
    const animals = await listAnimals();
    return Response.json(animals.map(toPublicAnimal));
  } catch (error) {
    console.error("[GET /api/animals]", error);
    return Response.json({ error: "Failed to load the wall" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const handleValue = formData.get("handle");

    if (!(image instanceof File) || image.size === 0) {
      return Response.json({ error: "Draw something first." }, { status: 400 });
    }

    const handle =
      typeof handleValue === "string" && handleValue.trim()
        ? handleValue
            .replace(/^@/, "")
            .replace(/[^a-zA-Z0-9-]/g, "")
            .slice(0, 39)
        : null;

    const animal = await createAnimal({ handle });
    const pathname = animalDrawingPath(animal.id);
    const stored = await uploadPublicBlob(pathname, image, "image/png");
    const saved = await updateAnimal(animal.id, {
      imageUrl: stored.url,
      imageBlobPathname: pathname,
    });

    after(async () => {
      try {
        await processAnimal(animal.id);
      } catch (error) {
        console.error("[processAnimal]", error);
      }
    });

    return Response.json(toPublicAnimal(saved ?? { ...animal, imageUrl: stored.url }), {
      status: 201,
    });
  } catch (error) {
    console.error("[POST /api/animals]", error);
    return Response.json({ error: "Submission failed" }, { status: 500 });
  }
}
