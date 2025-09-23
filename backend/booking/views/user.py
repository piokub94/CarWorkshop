from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from backend.booking.models import Profile
from backend.booking.serializers.user import RegisterSerializer, UserSerializer
from backend.booking.serializers.profile import ProfileSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Handles user registration and returns a token on success.
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "message": "Użytkownik zarejestrowany",
            "token": token.key,
            "username": user.username,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Uses the built-in DRF ObtainAuthToken view for login.
    """
    response = ObtainAuthToken.as_view()(request=request._request)
    if response.status_code == status.HTTP_200_OK:
        token = response.data.get('token')
        try:
            user = Token.objects.get(key=token).user
            return Response({
                "token": token,
                "username": user.username
            })
        except Token.DoesNotExist:
            return Response({"detail": "Token is invalid."}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"detail": "Nieprawidłowe dane uwierzytelniające."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    GET -> returns user and profile data.
    PATCH -> updates the user's phone number.
    """
    user = request.user
    profile, _ = Profile.objects.get_or_create(user=user)

    if request.method == 'GET':
        user_data = UserSerializer(user).data
        profile_data = ProfileSerializer(profile).data
        user_data['phone_number'] = profile_data.get('phone_number', '')
        return Response(user_data)

    serializer = ProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        user_data = UserSerializer(user).data
        user_data['phone_number'] = serializer.data.get('phone_number', '')
        return Response(user_data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    """
    Creates an auth token for the user upon registration.
    """
    if created:
        Token.objects.get_or_create(user=instance)