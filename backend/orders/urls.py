from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, CheckoutAPIView, OrderListAPIView, AdminOrderListAPIView

router = DefaultRouter()
router.register(r'cart/items', CartViewSet, basename='cart-items')

urlpatterns = [
    path('cart/', CartViewSet.as_view({'get': 'cart'}), name='cart-detail'),
    path('orders/', OrderListAPIView.as_view(), name='order-list'),
    path('orders/checkout/', CheckoutAPIView.as_view(), name='checkout'),
    path('admin/orders/', AdminOrderListAPIView.as_view(), name='admin-order-list'),
    path('admin/orders/<uuid:pk>/', AdminOrderListAPIView.as_view(), name='admin-order-update'),
] + router.urls
