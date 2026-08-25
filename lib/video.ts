import { experimental_generateVideo as generateVideo } from "ai";
import { getVideoModel } from "@/lib/config";

const VIDEO_PROMPT =
  "Animate this party animal drawing. Keep the original shapes, colors, and personality. Make it bounce and move with fun energy. If the drawing includes text, use it as context only — do not render that text in the video.";

export async function generateAnimalVideo(imageUrl: string) {
  const { video } = await generateVideo({
    model: getVideoModel(),
    prompt: {
      image: imageUrl,
      text: VIDEO_PROMPT,
    },
    aspectRatio: "adaptive",
    duration: 5,
    poll: {
      intervalMs: 5000,
      timeoutMs: 240000,
    },
  });

  if (!video?.uint8Array?.length) {
    throw new Error("Video model returned no bytes");
  }

  const mediaType = video.mediaType || "video/mp4";
  return {
    bytes: video.uint8Array,
    mediaType,
  };
}
