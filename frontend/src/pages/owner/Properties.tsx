import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Fade,
} from '@mui/material';
import {
  Add,
  Home as HomeIcon,
  MoreVert,
  Edit,
  Delete,
  LocationOn,
  Bed,
  Bathtub,
  People,
} from '@mui/icons-material';
import { useProperties } from '../../hooks/useProperties';
import PropertyDialog from '../../components/properties/PropertyDialog';
import { Property } from '../../types';

const OwnerProperties = () => {
  const { properties, loading, addProperty, updateProperty, deleteProperty } = useProperties();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuProperty, setMenuProperty] = useState<Property | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleOpenDialog = (property?: Property) => {
    setSelectedProperty(property || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProperty(null);
  };

  const handleSaveProperty = async (propertyData: Partial<Property>) => {
    try {
      console.log('[Properties] handleSaveProperty called with:', propertyData);
      if (selectedProperty) {
        console.log('[Properties] Updating existing property:', selectedProperty.id);
        await updateProperty(selectedProperty.id, propertyData);
        setSuccess('Property updated successfully!');
      } else {
        console.log('[Properties] Adding new property');
        await addProperty(propertyData as any);
        setSuccess('Property added successfully!');
      }
      handleCloseDialog();
    } catch (err: any) {
      console.error('[Properties] Error saving property:', err);
      setError(err.message || 'Failed to save property');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, property: Property) => {
    setAnchorEl(event.currentTarget);
    setMenuProperty(property);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuProperty(null);
  };

  const handleEdit = () => {
    if (menuProperty) {
      handleOpenDialog(menuProperty);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (menuProperty && confirm(`Are you sure you want to delete ${menuProperty.name}?`)) {
      try {
        await deleteProperty(menuProperty.id);
        setSuccess('Property deleted successfully!');
      } catch (err: any) {
        setError(err.message || 'Failed to delete property');
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Properties
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your rental properties
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Add Property
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

      {loading && properties.length === 0 ? (
        <Typography>Loading properties...</Typography>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <HomeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No properties yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Get started by adding your first rental property
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
              Add Your First Property
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} md={6} lg={4} key={property.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {property.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, property)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {property.address.city}, {property.address.state}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {property.address.street}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Bed sx={{ fontSize: 18, mr: 0.5 }} />
                      <Typography variant="body2">{property.bedrooms}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Bathtub sx={{ fontSize: 18, mr: 0.5 }} />
                      <Typography variant="body2">{property.bathrooms}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <People sx={{ fontSize: 18, mr: 0.5 }} />
                      <Typography variant="body2">{property.maxGuests}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={property.propertyType}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={property.status}
                      size="small"
                      color={getStatusColor(property.status) as any}
                    />
                  </Box>
                </CardContent>

                <CardActions>
                  <Button size="small" onClick={() => handleOpenDialog(property)}>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Property Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Property Dialog */}
      <PropertyDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveProperty}
        property={selectedProperty}
      />
    </Box>
  );
};

export default OwnerProperties;
