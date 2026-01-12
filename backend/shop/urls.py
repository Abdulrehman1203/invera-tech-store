from django.urls import path
from .views import (
    ProductListAPIView, 
    ProductDetailAPIView,
    AdminProductListCreateAPIView,
    AdminProductDetailAPIView
)

urlpatterns = [
    # Public endpoints
    path('products/', ProductListAPIView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    
    # Admin endpoints
    path('admin/products/', AdminProductListCreateAPIView.as_view(), name='admin-product-list'),
    path('admin/products/<int:pk>/', AdminProductDetailAPIView.as_view(), name='admin-product-detail'),
]
