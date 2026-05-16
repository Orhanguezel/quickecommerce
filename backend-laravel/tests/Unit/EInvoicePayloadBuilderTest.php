<?php

namespace Tests\Unit;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderAddress;
use App\Models\OrderDetail;
use App\Models\OrderMaster;
use App\Services\EInvoice\EInvoicePayloadBuilder;
use Illuminate\Support\Collection;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EInvoicePayloadBuilderTest extends TestCase
{
    /**
     * Doğrudan setAttribute (forceFill bu repoda Order'da güvenilmez —
     * REVIEW-FAZ5: Codex prod working dir'i bozuyor).
     *
     * @template T of \Illuminate\Database\Eloquent\Model
     * @param  T  $model
     * @return T
     */
    private function attrs(\Illuminate\Database\Eloquent\Model $model, array $attributes)
    {
        foreach ($attributes as $key => $value) {
            $model->setAttribute($key, $value);
        }

        return $model;
    }

    private function buildOrder(array $masterOverrides = []): Order
    {
        $address = $this->attrs(new OrderAddress, [
            'name' => 'Ahmet Yılmaz',
            'email' => 'ahmet@example.com',
            'address' => 'Bağdat Cad. No:1',
            'district_name' => 'Kadıköy',
            'city_name' => 'İstanbul',
        ]);

        $customer = $this->attrs(new Customer, [
            'first_name' => 'Ahmet',
            'last_name' => 'Yılmaz',
            'email' => 'ahmet@example.com',
        ]);

        $master = $this->attrs(new OrderMaster, array_merge([
            'currency_code' => 'TRY',
            'exchange_rate' => null,
            'coupon_discount_amount_admin' => 0,
            'product_discount_amount' => 0,
            'shipping_charge' => 29.90,
        ], $masterOverrides));
        $master->setRelation('orderAddress', $address);
        $master->setRelation('customer', $customer);

        $detail = $this->attrs(new OrderDetail, [
            'variant_details' => json_encode(['name' => 'Kırmızı Tişört']),
            'price' => 100,
            'quantity' => 2,
            'tax_rate' => 20,
        ]);

        $order = $this->attrs(new Order, ['id' => 1234, 'shipping_charge' => 29.90]);
        $order->setRelation('orderMaster', $master);
        $order->setRelation('orderDetail', new Collection([$detail]));

        return $order;
    }

    #[Test]
    public function maps_order_to_api_contract_body(): void
    {
        config(['services.einvoice.default_tckn' => '11111111111']);

        $payload = (new EInvoicePayloadBuilder)->fromOrder($this->buildOrder());

        // buyer — B2C nihai tüketici
        $this->assertSame('person', $payload['buyer']['type']);
        $this->assertSame('11111111111', $payload['buyer']['tckn_vkn']);
        $this->assertSame('Ahmet Yılmaz', $payload['buyer']['name']);
        $this->assertSame('Türkiye', $payload['buyer']['country']);

        // lines
        $this->assertCount(1, $payload['lines']);
        $line = $payload['lines'][0];
        $this->assertSame('Kırmızı Tişört', $line['name']);
        $this->assertSame(2, $line['quantity']);
        $this->assertSame('Adet', $line['unit']);
        $this->assertSame('100.00', $line['unit_price']);
        $this->assertSame(20, $line['vat_rate']);
        $this->assertSame('0.00', $line['discount']);

        // shipping + meta
        $this->assertSame('29.90', $payload['shipping']['amount']);
        $this->assertSame('TRY', $payload['currency']);
        $this->assertNull($payload['exchange_rate']);
        $this->assertSame('Sipariş #1234', $payload['note']);
        $this->assertMatchesRegularExpression(
            '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/',
            $payload['issue_date']
        );
    }

    #[Test]
    public function foreign_currency_includes_exchange_rate(): void
    {
        $order = $this->buildOrder([
            'currency_code' => 'USD',
            'exchange_rate' => 32.5,
        ]);

        $payload = (new EInvoicePayloadBuilder)->fromOrder($order);

        $this->assertSame('USD', $payload['currency']);
        $this->assertSame('32.500000', $payload['exchange_rate']);
    }

    #[Test]
    public function omits_shipping_when_zero(): void
    {
        $order = $this->buildOrder(['shipping_charge' => 0]);
        $this->attrs($order, ['id' => 1234, 'shipping_charge' => 0]);

        $payload = (new EInvoicePayloadBuilder)->fromOrder($order);

        $this->assertArrayNotHasKey('shipping', $payload);
    }
}
