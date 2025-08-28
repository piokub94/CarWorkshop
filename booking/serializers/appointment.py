from rest_framework import serializers
from booking.models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['user']

    def validate_slot(self, value):
        if value.is_booked:
            raise serializers.ValidationError("Ten slot jest już zajęty.")
        return value

    def validate_vehicle(self, value):
        request = self.context.get('request')
        if request and value and value.user != request.user:
            raise serializers.ValidationError("Nie możesz wybrać pojazdu należącego do innego użytkownika.")
        return value

    def create(self, validated_data):
        # zarezerwuj slot
        slot = validated_data['slot']
        slot.is_booked = True
        slot.save()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Nie pozwalamy zmieniać slotu ani usera w aktualizacji
        validated_data.pop('slot', None)
        validated_data.pop('user', None)
        return super().update(instance, validated_data)
