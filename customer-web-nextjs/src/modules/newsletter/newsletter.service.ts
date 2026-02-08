import { useMutation } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import type {
  NewsletterSubscribeInput,
  NewsletterSubscribeResponse,
} from "./newsletter.type";

export function useNewsletterSubscribeMutation() {
  const { create } = useBaseService<NewsletterSubscribeResponse, NewsletterSubscribeInput>("/subscribe");

  return useMutation({
    mutationFn: async (input: NewsletterSubscribeInput) => {
      const { data } = await create(input as unknown as Record<string, unknown>);
      return data;
    },
  });
}
