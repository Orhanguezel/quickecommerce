### uclar

cd /home/orhan/Documents/quikecommerce/backend-laravel
php artisan route:list --path=api | egrep -i "token|login|auth|signin" | head -n 80


### tablolar
cd /home/orhan/Documents/quikecommerce/backend-laravel
php artisan tinker --execute="dump(DB::select('show tables'));"


### kullanici 
php artisan tinker --execute="dump(DB::table('users')->select('id','email','name')->limit(20)->get());"

### sifre
cd /home/orhan/Documents/quikecommerce/backend-laravel

php artisan tinker --execute='
use App\Models\User;
use Illuminate\Support\Facades\Hash;

$u = User::where("email","orhanguzell@gmail.com")->firstOrFail();
$u->password = Hash::make("Engin1000145");
$u->save();

$u = $u->fresh();
dump("id=".$u->id);
dump("hash=".substr($u->password,0,20));
dump("check=". (Hash::check("Engin1000145",$u->password) ? "true" : "false"));
'

### local laravel calistirma
cd /home/orhan/Documents/quikecommerce/backend-laravel
php artisan serve --host=127.0.0.1 --port=8000




