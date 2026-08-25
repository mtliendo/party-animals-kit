import { DESTINATION_GITHUB, type DestinationName } from "@/lib/config";
import { createGithubAdapter } from "./github";
import type { DestinationAdapter } from "./types";

export async function getDestination(
  name: DestinationName = DESTINATION_GITHUB,
): Promise<DestinationAdapter> {
  if (name !== DESTINATION_GITHUB) {
    throw new Error(
      `Destination "${name}" is not implemented. v1 ships GitHub only.`,
    );
  }
  return createGithubAdapter();
}

export type { DestinationAdapter, PublishInput, PublishResult } from "./types";
