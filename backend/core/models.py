from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model with additional fields for e-commerce functionality.
    - email: unique, required for login
    - is_staff: determines admin access (Django built-in)
    """
    email = models.EmailField(unique=True, blank=False, null=False)
    
    # Allow login with email or username
    EMAIL_FIELD = 'email'
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.username
