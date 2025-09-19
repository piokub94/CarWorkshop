from datetime import timedelta, time
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from booking.models import TimeSlot

@api_view(['GET'])
def calendar_view(request):
    today = timezone.localdate()
    end_date = today + timedelta(days=90)

    # Pobieramy sloty w danym zakresie dat
    slots = TimeSlot.objects.filter(date__range=(today, end_date))
    # Tworzymy słownik z kluczem jako para (data, godzina w formacie HH:MM)
    slots_dict = {(slot.date, slot.time.strftime('%H:%M')): slot for slot in slots}

    result = []
    current_day = today

    while current_day <= end_date:
        day_slots = []
        for hour in range(9, 17):  # od 9:00 do 16:30 (ostatni slot)
            for minute in (0, 30):
                slot_time_str = f"{hour:02d}:{minute:02d}"
                slot_obj = slots_dict.get((current_day, slot_time_str))
                if slot_obj:
                    day_slots.append({
                        'id': slot_obj.id,
                        'time': slot_time_str,
                        'available': not slot_obj.is_booked
                    })
        result.append({'date': current_day.isoformat(), 'slots': day_slots})
        current_day += timedelta(days=1)

    return Response(result)
