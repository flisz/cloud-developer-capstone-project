/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdatePostRequest {
  name: string
  dueDate: string
  done: boolean
}