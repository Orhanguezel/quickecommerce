<?php
//
//namespace App\Http\Resources\Admin;
//
//use App\Actions\ImageModifier;
//use Illuminate\Http\Request;
//use Illuminate\Http\Resources\Json\JsonResource;
//
//class AdminDeliverymanResource extends JsonResource
//{
//    /**
//     * Transform the resource into an array.
//     *
//     * @return array<string, mixed>
//     */
//    public function toArray(Request $request): array
//    {
//        // Get the requested language from the query parameter
//        $language = $request->input('language', 'en');
//        // Get the translation for the requested language
//        $translation = $this->vehicle_type?->related_translations->where('language', $language);
//        $area_translation = $this->area?->related_translations->where('language', $language);
//        return array_merge(parent::toArray($request), [
//            'full_name' => $this->full_name,  // Add your custom variable here
//            'vehicle_type' => $this->deliveryman?->vehicle_type
//                ? array_merge(
//                    $this->deliveryman?->vehicle_type->toArray(), // convert model to array first
//                    [
//                        'name' => !empty($translation) && $translation->where('key', 'name')->first()
//                            ? $translation->where('key', 'name')->first()->value
//                            : $this->deliveryman?->vehicle_type->name, // If language is empty or not provided attribute
//                    ]
//                )
//                : null,
//            'area' => $this->deliveryman?->area ? array_merge($this->deliveryman?->area?->toArray(), [
//                'name' => !empty($area_translation) && $area_translation->where('key', 'name')->first()
//                    ? $area_translation->where('key', 'name')->first()->value
//                    : $this->deliveryman?->area?->name, // If language is empty or not provided attribute
//            ]) : null,
//            'image_url' => ImageModifier::generateImageUrl($this->image),
//            'identification_photo_front_url' => asset('storage/' . $this->deliveryman?->identification_photo_front),
//            'identification_photo_back_url' => asset('storage/' . $this->deliveryman?->identification_photo_back),
//        ]);
//    }
//}


namespace App\Http\Resources\Admin;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminDeliverymanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $language = $request->input('language', 'en');
        $translation = $this->deliveryman?->vehicle_type?->related_translations->where('language', $language);
        $area_translation = $this->deliveryman?->area?->related_translations->where('language', $language);
        return [
            'id' => $this->deliveryman?->id,
            'user_id' => $this->id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'verification' => (bool)$this->is_verified,
            'identification_type' => $this->deliveryman?->identification_type,
            'vehicle_type' => $this->deliveryman?->vehicle_type
                ? array_merge(
                    $this->deliveryman?->vehicle_type->toArray(), // convert model to array first
                    [
                        'name' => !empty($translation) && $translation->where('key', 'name')->first()
                            ? $translation->where('key', 'name')->first()->value
                            : $this->deliveryman?->vehicle_type?->name, // If language is empty or not provided attribute
                    ]
                )
                : null,
            'area' => $this->deliveryman?->area ? array_merge($this->deliveryman?->area?->toArray(), [
                'name' => !empty($area_translation) && $area_translation->where('key', 'name')->first()
                    ? $area_translation->where('key', 'name')->first()->value
                    : $this->deliveryman?->area?->name, // If language is empty or not provided attribute
            ]) : null,
            'image_url' => ImageModifier::generateImageUrl($this->image),
            'identification_photo_front_url' => asset('storage/' . $this->deliveryman?->identification_photo_front),
            'identification_photo_back_url' => asset('storage/' . $this->deliveryman?->identification_photo_back),
            'is_verified' => $this->deliveryman->is_verified,
            'status' => $this->deliveryman?->status,
        ];
    }
}

