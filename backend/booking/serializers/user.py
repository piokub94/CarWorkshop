from rest_framework import serializers
from django.contrib.auth.models import User
from backend.booking.models import Profile
from backend.booking.serializers.profile import ProfileSerializer  # Import ProfileSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    # Dodanie zagnieżdżonego serializatora dla profilu
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'profile']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}  # Upewnij się, że email jest wymagany, jeśli go używasz
        }

    def create(self, validated_data):
        # Pobranie danych z zagnieżdżonego serializatora przed utworzeniem użytkownika
        profile_data = validated_data.pop('profile')

        # Utworzenie obiektu User
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )

        # Utworzenie powiązanego obiektu Profile
        Profile.objects.create(user=user, **profile_data)

        return user