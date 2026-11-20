import type { ListResult, RecordModel, RecordOptions } from "pocketbase";
import { pb } from "./client";

export interface ListQuery {
  page?: number;
  perPage?: number;
  filter?: string;
  sort?: string;
  expand?: string;
  fields?: string;
}

export class PocketBaseRepository<T extends RecordModel> {
  constructor(private readonly collection: string) {}

  list(query: ListQuery = {}): Promise<ListResult<T>> {
    const { page = 1, perPage = 30, filter, sort, expand, fields } = query;
    const options: RecordOptions = {};
    if (filter?.trim()) options.filter = filter.trim();
    if (sort?.trim()) options.sort = sort.trim();
    if (expand?.trim()) options.expand = expand.trim();
    if (fields?.trim()) options.fields = fields.trim();
    return pb.collection(this.collection).getList<T>(page, perPage, options);
  }

  get(id: string, options: RecordOptions = {}): Promise<T> {
    return pb.collection(this.collection).getOne<T>(id, options);
  }

  create(data: Record<string, unknown>): Promise<T> {
    return pb.collection(this.collection).create<T>(data);
  }

  update(id: string, data: Record<string, unknown>): Promise<T> {
    return pb.collection(this.collection).update<T>(id, data);
  }

  delete(id: string): Promise<boolean> {
    return pb.collection(this.collection).delete(id);
  }

  async count(filter = ""): Promise<number> {
    const result = await this.list({ page: 1, perPage: 1, filter });
    return result.totalItems;
  }
}
