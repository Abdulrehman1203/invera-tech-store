from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with validation.
    Fields: username, email, password, confirm_password
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password')
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
        }
    
    def validate_email(self, value):
        """Check if email is already registered."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()
    
    def validate_username(self, value):
        """Check if username is already taken."""
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
    
    def validate(self, attrs):
        """Check if passwords match."""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })
        return attrs
    
    def create(self, validated_data):
        """Create new user with hashed password."""
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that accepts 'login' field
    which can be either username or email.
    """
    username_field = 'login'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Rename the username field to 'login'
        self.fields['login'] = serializers.CharField()
        self.fields.pop('username', None)
    
    def validate(self, attrs):
        login = attrs.get('login')
        password = attrs.get('password')
        
        if login and password:
            # Use our custom backend to authenticate
            user = authenticate(
                request=self.context.get('request'),
                username=login,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    'No active account found with the given credentials.'
                )
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            # Generate tokens
            refresh = self.get_token(user)
            
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_admin': user.is_staff,
                    'is_superuser': user.is_superuser
                }
            }
        
        raise serializers.ValidationError('Must include "login" and "password".')


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details."""
    is_admin = serializers.BooleanField(source='is_staff', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_admin')
        read_only_fields = ('id', 'username', 'email', 'is_admin')


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for listing users with their role information."""
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_staff', 'is_superuser', 'is_active', 'date_joined')
        read_only_fields = fields


class UserRoleUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user roles (staff/admin status)."""
    
    class Meta:
        model = User
        fields = ('is_staff', 'is_superuser')
    
    def validate(self, attrs):
        """Prevent admin from removing their own admin status."""
        request = self.context.get('request')
        if request and self.instance:
            if self.instance == request.user:
                if attrs.get('is_staff') is False or attrs.get('is_superuser') is False:
                    raise serializers.ValidationError(
                        "You cannot remove your own admin privileges."
                    )
        return attrs

