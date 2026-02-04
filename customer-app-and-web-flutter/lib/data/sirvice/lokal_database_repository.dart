
import 'package:hive/hive.dart';
import '../data_model/cart_model.dart';

class CartDatabaseHelpers {
  static const String _boxName = 'cartBox';

  static Future<void> init() async {
    Hive.registerAdapter(CartItemAdapter());
    await Hive.openBox<CartItem>(_boxName);
  }

  Box<CartItem> get _box => Hive.box<CartItem>(_boxName);

  /// Insert a CartItem (conflict replace is just overwrite here)
  Future<int> insertItem(CartItem item) async {
    // If item already exists (by productId), replace it
    final existingIndex = _box.values.toList().indexWhere(
          (element) => element.productId == item.productId,
    );
    if (existingIndex != -1) {
      await _box.putAt(existingIndex, item);
      return existingIndex;
    }
    return await _box.add(item);
  }

  /// Return items as a list of maps to match old sqflite behavior
  Future<List<Map<String, dynamic>>> getItems() async {
    return _box.values.map((item) => item.toMap()).toList();
  }

  /// Update quantity
  Future<int> updateItemQuantity(int productId, int quantity) async {
    final index = _box.values.toList().indexWhere((item) => item.productId == productId);
    if (index != -1) {
      final existing = _box.getAt(index);
      if (existing != null) {
        final updated = existing.copyWith(quantity: quantity);
        await _box.putAt(index, updated);
        return 1;
      }
    }
    return 0;
  }


  /// Delete by id
  Future<void> deleteItem(dynamic id) async {
    final index = _box.values.toList().indexWhere((item) => item.productId == id);
    if (index != -1) {
      await _box.deleteAt(index);
    }
  }

  /// Clear all
  Future<int> clearCart() async {
    await _box.clear();
    return 1;
  }
}

class CartItemAdapter extends TypeAdapter<CartItem> {
  @override
  final int typeId = 0;

  @override
  CartItem read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (var i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return CartItem(
      id: fields[0] as dynamic,
      storeId: fields[1] as int,
      areaId: fields[2] as int,
      flashSaleId: fields[3] as int,
      storeName: fields[4] as String,
      storeTaxP: fields[5] as String,
      chargeAmount: fields[6] as String,
      chargeType: fields[7] as String,
      productId: fields[8] as int,
      stock: fields[9] as int,
      variantId: fields[10] as int,
      productName: fields[11] as String,
      variant: fields[12] as String,
      price: fields[13] as String,
      quantity: fields[14] as int,
      cartMaxQuantity: fields[15] as int,
      image: fields[16] as String,
    );
  }

  @override
  void write(BinaryWriter writer, CartItem obj) {
    writer
      ..writeByte(17)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.storeId)
      ..writeByte(2)
      ..write(obj.areaId)
      ..writeByte(3)
      ..write(obj.flashSaleId)
      ..writeByte(4)
      ..write(obj.storeName)
      ..writeByte(5)
      ..write(obj.storeTaxP)
      ..writeByte(6)
      ..write(obj.chargeAmount)
      ..writeByte(7)
      ..write(obj.chargeType)
      ..writeByte(8)
      ..write(obj.productId)
      ..writeByte(9)
      ..write(obj.stock)
      ..writeByte(10)
      ..write(obj.variantId)
      ..writeByte(11)
      ..write(obj.productName)
      ..writeByte(12)
      ..write(obj.variant)
      ..writeByte(13)
      ..write(obj.price)
      ..writeByte(14)
      ..write(obj.quantity)
      ..writeByte(15)
      ..write(obj.cartMaxQuantity)
      ..writeByte(16)
      ..write(obj.image);
  }
}







