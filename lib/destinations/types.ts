export type DestinationName = "github";

export type PublishInput = {
  token: string;
  handle?: string | null;
  imageUrl: string;
  videoUrl?: string | null;
};

export type PublishResult = {
  url: string;
};

export type DestinationAdapter = {
  name: DestinationName;
  connectionName: string;
  publish(input: PublishInput): Promise<PublishResult>;
};
