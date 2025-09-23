# backend/booking/serializers/user.py

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from backend.booking.models import Profile
from phonenumber_field.serializerfields import PhoneNumberField


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    phone_number = PhoneNumberField(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone_number']

    def validate(self, attrs):
        # Sprawdź, czy użytkownik o danym emailu już istnieje
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Użytkownik z tym adresem email już istnieje."})
        return attrs

    def create(self, validated_data):
        # Wyciągnij numer telefonu z danych
        phone_number = validated_data.pop('phone_number', None)

        # Utwórz użytkownika
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # Utwórz lub zaktualizuj profil
        if phone_number:
            Profile.objects.get_or_create(user=user, phone_number=phone_number)
        else:
            Profile.objects.get_or_create(user=user)

        return user