import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Property, PropertyType } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface PropertyDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (propertyData: Partial<Property>) => Promise<void>;
  property?: Property | null;
}

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'villa', label: 'Villa' },
  { value: 'cabin', label: 'Cabin' },
  { value: 'other', label: 'Other' },
];

const PropertyDialog = ({ open, onClose, onSave, property }: PropertyDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    propertyType: 'apartment' as PropertyType,
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    description: '',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    cleaningFee: 0,
    status: 'active' as 'active' | 'inactive' | 'maintenance',
  });

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        propertyType: property.propertyType,
        street: property.address.street,
        city: property.address.city,
        state: property.address.state,
        zipCode: property.address.zipCode,
        country: property.address.country,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        maxGuests: property.maxGuests,
        description: property.description,
        checkInTime: property.checkInTime,
        checkOutTime: property.checkOutTime,
        cleaningFee: property.cleaningFee,
        status: property.status,
      });
    }
  }, [property]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const propertyData: Partial<Property> = {
        ownerId: user!.id,
        name: formData.name,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        propertyType: formData.propertyType,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        maxGuests: formData.maxGuests,
        amenities: [],
        photos: [],
        description: formData.description,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        cleaningFee: formData.cleaningFee,
        status: formData.status,
        connectedPlatforms: [],
      };

      console.log('[PropertyDialog] Saving property:', propertyData);
      await onSave(propertyData);
      console.log('[PropertyDialog] Property saved successfully');
      onClose();
    } catch (err: any) {
      console.error('[PropertyDialog] Error saving property:', err);
      setError(err.message || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{property ? 'Edit Property' : 'Add New Property'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Property Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={formData.propertyType}
                label="Property Type"
                onChange={(e) => handleChange('propertyType', e.target.value)}
              >
                {propertyTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Address
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              value={formData.street}
              onChange={(e) => handleChange('street', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="State"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Zip Code"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Details
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Bedrooms"
              value={formData.bedrooms}
              onChange={(e) => handleChange('bedrooms', parseInt(e.target.value))}
              inputProps={{ min: 0 }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Bathrooms"
              value={formData.bathrooms}
              onChange={(e) => handleChange('bathrooms', parseFloat(e.target.value))}
              inputProps={{ min: 0, step: 0.5 }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Max Guests"
              value={formData.maxGuests}
              onChange={(e) => handleChange('maxGuests', parseInt(e.target.value))}
              inputProps={{ min: 1 }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Check-in/Check-out
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="time"
              label="Check-in Time"
              value={formData.checkInTime}
              onChange={(e) => handleChange('checkInTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="time"
              label="Check-out Time"
              value={formData.checkOutTime}
              onChange={(e) => handleChange('checkOutTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Cleaning Fee"
              value={formData.cleaningFee}
              onChange={(e) => handleChange('cleaningFee', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.name || !formData.street}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {property ? 'Save Changes' : 'Add Property'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PropertyDialog;
