<?php
// Local-only harness. Requires an empty, isolated MySQL database named whatsapp_test.
require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\{DB, Http};
use App\Models\{WhatsappConnection, WhatsappMessage};
config(['database.default'=>'mysql','database.connections.mysql.database'=>'whatsapp_test', 'database.connections.mysql.unix_socket'=>'/tmp/whatsapp-mysql-data/mysql.sock',
    'database.connections.mysql.username'=>'root','database.connections.mysql.password'=>'','app.key'=>'base64:'.base64_encode(str_repeat('t',32)), 'whatsapp.enabled'=>true]);
DB::purge('mysql');
if (($argv[1] ?? '') === 'setup') {
    if (DB::select('SHOW TABLES')) { throw new RuntimeException('Test database must be empty'); }
    (require database_path('migrations/2026_11_08_170000_create_whatsapp_tables.php'))->up();
    $c=WhatsappConnection::create(['environment'=>app()->environment(),'business_account_id'=>'123','phone_number_id'=>'456','graph_version'=>'v23.0','credentials'=>['access_token'=>'local-test'], 'enabled'=>true,'subscribed'=>true,'pilot_mode'=>true,'pilot_numbers'=>['+905321234567'],'health'=>['connected'=>true,'messaging_status'=>'AVAILABLE'],'checked_at'=>now()]);
    foreach (['inbound','outbound'] as $direction) {
        WhatsappMessage::create(['id'=>$direction==='outbound'?'11111111-1111-4111-8111-111111111111':'22222222-2222-4222-8222-222222222222','event_key'=>$direction,'connection_id'=>$c->id,'connection_version'=>1,'direction'=>$direction,'event_type'=>$direction==='outbound'?'reply':'inbound','recipient'=>'+905321234567','payload'=>['body'=>'local test'],'status'=>$direction==='outbound'?'pending':'received','provider_at'=>now(),'expires_at'=>now()->addHour(),'next_attempt_at'=>now()]);
    }
    echo "isolated MySQL schema created\n"; exit;
}
if (($argv[1] ?? '') === 'send') {
    Http::preventStrayRequests();
    Http::fake(function () { file_put_contents('/tmp/whatsapp-concurrency-calls.log', "POST\n", FILE_APPEND | LOCK_EX); usleep(200000); return Http::response(['messages'=>[['id'=>'wamid.concurrent']]]); });
    app(App\Services\Whatsapp\WhatsappSender::class)->send('11111111-1111-4111-8111-111111111111'); exit;
}
if (($argv[1] ?? '') === 'assert') {
    $m=WhatsappMessage::findOrFail('11111111-1111-4111-8111-111111111111');
    if ($m->status !== 'accepted' || $m->attempts !== 1 || DB::table('whatsapp_message_attempts')->count() !== 1 || count(file('/tmp/whatsapp-concurrency-calls.log')) !== 1) { throw new RuntimeException('Concurrency assertion failed'); }
    echo "PASS: two workers, one Meta call, one attempt, accepted once\n";
}
