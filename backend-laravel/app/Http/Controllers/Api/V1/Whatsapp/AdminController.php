<?php

namespace App\Http\Controllers\Api\V1\Whatsapp;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\WhatsappConnection;
use App\Models\WhatsappMessage;
use App\Services\Whatsapp\WhatsappConnectionService;
use App\Services\Whatsapp\WhatsappMessageRecorder;
use App\Services\Whatsapp\WhatsappPhone;
use App\Services\Whatsapp\WhatsappTemplateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class AdminController extends Controller
{
    public function status(WhatsappConnectionService $service)
    {
        return response()->json($service->status());
    }

    public function connect(Request $r, WhatsappConnectionService $service)
    {
        $data = $r->validate(['business_account_id' => 'required|regex:/^[0-9]+$/|max:64', 'phone_number_id' => 'required|regex:/^[0-9]+$/|max:64', 'access_token' => 'required|string|max:4096', 'app_secret' => 'required|string|max:256']);
        $service->connect($data);

        return response()->json($service->status());
    }

    public function refresh(WhatsappConnectionService $service)
    {
        $service->refresh($this->connection());

        return response()->json($service->status());
    }

    public function subscribe(WhatsappConnectionService $service)
    {
        $service->subscribe($this->connection());

        return response()->json($service->status());
    }

    public function templates(WhatsappTemplateService $service, Request $r)
    {
        $c = $this->connection();
        if ($r->isMethod('post')) {
            $service->sync($c);
        }

        return response()->json(['data' => DB::table('whatsapp_templates')->where('connection_id', $c->id)->get()]);
    }

    public function settings(Request $r, WhatsappConnectionService $service)
    {
        $c = $this->connection();
        $data = $r->validate(['enabled' => 'required|boolean', 'pilot_mode' => 'required|boolean', 'pilot_numbers' => 'required|array|max:20', 'pilot_numbers.*' => 'required|string|max:30', 'enabled_events' => 'required|array', 'out_of_hours_enabled' => 'sometimes|boolean', 'out_of_hours_text' => 'required_if:out_of_hours_enabled,true|nullable|string|max:1000', 'office_start' => 'sometimes|integer|min:0|max:23', 'office_end' => 'sometimes|integer|min:1|max:24|gt:office_start', 'enabled_events.*' => 'in:'.implode(',', array_keys(config('whatsapp.events')))]);
        $data['pilot_numbers'] = array_values(array_unique(array_map([WhatsappPhone::class, 'normalize'], $data['pilot_numbers'])));
        if ($data['enabled']) {
            abort_unless(config('whatsapp.enabled') && $c->subscribed && ($c->health['connected'] ?? false) && ($c->health['messaging_status'] ?? '') === 'AVAILABLE' && $c->checked_at?->gt(now()->subMinutes(15)), 422, 'Hesap bağlantısını ve sağlığını doğrulayın.');
            abort_if($data['pilot_mode'] && ! $data['pilot_numbers'], 422, 'Pilot numarası ekleyin.');
        }
        $c->fill($data);
        if ($c->enabled && ! $c->activated_at) {
            $c->activated_at = now();
        } $c->save();

        return response()->json($service->status());
    }

    public function messages(Request $r)
    {
        $data = $r->validate(['status' => 'sometimes|string|max:40', 'page' => 'sometimes|integer|min:1']);
        $query = WhatsappMessage::where('connection_id', $this->connection()->id)->latest();
        if (isset($data['status'])) {
            $query->where('status', $data['status']);
        }
        $page = $query->paginate(30);
        $page->getCollection()->transform(fn ($m) => $m->toArray() + ['recipient_masked' => WhatsappPhone::mask($m->recipient)]);

        return response()->json($page);
    }

    public function conversation(string $id)
    {
        $m = WhatsappMessage::where('connection_id', $this->connection()->id)->findOrFail($id);
        $messages = WhatsappMessage::where('connection_id', $m->connection_id)->where('recipient', $m->recipient)->latest()->limit(100)->get();

        return response()->json(['data' => $messages->map(fn ($item) => $item->toArray() + ['content' => $item->payload, 'recipient_masked' => WhatsappPhone::mask($item->recipient)])]);
    }

    public function reply(Request $r, string $id, WhatsappMessageRecorder $recorder)
    {
        $data = $r->validate(['body' => 'required|string|max:4096', 'request_id' => 'required|uuid']);
        $c = $this->connection();
        $inbound = WhatsappMessage::where('connection_id', $c->id)->where('direction', 'inbound')->findOrFail($id);
        abort_unless($inbound->provider_at?->gt(now()->subHours(24)), 422, 'Yanıt süresi doldu.');
        $m = WhatsappMessage::firstOrCreate(['event_key' => 'reply:'.$c->id.':'.$data['request_id']], [
            'id' => (string) Str::uuid(), 'connection_id' => $c->id, 'connection_version' => $c->version, 'event_type' => 'reply',
            'recipient' => $inbound->recipient, 'payload' => ['body' => $data['body'], 'reply_to' => $inbound->provider_message_id], 'status' => 'pending', 'expires_at' => $inbound->provider_at->copy()->addHours(24),
            'next_attempt_at' => now(), 'actor_id' => $r->user()->id,
        ]);
        if ($m->wasRecentlyCreated) {
            $recorder->queue($m->id);
        }

        return response()->json(['data' => $m], 202);
    }

    public function media(Request $r, string $id, \App\Services\Whatsapp\WhatsappMediaService $media, WhatsappMessageRecorder $recorder)
    {
        $data = $r->validate(['file' => 'required|file|max:5120|mimetypes:image/jpeg,image/png,application/pdf', 'request_id' => 'required|uuid']);
        $c = $this->connection();
        $inbound = WhatsappMessage::where('connection_id', $c->id)->where('direction', 'inbound')->findOrFail($id);
        abort_unless($inbound->provider_at?->gt(now()->subHours(24)), 422, 'Yanıt süresi doldu.');
        $key = 'media:'.$c->id.':'.$data['request_id'];
        if ($existing = WhatsappMessage::where('event_key', $key)->first()) {
            return response()->json(['data' => $existing], 202);
        }
        $payload = $media->upload($c, $r->file('file'));
        $payload['reply_to'] = $inbound->provider_message_id;
        $m = WhatsappMessage::createOrFirst(['event_key' => $key], ['id' => (string) Str::uuid(), 'connection_id' => $c->id, 'connection_version' => $c->version,
            'event_type' => 'media', 'recipient' => $inbound->recipient, 'payload' => $payload, 'status' => 'pending', 'expires_at' => $inbound->provider_at->copy()->addHours(24),
            'next_attempt_at' => now(), 'actor_id' => $r->user()->id]);
        if ($m->wasRecentlyCreated) {
            $recorder->queue($m->id);
        }

        return response()->json(['data' => $m], 202);
    }

    public function download(string $id, \App\Services\Whatsapp\WhatsappMediaService $media)
    {
        $c = $this->connection();
        $m = WhatsappMessage::where('connection_id', $c->id)->where('direction', 'inbound')->findOrFail($id);
        $type = $m->payload['type'] ?? '';
        abort_unless(in_array($type, ['image', 'document']), 422);
        [$body, $mime] = $media->download($c, $m->payload[$type]['id'] ?? '');

        return response($body)->header('Content-Type', $mime)->header('Content-Disposition', 'attachment; filename="whatsapp-attachment"')
            ->header('Cache-Control', 'private, no-store')->header('X-Content-Type-Options', 'nosniff');
    }

    public function read(string $id, \App\Services\Whatsapp\WhatsappCloudClient $client)
    {
        $c = $this->connection();
        $m = WhatsappMessage::where('connection_id', $c->id)->where('direction', 'inbound')->findOrFail($id);
        $client->request($c, 'POST', $c->phone_number_id.'/messages', ['messaging_product' => 'whatsapp', 'status' => 'read', 'message_id' => $m->provider_message_id]);
        $m->read_at = now();
        $m->save();

        return response()->json(['success' => true]);
    }

    public function detail(string $id)
    {
        $m = WhatsappMessage::where('connection_id', $this->connection()->id)->findOrFail($id);

        return response()->json(['data' => $m->toArray() + ['recipient_masked' => WhatsappPhone::mask($m->recipient)],
            'attempts' => DB::table('whatsapp_message_attempts')->where('message_id', $id)->orderBy('number')->get()]);
    }

    public function retry(string $id, WhatsappMessageRecorder $recorder)
    {
        $m = DB::transaction(function () use ($id) {
            $c = $this->connection();
            $m = WhatsappMessage::where('connection_id', $c->id)->lockForUpdate()->findOrFail($id);
            $attempt = DB::table('whatsapp_message_attempts')->where('message_id', $m->id)->orderByDesc('number')->first();
            abort_unless($m->status === 'failed' && $attempt?->status === 'rejected' && in_array($attempt?->error_code, ['4', '17', '32', '613', '130429', '131056'], true), 422, 'Bu mesaj güvenle yeniden gönderilemez.');
            abort_if(app(\App\Services\Whatsapp\WhatsappSender::class)->gate($m, $c) !== null, 422, 'Gönderim koşulları sağlanmıyor.');
            $m->update(['status' => 'pending', 'next_attempt_at' => now(), 'reason' => null]);

            return $m;
        });
        $recorder->queue($m->id);

        return response()->json(['data' => $m], 202);
    }

    public function preview(Request $r, WhatsappTemplateService $templates)
    {
        $data = $r->validate(['event' => 'required|in:'.implode(',', array_keys(config('whatsapp.events'))), 'phone' => 'required|string|max:30', 'parameters' => 'required|array|max:4', 'parameters.*' => 'required|string|max:200']);
        $c = $this->connection();
        $phone = WhatsappPhone::normalize($data['phone']);
        $spec = config('whatsapp.events.'.$data['event']);
        abort_unless(count($data['parameters']) === $spec['parameters'], 422, 'Şablon parametre sayısı hatalı.');
        $template = $templates->approved($c->id, $spec['template'], $spec['parameters']);

        return response()->json(['recipient_masked' => WhatsappPhone::mask($phone), 'template' => $spec['template'], 'parameters' => $data['parameters'],
            'approved' => $template !== null, 'pilot_allowed' => in_array($phone, $c->pilot_numbers ?? [], true), 'enabled' => $c->enabled && config('whatsapp.enabled')]);
    }

    public function testSend(Request $r, WhatsappTemplateService $templates, WhatsappMessageRecorder $recorder)
    {
        $this->preview($r, $templates);
        $r->validate(['request_id' => 'required|uuid', 'confirmed' => 'required|accepted']);
        $c = $this->connection();
        $phone = WhatsappPhone::normalize($r->input('phone'));
        $spec = config('whatsapp.events.'.$r->input('event'));
        abort_unless(in_array($phone, $c->pilot_numbers ?? [], true), 422, 'Yalnız pilot listesindeki numara kullanılabilir.');
        $template = $templates->approved($c->id, $spec['template'], $spec['parameters']);
        abort_unless($template, 422, 'Onaylı şablon gerekli.');
        $m = WhatsappMessage::createOrFirst(['event_key' => 'pilot:'.$c->id.':'.$r->input('request_id')], [
            'id' => (string) Str::uuid(), 'connection_id' => $c->id, 'connection_version' => $c->version, 'event_type' => 'pilot_test', 'recipient' => $phone,
            'template_name' => $spec['template'], 'payload' => ['parameters' => $r->input('parameters'), 'template_hash' => $template->content_hash], 'status' => 'pending',
            'expires_at' => now()->addMinutes(15), 'next_attempt_at' => now(), 'actor_id' => $r->user()->id,
        ]);
        if ($m->wasRecentlyCreated) {
            $recorder->queue($m->id);
        }

return response()->json(['data' => $m], 202);
    }

    private function connection(): WhatsappConnection
    {
        return WhatsappConnection::current() ?? abort(422, 'Önce WhatsApp hesabını bağlayın.');
    }
}
