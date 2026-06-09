import { apiFetch } from '@/lib/api'

export abstract class BaseService<T> {
  protected tableName: string
  protected endpoint: string

  constructor(tableName: string) {
    this.tableName = tableName
    this.endpoint = `/${tableName.replace(/_/g, '-')}`
  }

  async getAll(): Promise<T[]> {
    return apiFetch(this.endpoint) as Promise<T[]>
  }

  async getById(id: string): Promise<T> {
    return apiFetch(`${this.endpoint}/${id}`) as Promise<T>
  }

  async create(payload: Partial<T>): Promise<T> {
    return apiFetch(this.endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<T>
  }

  async update(id: string, payload: Partial<T>): Promise<T> {
    return apiFetch(`${this.endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }) as Promise<T>
  }

  async delete(id: string): Promise<boolean> {
    await apiFetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    })
    return true
  }
}
