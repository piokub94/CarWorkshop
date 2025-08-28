from rest_framework import serializers
from booking.models import TimeSlot


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'

    def validate(self, data):
        if TimeSlot.objects.filter(date=data['date'], time=data['time']).exists():
            raise serializers.ValidationError("Ten slot już istnieje.")
        return data
