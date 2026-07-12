import { HTTP_STATUS } from '../constants';

export class UploadError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = HTTP_STATUS.BAD_REQUEST) {
    super(message);
    this.name = 'UploadError';
    this.statusCode = statusCode;
  }
}
