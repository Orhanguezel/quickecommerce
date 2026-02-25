import { z } from "zod";

export const shippingCampaignSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  image: z.string().optional(),
  background_color: z.string().optional(),
  title_color: z.string().optional(),
  description_color: z.string().optional(),
  button_text: z.string().optional(),
  button_text_color: z.string().optional(),
  button_bg_color: z.string().optional(),
  button_url: z.string().optional(),
  min_order_value: z.number().min(0, "Min order value must be 0 or greater"),
  status: z.boolean().optional(),
});

export type ShippingCampaignFormData = z.infer<typeof shippingCampaignSchema>;

export interface StatusUpdateData {
  id: string;
}
