from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from booking.models import TimeSlot

@api_view(['GET'])
def calendar_view(request):
    today = timezone.localdate()
    end_date = today + timedelta(days=90)

    slots = TimeSlot.objects.filter(date__range=(today, end_date))
    # klucz to string "YYYY-MM-DD HH:MM"
    slots_dict = {f"{slot.date.isoformat()} {slot.time.strftime('%H:%M')}": slot for slot in slots}

    print("Klucze w slots_dict (przykład 10):", list(slots_dict.keys())[:10])

    result = []
    current_day = today
    while current_day <= end_date:
        day_slots = []
        for hour in range(9, 17):
            for minute in (0, 30):
                slot_time_str = f"{hour:02d}:{minute:02d}"
                key = f"{current_day.isoformat()} {slot_time_str}"
                slot_obj = slots_dict.get(key)
                if slot_obj:
                    day_slots.append({
                        'id': slot_obj.id,
                        'time': slot_time_str,
                        'available': not slot_obj.is_booked,
                    })
        print(f"Day: {current_day}, slots count: {len(day_slots)}")
        result.append({'date': current_day.isoformat(), 'slots': day_slots})
        current_day += timedelta(days=1)

    return Response(result)
