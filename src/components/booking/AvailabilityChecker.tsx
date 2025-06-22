// components/booking/AvailabilityChecker.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useTableAvailability, useAvailableTimeSlots } from '@/hooks/useBookings';
import { Clock, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface AvailabilityCheckerProps {
  restaurantId: string;
  onTimeSlotSelect?: (date: string, time: string) => void;
}

export function AvailabilityChecker({ 
  restaurantId, 
  onTimeSlotSelect 
}: AvailabilityCheckerProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(2);

  // Хук для получения доступности столиков
  const { 
    data: availability, 
    isLoading: isLoadingAvailability,
    error: availabilityError 
  } = useTableAvailability({
    restaurantId,
    date: selectedDate,
    guestCount
  });

  // Хук для получения доступных временных слотов
  const { 
    data: timeSlots = [], 
    isLoading: isLoadingSlots 
  } = useAvailableTimeSlots(restaurantId, selectedDate, guestCount);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleGuestCountChange = (count: number) => {
    if (count >= 1 && count <= 20) {
      setGuestCount(count);
    }
  };

  const handleTimeSlotClick = (time: string) => {
    if (onTimeSlotSelect && selectedDate) {
      onTimeSlotSelect(selectedDate, time);
    }
  };

  // Получить минимальную дату (сегодня)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Проверить доступность
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Выбор даты */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата бронирования
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={today}
              className="w-full"
            />
          </div>

          {/* Количество гостей */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Количество гостей
            </label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGuestCountChange(guestCount - 1)}
                disabled={guestCount <= 1}
              >
                -
              </Button>
              <div className="flex items-center px-3 py-1 border rounded-md min-w-[60px] justify-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{guestCount}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGuestCountChange(guestCount + 1)}
                disabled={guestCount >= 20}
              >
                +
              </Button>
            </div>
          </div>

          {/* Результаты проверки доступности */}
          {selectedDate && (
            <div className="mt-6">
              {isLoadingAvailability || isLoadingSlots ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Проверяем доступность...</p>
                </div>
              ) : availabilityError ? (
                <div className="text-center py-4">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">Ошибка загрузки данных</p>
                </div>
              ) : availability ? (
                <div>
                  {/* Общая информация о доступности */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Доступность на {new Date(selectedDate).toLocaleDateString('ru-RU')}
                    </h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Свободных столиков: {availability.availableTables} из {availability.totalTables}
                      </span>
                      <Badge 
                        variant={availability.availableTables > 0 ? "success" : "error"}
                        size="sm"
                      >
                        {availability.availableTables > 0 ? "Есть места" : "Нет мест"}
                      </Badge>
                    </div>
                  </div>

                  {/* Доступные временные слоты */}
                  {timeSlots.length > 0 ? (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Доступное время для {guestCount} {guestCount === 1 ? 'гостя' : guestCount < 5 ? 'гостей' : 'гостей'}
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant="outline"
                            size="sm"
                            onClick={() => handleTimeSlotClick(time)}
                            className="text-sm hover:bg-indigo-50 hover:border-indigo-300"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        На выбранную дату нет доступных временных слотов
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Попробуйте выбрать другую дату или изменить количество гостей
                      </p>
                    </div>
                  )}

                  {/* Детальная информация по временным слотам */}
                  {availability.timeSlots.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Детализация по времени
                      </h4>
                      <div className="space-y-2">
                        {availability.timeSlots.map((slot) => (
                          <div
                            key={slot.time}
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="font-medium">{slot.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                {slot.capacity - slot.bookedCount} из {slot.capacity}
                              </span>
                              <Badge
                                variant={slot.available ? "success" : "error"}
                                size="sm"
                              >
                                {slot.available ? "Доступно" : "Занято"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}