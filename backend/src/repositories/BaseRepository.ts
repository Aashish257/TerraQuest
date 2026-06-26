// This file handles direct database queries and data access operations for base repository.
import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: any): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string | any, projection?: any, options?: QueryOptions): Promise<T | null> {
    return this.model.findById(id, projection, options);
  }

  async findOne(filter: FilterQuery<T>, projection?: any, options?: QueryOptions): Promise<T | null> {
    return this.model.findOne(filter, projection, options);
  }

  async find(filter: FilterQuery<T>, projection?: any, options?: QueryOptions): Promise<T[]> {
    return this.model.find(filter, projection, options);
  }

  async updateById(id: string | any, update: UpdateQuery<T>, options: any = { new: true }): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, options) as any;
  }

  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: any): Promise<any> {
    return this.model.updateOne(filter, update, options);
  }

  async deleteById(id: string | any, options?: QueryOptions): Promise<T | null> {
    return this.model.findByIdAndDelete(id, options) as any;
  }

  async deleteMany(filter: FilterQuery<T>): Promise<any> {
    return this.model.deleteMany(filter);
  }

  async findOneAndDelete(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    return this.model.findOneAndDelete(filter, options) as any;
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.model.aggregate(pipeline);
  }
}
