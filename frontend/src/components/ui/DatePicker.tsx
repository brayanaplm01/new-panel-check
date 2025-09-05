"use client";
import React, { useState, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { IconCalendar, IconX, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DatePicker = memo(function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Seleccionar fecha",
  className = "",
  disabled = false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  // Asegurar que el componente está montado antes de usar createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Cerrar con escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleDateSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen && triggerRef.current) {
        // Calcular la posición del calendario
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        setCalendarPosition({
          top: rect.bottom + scrollTop + 4, // 4px de margen
          left: rect.left + scrollLeft,
          width: rect.width
        });
      }
      setIsOpen(!isOpen);
    }
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
    const daysInMonth = lastDay.getDate();
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return value && date.toDateString() === value.toDateString();
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return placeholder;
    return format(date, 'dd/MM/yyyy', { locale: es });
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`
          w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-800 text-left text-sm transition-colors
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer'
          }
        `}
      >
        <span className={`${value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
          {formatDisplayDate(value)}
        </span>
        
        <div className="flex items-center gap-2 pl-2">
          {value && !disabled && (
            <div
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClear(e as any);
                }
              }}
              role="button"
              tabIndex={0}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Limpiar fecha"
            >
              <IconX className="h-3 w-3" />
            </div>
          )}
          <IconCalendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>
      </div>

      {/* Calendar Popup usando Portal */}
      {isOpen && mounted && calendarPosition && createPortal(
        <div 
          ref={containerRef}
          className="fixed w-72 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[99999]"
          style={{
            top: `${calendarPosition.top}px`,
            left: `${calendarPosition.left}px`,
            minWidth: `${Math.max(calendarPosition.width, 288)}px` // 288px = w-72
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Selector de fecha"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Mes anterior"
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
            
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </span>
            
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Mes siguiente"
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-0 px-3 py-2 border-b border-gray-200 dark:border-gray-600">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
              <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendario */}
          <div className="grid grid-cols-7 gap-0 p-3" role="grid">
            {generateCalendar().map((date, index) => {
              if (!date) {
                return <div key={index} className="h-8" />;
              }

              const selected = isSelected(date);
              const today = isToday(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  className={`
                    h-8 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${selected 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : today
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-200 dark:hover:bg-blue-900/60'
                      : 'text-gray-900 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                    }
                  `}
                  aria-label={`${date.getDate()} de ${format(date, 'MMMM yyyy', { locale: es })}`}
                  aria-selected={selected ? true : undefined}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-3 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => handleDateSelect(new Date())}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});
