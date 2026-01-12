from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Product
from .serializers import ProductSerializer, ProductCreateSerializer


class ProductListAPIView(generics.ListAPIView):
    """List all active products - Public access"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class ProductDetailAPIView(generics.RetrieveAPIView):
    """Get single product details - Public access"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


# Admin-only views
class AdminProductListCreateAPIView(generics.ListCreateAPIView):
    """
    Admin: List all products (including inactive) and create new products.
    POST supports multipart/form-data for image uploads.
    """
    queryset = Product.objects.all()
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        
        # Return full product data
        response_serializer = ProductSerializer(product, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class AdminProductDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin: Get, update, or delete a product.
    PUT/PATCH supports multipart/form-data for image uploads.
    """
    queryset = Product.objects.all()
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateSerializer
        return ProductSerializer
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        
        # Return full product data
        response_serializer = ProductSerializer(product, context={'request': request})
        return Response(response_serializer.data)
