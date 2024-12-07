export class GameSDKError extends Error {
  code?: string;
  status?: number;
  details?: any;

  constructor(message: string, code?: string, status?: number, details?: any) {
    super(message);
    this.name = "GameSDKError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
