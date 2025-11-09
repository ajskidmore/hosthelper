import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Add,
  CalendarMonth,
  Edit,
  Delete,
  ViewList,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useProperties } from '../../hooks/useProperties';
import { useBookings } from '../../hooks/useBookings';
import BookingDialog from '../../components/bookings/BookingDialog';
import { Booking } from '../../types';
import { timestampToDate } from '../../hooks/useFirestore';

const OwnerBookings = () => {
  const { properties } = useProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const { bookings, loading, addBooking, updateBooking, deleteBooking } = useBookings(
    selectedPropertyId === 'all' ? undefined : selectedPropertyId
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Auto-select first property when properties load (run only once when properties first load)
  useEffect(() => {
    if (properties.length > 0 && selectedPropertyId === 'all') {
      console.log('[BOOKINGS] Auto-selecting first property:', properties[0].id);
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties.length]); // Only depend on length to avoid infinite loop

  const handleOpenDialog = (booking?: Booking) => {
    if (selectedPropertyId === 'all' && !booking) {
      setError('Please select a property first');
      return;
    }
    setSelectedBooking(booking || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleSaveBooking = async (bookingData: Partial<Booking>) => {
    try {
      if (selectedBooking) {
        await updateBooking(selectedBooking.id, bookingData);
        setSuccess('Booking updated successfully!');
      } else {
        await addBooking(bookingData as any);
        setSuccess('Booking added successfully!');
      }
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to save booking');
    }
  };

  const handleDelete = async (booking: Booking) => {
    if (confirm(`Are you sure you want to delete the booking for ${booking.guestName}?`)) {
      try {
        await deleteBooking(booking.id);
        setSuccess('Booking deleted successfully!');
      } catch (err: any) {
        setError(err.message || 'Failed to delete booking');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'checked_in':
        return 'info';
      case 'checked_out':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (date: any) => {
    const d = timestampToDate(date);
    return d.toLocaleDateString();
  };

  // Filter bookings if property is selected
  const filteredBookings =
    selectedPropertyId === 'all'
      ? bookings
      : bookings.filter((b) => b.propertyId === selectedPropertyId);

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter((booking) => {
      const checkIn = timestampToDate(booking.checkInDate);
      const checkOut = timestampToDate(booking.checkOutDate);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const checkInOnly = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
      const checkOutOnly = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());

      return dateOnly >= checkInOnly && dateOnly <= checkOutOnly;
    });
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    if (selectedPropertyId === 'all') {
      setError('Please select a property first');
      return;
    }
    // Open dialog with pre-filled check-in date
    setSelectedBooking(null);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Bookings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your rental bookings and reservations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
          disabled={properties.length === 0}
        >
          Add Booking
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Fade in>
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Fade>
      )}
      {error && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Property Filter and View Toggle */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        {properties.length > 0 && (
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Filter by Property</InputLabel>
            <Select
              value={selectedPropertyId}
              label="Filter by Property"
              onChange={(e) => setSelectedPropertyId(e.target.value)}
            >
              <MenuItem value="all">All Properties</MenuItem>
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          aria-label="view mode"
        >
          <ToggleButton value="calendar" aria-label="calendar view">
            <CalendarMonth sx={{ mr: 1 }} />
            Calendar
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <ViewList sx={{ mr: 1 }} />
            Table
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Typography>Loading bookings...</Typography>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CalendarMonth sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No properties yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add a property first, then create your first booking
            </Typography>
          </CardContent>
        </Card>
      ) : viewMode === 'calendar' ? (
        <>
          {/* Calendar View */}
          <Paper sx={{ p: 3 }}>
            {/* Calendar Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <IconButton onClick={handlePreviousMonth}>
                <ChevronLeft />
              </IconButton>
              <Typography variant="h5" fontWeight={600}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Typography>
              <IconButton onClick={handleNextMonth}>
                <ChevronRight />
              </IconButton>
            </Box>

            {/* Calendar Grid */}
            <Box>
              {/* Day Headers */}
              <Grid container spacing={1} sx={{ mb: 1 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Grid item xs={12 / 7} key={day}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      textAlign="center"
                      color="text.secondary"
                    >
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Calendar Days */}
              <Grid container spacing={1}>
                {(() => {
                  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
                  const days = [];

                  // Empty cells before first day of month
                  for (let i = 0; i < startingDayOfWeek; i++) {
                    days.push(
                      <Grid item xs={12 / 7} key={`empty-${i}`}>
                        <Box sx={{ height: 100 }} />
                      </Grid>
                    );
                  }

                  // Days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const dayBookings = getBookingsForDate(date);
                    const isToday =
                      new Date().toDateString() === date.toDateString();

                    days.push(
                      <Grid item xs={12 / 7} key={day}>
                        <Tooltip
                          title={
                            dayBookings.length > 0
                              ? `${dayBookings.length} booking${dayBookings.length > 1 ? 's' : ''}`
                              : 'Click to add booking'
                          }
                        >
                          <Card
                            sx={{
                              height: 100,
                              cursor: 'pointer',
                              border: isToday ? '2px solid' : '1px solid',
                              borderColor: isToday ? 'primary.main' : 'divider',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: 2,
                              },
                            }}
                            onClick={() => handleDateClick(date)}
                          >
                            <CardContent sx={{ p: 1, height: '100%', overflow: 'hidden' }}>
                              <Typography
                                variant="body2"
                                fontWeight={isToday ? 700 : 400}
                                color={isToday ? 'primary.main' : 'text.primary'}
                              >
                                {day}
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                {dayBookings.slice(0, 2).map((booking) => (
                                  <Box
                                    key={booking.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenDialog(booking);
                                    }}
                                    sx={{
                                      mb: 0.5,
                                      p: 0.5,
                                      bgcolor: `${getStatusColor(booking.status)}.light`,
                                      borderRadius: 0.5,
                                      cursor: 'pointer',
                                      '&:hover': {
                                        opacity: 0.8,
                                      },
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: '0.65rem',
                                        display: 'block',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {booking.guestName}
                                    </Typography>
                                  </Box>
                                ))}
                                {dayBookings.length > 2 && (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                    +{dayBookings.length - 2} more
                                  </Typography>
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Tooltip>
                      </Grid>
                    );
                  }

                  return days;
                })()}
              </Grid>
            </Box>
          </Paper>
        </>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Guest Name</TableCell>
                <TableCell>Property</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Check-out</TableCell>
                <TableCell>Guests</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.guestName}</TableCell>
                  <TableCell>
                    {properties.find((p) => p.id === booking.propertyId)?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                  <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                  <TableCell>{booking.numberOfGuests}</TableCell>
                  <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      size="small"
                      color={getStatusColor(booking.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={booking.bookingSource} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(booking)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(booking)} color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Booking Dialog */}
      {selectedPropertyId !== 'all' && (
        <BookingDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveBooking}
          booking={selectedBooking}
          propertyId={selectedPropertyId}
        />
      )}
    </Box>
  );
};

export default OwnerBookings;
