export interface ResendEmailResponse {
  id: string;
}

export interface ResendErrorResponse {
  name: string;
  message: string;
  statusCode: number;
}

export interface EmailErrorResponse {
  id: string;
  error: string;
  statusCode?: number;
}

export type EmailResponse = ResendEmailResponse | EmailErrorResponse; 