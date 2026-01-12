import uuid
from django.db import models
from core.models import User
from shop.models import Product


class Cart(models.Model):
    """Shopping cart model - one per user"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

    class Meta:
        ordering = ['-created_at']


class CartItem(models.Model):
    """Items in a shopping cart"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ['cart', 'product']  # Prevents duplicate products in cart
        ordering = ['-id']

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in cart"


class Order(models.Model):
    """Order model for completed purchases"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('SHIPPED', 'Shipped'),
        ('CANCELLED', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.id} by {self.user.username} - {self.status}"


class OrderItem(models.Model):
    """Items in an order - stores price snapshot at purchase time"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)  # CRITICAL: Price snapshot
    quantity = models.IntegerField()

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.quantity}x {self.product.name} @ ${self.price_at_purchase}"
