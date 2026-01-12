from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model - includes image URL"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock_quantity', 'image', 'image_url', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'image_url']
    
    def get_image_url(self, obj):
        """Return relative URL so it works through nginx proxy"""
        if obj.image:
            return obj.image.url  # Returns /media/products/...
        return None


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products - admin only"""
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock_quantity', 'image', 'is_active']
        read_only_fields = ['id']
