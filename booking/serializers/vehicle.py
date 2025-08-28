from rest_framework import serializers
from booking.models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ['user']

    def validate_vin(self, value: str):
        if len(value or "") != 17:
            raise serializers.ValidationError("VIN musi mieć dokładnie 17 znaków.")
        return value
