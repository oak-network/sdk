import type { File, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface FileService {
  upload(files: unknown): Promise<Result<File.UploadResponse>>;
  list(): Promise<Result<File.ListResponse>>;
  get(fileId: string): Promise<Result<File.GetResponse>>;
  delete(fileId: string): Promise<Result<File.DeleteResponse>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns FileService instance
 */
export const createFileService = (client: OakClient): FileService => ({
  async upload(files: unknown): Promise<Result<File.UploadResponse>> {
    return withAuth(client, (token) =>
      httpClient.post<File.UploadResponse>(
        buildUrl(client.config.baseUrl, "api/v1/files"),
        files,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async list(): Promise<Result<File.ListResponse>> {
    return withAuth(client, (token) =>
      httpClient.get<File.ListResponse>(
        buildUrl(client.config.baseUrl, "api/v1/files"),
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async get(fileId: string): Promise<Result<File.GetResponse>> {
    return withAuth(client, (token) =>
      httpClient.get<File.GetResponse>(
        buildUrl(client.config.baseUrl, "api/v1/files", fileId),
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async delete(fileId: string): Promise<Result<File.DeleteResponse>> {
    return withAuth(client, (token) =>
      httpClient.delete<File.DeleteResponse>(
        buildUrl(client.config.baseUrl, "api/v1/files", fileId),
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
