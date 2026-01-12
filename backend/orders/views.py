from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, AdminOrderSerializer
from shop.models import Product


class CartViewSet(viewsets.ModelViewSet):
    """ViewSet for Cart operations"""
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get cart items for the current user"""
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart)

    def get_cart(self):
        """Get or create cart for the current user"""
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart

    @action(detail=False, methods=['get'], url_path='', url_name='cart-summary')
    def cart(self, request):
        """Get user's cart with all items - accessed via GET /api/cart/"""
        cart = self.get_cart()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def create(self, request):
        """Add item to cart"""
        cart = self.get_cart()
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        # Validate product exists and is active
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found or inactive'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if item already exists in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            # Update quantity if item already exists
            cart_item.quantity += quantity
            cart_item.save()

        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None, partial=False):
        """Update cart item quantity"""
        try:
            cart_item = self.get_object()
            quantity = int(request.data.get('quantity', cart_item.quantity))

            if quantity <= 0:
                return Response(
                    {'error': 'Quantity must be greater than 0'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item.quantity = quantity
            cart_item.save()

            serializer = self.get_serializer(cart_item)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, pk=None):
        """Remove item from cart"""
        try:
            cart_item = self.get_object()
            cart_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class CheckoutAPIView(APIView):
    """Checkout view - Convert cart to order with atomic transaction"""
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        """Process checkout: validate stock, create order, deduct stock, clear cart"""
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response(
                {'error': 'Cart not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        cart_items = cart.items.all()

        if not cart_items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate stock availability for all items
        for item in cart_items:
            if item.product.stock_quantity < item.quantity:
                return Response(
                    {'error': f'Insufficient stock for {item.product.name}. Available: {item.product.stock_quantity}, Requested: {item.quantity}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Calculate total amount
        total = sum(item.product.price * item.quantity for item in cart_items)

        # Create order
        order = Order.objects.create(
            user=request.user,
            status='PENDING',
            total_amount=total
        )

        # Create order items and deduct stock
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                price_at_purchase=item.product.price,  # CRITICAL: Save price snapshot
                quantity=item.quantity
            )

            # Deduct stock
            item.product.stock_quantity -= item.quantity
            item.product.save()

        # Clear cart
        cart_items.delete()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderListAPIView(APIView):
    """List all orders for the authenticated user"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get user's orders"""
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class AdminOrderListAPIView(APIView):
    """Admin: List all orders from all customers"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all orders (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        orders = Order.objects.all().select_related('user').order_by('-created_at')
        serializer = AdminOrderSerializer(orders, many=True)
        return Response(serializer.data)

    def patch(self, request, pk=None):
        """Update order status (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        new_status = request.data.get('status')
        if new_status and new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            serializer = AdminOrderSerializer(order)
            return Response(serializer.data)
        return Response(
            {'error': 'Invalid status'},
            status=status.HTTP_400_BAD_REQUEST
        )
