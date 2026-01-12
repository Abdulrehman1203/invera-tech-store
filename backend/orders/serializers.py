from rest_framework import serializers
from shop.serializers import ProductSerializer
from .models import Cart, CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for CartItem with nested product details"""
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity']
        read_only_fields = ['id']


class CartSerializer(serializers.ModelSerializer):
    """Serializer for Cart with items and total"""
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    def get_total(self, obj):
        """Calculate total price of all items in cart"""
        return sum(item.product.price * item.quantity for item in obj.items.all())

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'created_at']
        read_only_fields = ['id', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem with product details"""
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'price_at_purchase', 'quantity']
        read_only_fields = ['id', 'price_at_purchase']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order with items"""
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'total_amount', 'items', 'created_at']
        read_only_fields = ['id', 'total_amount', 'created_at']


class AdminOrderSerializer(serializers.ModelSerializer):
    """Admin serializer for Order with user details"""
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
        }

    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'total_amount', 'items', 'created_at']
        read_only_fields = ['id', 'total_amount', 'created_at']
