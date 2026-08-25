import { Octokit } from "octokit";
import { getAppBaseUrl, getGithubLabel, getGithubRepo } from "@/lib/config";
import { ensureBoothSettings } from "@/lib/db/queries";
import type { DestinationAdapter, PublishInput, PublishResult } from "./types";

function splitRepo(repo: string) {
  const [owner, name] = repo.split("/");
  if (!owner || !name) {
    throw new Error('GITHUB_ISSUE_REPO must be "owner/name"');
  }
  return { owner, repo: name };
}

export async function createGithubAdapter(): Promise<DestinationAdapter> {
  const settings = await ensureBoothSettings();
  const connectionName = settings.destinationConnection;
  const repo = settings.githubRepo || getGithubRepo();
  const label = settings.githubLabel || getGithubLabel();

  return {
    name: "github",
    connectionName,
    async publish(input: PublishInput): Promise<PublishResult> {
      if (!repo) {
        throw new Error("No GitHub repo configured. Set GITHUB_ISSUE_REPO.");
      }

      const { owner, repo: repoName } = splitRepo(repo);
      const octokit = new Octokit({ auth: input.token });
      const handle = sanitizeHandle(input.handle);
      const mention = handle ? `@${handle}` : "a booth guest";
      const wallUrl = `${getAppBaseUrl()}/wall`;

      const issue = await octokit.rest.issues.create({
        owner,
        repo: repoName,
        title: handle ? `🐾 ${mention}'s Party Animal` : "🐾 A Party Animal",
        body: [
          `![Party animal by ${mention}](${input.imageUrl})`,
          "",
          `🐾 **${mention}** drew this at the booth.`,
          "",
          input.videoUrl
            ? `🎬 [Watch the animation](${input.videoUrl})`
            : "_Animation is still generating._",
          "",
          `See every animal on [The Wall](${wallUrl}).`,
          "",
          "---",
          "_Posted by the booth operator via Auth0 Token Vault. No attendee GitHub login._",
        ].join("\n"),
        labels: label ? [label] : undefined,
      });

      return { url: issue.data.html_url };
    },
  };
}

function sanitizeHandle(value?: string | null) {
  if (!value) return "";
  return value.replace(/^@/, "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 39);
}
