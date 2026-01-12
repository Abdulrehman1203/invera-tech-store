"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from core.views import RegisterView, CustomTokenObtainPairView, UserListAPIView, UserRoleUpdateAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    # Authentication endpoints
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Admin user management
    path('api/admin/users/', UserListAPIView.as_view(), name='admin-user-list'),
    path('api/admin/users/<int:pk>/', UserRoleUpdateAPIView.as_view(), name='admin-user-update'),
    # API endpoints
    path('api/', include('shop.urls')),
    path('api/', include('orders.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
