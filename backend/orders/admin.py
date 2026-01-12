from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem


class CartItemInline(admin.TabularInline):
    """Inline admin for CartItems"""
    model = CartItem
    extra = 0
    readonly_fields = ['product']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """Admin interface for Cart model"""
    list_display = ['id', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['id', 'created_at']
    inlines = [CartItemInline]
    ordering = ['-created_at']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """Admin interface for CartItem model"""
    list_display = ['id', 'cart', 'product', 'quantity']
    list_filter = ['cart__created_at']
    search_fields = ['product__name', 'cart__user__username']
    ordering = ['-id']


class OrderItemInline(admin.TabularInline):
    """Inline admin for OrderItems"""
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'price_at_purchase']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin interface for Order model"""
    list_display = ['id', 'user', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'user__email', 'id']
    readonly_fields = ['id', 'created_at']
    inlines = [OrderItemInline]
    ordering = ['-created_at']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """Admin interface for OrderItem model"""
    list_display = ['id', 'order', 'product', 'price_at_purchase', 'quantity']
    list_filter = ['order__status', 'order__created_at']
    search_fields = ['product__name', 'order__user__username']
    readonly_fields = ['price_at_purchase']
    ordering = ['id']
