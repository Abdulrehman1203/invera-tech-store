from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser, BasePermission
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    RegisterSerializer, 
    CustomTokenObtainPairSerializer, 
    UserListSerializer, 
    UserRoleUpdateSerializer
)

User = get_user_model()


class IsSuperUser(BasePermission):
    """
    Custom permission that only allows superusers (is_superuser=True).
    Staff members (is_staff=True but is_superuser=False) are NOT allowed.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint.
    POST /api/register/
    Body: { username, email, password, confirm_password }
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'Account created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token endpoint that accepts email OR username.
    POST /api/token/
    Body: { login, password }
    Returns: { access, refresh, user }
    """
    serializer_class = CustomTokenObtainPairSerializer


class UserListAPIView(generics.ListAPIView):
    """
    Superuser-only: List all users with their roles.
    GET /api/admin/users/
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserListSerializer
    permission_classes = [IsSuperUser]


class UserRoleUpdateAPIView(generics.UpdateAPIView):
    """
    Superuser-only: Update a user's role (staff/admin status).
    PATCH /api/admin/users/<id>/
    Body: { is_staff: bool, is_superuser: bool }
    """
    queryset = User.objects.all()
    serializer_class = UserRoleUpdateSerializer
    permission_classes = [IsSuperUser]
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)  # Always partial update
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return full user data
        response_serializer = UserListSerializer(instance)
        return Response(response_serializer.data)
