<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Com\SupportTicket\SupportTicketDetailsResource;
use App\Http\Resources\Com\SupportTicket\SupportTicketMessageResource;
use App\Http\Resources\Com\SupportTicket\SupportTicketResource;
use App\Interfaces\SupportTicketSystemInterface;
use App\Models\Store;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SellerSupportTicketManageController extends Controller
{
    public function __construct(protected SupportTicketSystemInterface $ticketRepo)
    {

    }

    public function listSupportTickets(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'store_id' => 'required|integer|exists:stores,id',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $filters = $request->only([
            'store_id',
            'department_id',
            'status',
            'priority',
            'per_page',
        ]);
        $tickets = $this->ticketRepo->getSellerStoreTickets($filters);
        if ($tickets->count() > 0) {
            return response()->json([
                'data' => SupportTicketResource::collection($tickets),
                'meta' => new PaginationResource($tickets),
            ], 200);
        } else {
            return [];
        }
    }

    public function getSupportTicketById(Request $request)
    {
        $ticketId = $request->id;
        $seller = auth('api')->user();
        $seller_stores = Store::where('store_seller_id', $seller->id)->pluck('id');
        $ticket = $this->ticketRepo->getTicketById($ticketId);
        if ($seller_stores->contains($ticket->store_id)) {
            return response()->json(new SupportTicketDetailsResource($ticket), 200);
        } else {
            return response()->json(['message' => __('messages.data_not_found')], 404);
        }
    }

    public function createSupportTicket(Request $request)
    {
        if (!auth('api')->check()) {
            unauthorized_response();
        }
        $validator = Validator::make($request->all(), [
            'store_id' => 'required|exists:stores,id',
            'department_id' => 'nullable|exists:departments,id',
            'title' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'priority' => 'nullable|in:high,medium,low,urgent',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $seller = auth('api')->user();
        $seller_stores = Store::where('store_seller_id', $seller->id)->pluck('id');
        if (!$seller_stores->contains($request->store_id)) {
            return response()->json([
                'message' => __('messages.store.doesnt.belongs.to.seller'),
            ], 422);
        }
        $request['store_id'] = $request->store_id;

        $ticket = $this->ticketRepo->createTicket($request->all());
        return response()->json([
            'status' => true,
            'status_code' => 201,
            'message' => __('messages.save_success', ['name' => 'Support Ticket']),
        ], 201);
    }

    public function updateSupportTicket(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer|exists:tickets,id',
            'department_id' => 'nullable|exists:departments,id',
            'title' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'priority' => 'nullable|in:high,medium,low,urgent',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $ticket = Ticket::find($request->id);
        $seller = auth('api')->user();
        $seller_stores = Store::where('store_seller_id', $seller->id)->pluck('id');
        $isClosed = $ticket->status === 0;
        if ($isClosed) {
            return response()->json([
                'message' => __('messages.ticket.closed')
            ], 422);
        }
        if (!$seller_stores->contains($ticket->store_id)) {
            return response()->json([
                'message' => __('messages.ticket_does_not_belongs_to_this_store'),
            ], 422);
        }
        $success = $this->ticketRepo->updateTicket($request->only([
            'id',
            'department_id',
            'title',
            'subject',
            'priority'
        ]));
        if ($success) {
            return response()->json([
                'message' => __('messages.update_success', ['name' => 'Support Ticket']),
            ], 200);
        } else {
            return response()->json([
                'message' => __('messages.update_failed', ['name' => 'Support Ticket']),
            ], 500);
        }


    }

    public function changePriorityStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ticket_id' => 'required|integer|exists:tickets,id',
            'priority' => 'required|in:high,medium,low,urgent',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $ticket = Ticket::find($request->ticket_id);
        $seller = auth('api')->user();
        $seller_stores = Store::where('store_seller_id', $seller->id)->pluck('id');
        $isClosed = $ticket->status === 0;
        if ($isClosed) {
            return response()->json([
                'message' => __('messages.ticket.closed')
            ], 422);
        }
        if (!$seller_stores->contains($ticket->store_id)) {
            return response()->json([
                'message' => __('messages.ticket_does_not_belongs_to_this_store'),
            ], 422);
        }
        $success = $ticket->update([
            'priority' => $request->priority
        ]);
        if ($success) {
            return response()->json([
                'message' => __('messages.update_success', ['name' => 'Support Ticket priority']),
            ], 200);
        } else {
            return response()->json([
                'message' => __('messages.update_failed', ['name' => 'Support Ticket priority']),
            ], 500);
        }
    }

    public function resolveSupportTicket(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ticket_id' => 'required|integer|exists:tickets,id',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $ticketId = $request->ticket_id;
        $seller = auth('api')->user();
        $seller_stores = Store::where('store_seller_id', $seller->id)->pluck('id');
        $ticket = Ticket::find($ticketId);
        if (!$seller_stores->contains($ticket->store_id)) {
            return response()->json([
                'message' => __('messages.ticket_does_not_belongs_to_this_store'),
            ], 422);
        }
        $success = $this->ticketRepo->resolveTicket($ticketId);
        if ($success) {
            return response()->json([
                'message' => __('messages.ticket.resolved'),
            ], 200);
        } else {
            return response()->json([
                'message' => __('messages.update_failed', ['name' => 'Support Ticket status']),
            ], 200);
        }
    }

    public function addMessage(Request $request)
    {
        if (!auth('api')->check()) {
            return unauthorized_response();
        }

        $seller = auth('api')->user();

        $validator = Validator::make($request->all(), ([
            'ticket_id' => 'required|exists:tickets,id',
            'store_id' => 'required|exists:stores,id',
            'message' => 'nullable|string|max:1500',
            'file' => 'nullable|file|mimes:jpg,png,jpeg,webp,zip,pdf|max:2048',
        ]));
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        if (!$request->file('file') && (is_null($request->message) || trim($request->message) === '')) {
            return response()->json([
                'status' => false,
                'message' => 'Both file and message cannot be empty'
            ]);
        }

        $seller = auth('api')->user();
        $seller_stores = Store::where('store_seller_id', $seller->id)->pluck('id');
        $ticket = Ticket::find($request->ticket_id);
        if (!$seller_stores->contains($ticket->store_id)) {
            return response()->json([
                'message' => __('messages.ticket_does_not_belongs_to_this_store'),
            ], 422);
        }

        $filename = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = 'uploads/support-ticket/' . now()->timestamp . '_' . str_replace(['@', '.'], '_', $seller->email) . '_' . $file->getClientOriginalName();
            Storage::disk('import')->put($filename, file_get_contents($file->getRealPath()));
        }
        $messageDetails = [
            'ticket_id' => $request->ticket_id,
            'sender_id' => $request->store_id,
            'sender_role' => 'store_level',
            'message' => $request->message,
            'file' => $filename,
        ];
        $message = $this->ticketRepo->addMessage($messageDetails);
        Ticket::where('id', $request->ticket_id)->update(['updated_at' => now()]);
        return response()->json([
            'message' => __('messages.support_ticket.message.sent'),
            'data' => $message
        ], 201);
    }

    public function ticketMessages(Request $request, $ticket_id)
    {
        $request['ticket_id'] = $ticket_id;
        $validator = Validator::make($request->all(), [
            'store_id' => 'required|integer|exists:stores,id',
            'ticket_id' => 'required|integer|exists:tickets,id',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $seller = auth('api')->user();
        $seller_stores = Store::where('store_seller_id', $seller->id)->pluck('id');
        $ticket = Ticket::find($request->ticket_id);
        if (!$seller_stores->contains($ticket->store_id)) {
            return response()->json([
                'message' => __('messages.ticket_does_not_belongs_to_this_store'),
            ], 422);
        }
        $request['store_ids'] = $seller_stores;
        $ticketMessages = $this->ticketRepo->getTicketMessages($request->all());
        return response()->json(SupportTicketMessageResource::collection($ticketMessages));
    }
}
