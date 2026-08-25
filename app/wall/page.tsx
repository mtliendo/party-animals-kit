import { listAnimals } from "@/lib/db/queries";
import { toPublicAnimal, type PublicAnimal } from "@/lib/animals";
import WallClient from "./wall-client";

export const dynamic = "force-dynamic";

export default async function WallPage() {
  let animals: PublicAnimal[] = [];
  try {
    animals = (await listAnimals()).map(toPublicAnimal);
  } catch {
    animals = [];
  }
  return <WallClient initialAnimals={animals} />;
}
