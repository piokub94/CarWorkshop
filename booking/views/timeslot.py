from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404

from booking.models import TimeSlot
from booking.serializers.timeslot import TimeSlotSerializer


class TimeSlotListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        sort_by = request.query_params.get('sort', 'date')
        direction = request.query_params.get('direction', 'asc')
        if direction == 'desc':
            sort_by = f'-{sort_by}'
        slots = TimeSlot.objects.all().order_by(sort_by)
        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(slots, request)
        serializer = TimeSlotSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = TimeSlotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TimeSlotDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        return get_object_or_404(TimeSlot, pk=pk)

    def put(self, request, pk):
        slot = self.get_object(pk)
        serializer = TimeSlotSerializer(slot, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def patch(self, request, pk):
        slot = self.get_object(pk)
        serializer = TimeSlotSerializer(slot, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        slot = self.get_object(pk)
        if slot.is_booked:
            return Response({'error': 'Nie można usunąć zarezerwowanego slotu.'}, status=400)
        slot.delete()
        return Response(status=204)
