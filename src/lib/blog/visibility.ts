import type { PostMeta } from "./schema";

export type DeploymentEnv = "production" | "preview" | "development";

/** Vercel's environment when present, otherwise NODE_ENV. */
export function deploymentEnv(): DeploymentEnv {
  const vercel = process.env.VERCEL_ENV;
  if (vercel === "production" || vercel === "preview" || vercel === "development") {
    return vercel;
  }
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

/** Drafts are hidden in production only. */
export function isPostVisible(post: Pick<PostMeta, "status">, env: DeploymentEnv): boolean {
  return !(post.status === "draft" && env === "production");
}
