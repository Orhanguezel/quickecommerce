export interface NewsletterSubscribeInput {
  email: string;
}

export interface NewsletterSubscribeResponse {
  success: boolean;
  message: string;
  subscriber: {
    id: number;
    email: string;
    status: number;
  };
}
