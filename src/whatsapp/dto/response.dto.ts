export class ResponseCountDto<T> {
  data: T[];
  count: number;

  constructor(data: T[]) {
    this.data = data;
    this.count = data.length;
  }
}
