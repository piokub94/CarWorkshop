from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

from booking.serializers.user import RegisterSerializer, UserSerializer
from booking.serializers.profile import ProfileSerializer
from booking.models import Profile


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # profil tworzy się w sygnale post_save(User)
        return Response({"message": "Użytkownik zarejestrowany"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    GET  -> zwraca {id, username, email, phone_number}
    PATCH -> aktualizuje phone_number w modelu Profile
    """
    user = request.user
    profile, _ = Profile.objects.get_or_create(user=user)

    if request.method == 'GET':
        user_data = UserSerializer(user).data
        profile_data = ProfileSerializer(profile).data
        user_data['phone_number'] = profile_data.get('phone_number', '')
        return Response(user_data)

    # PATCH
    serializer = ProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        # zwróć spójny kształt odpowiedzi jak w GET
        user_data = UserSerializer(user).data
        user_data['phone_number'] = serializer.data.get('phone_number', '')
        return Response(user_data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
