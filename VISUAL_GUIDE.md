# 🎨 HostHelper Visual Design Guide

## Quick Reference for Using the New Design System

---

## 🎯 Core Design Tokens

### Color Gradients
Copy-paste these into your components:

```tsx
import { gradients } from '../theme/theme';

// Usage in Material-UI Box
<Box sx={{ background: gradients.primary }}>

// Available gradients:
gradients.primary    // Blue gradient - Main CTAs
gradients.secondary  // Green gradient - Success actions
gradients.hero       // Purple gradient - Hero sections
gradients.sunset     // Orange to red - Warnings/Important
gradients.ocean      // Cyan to blue - Info sections
gradients.purple     // Purple to pink - Special features
gradients.success    // Green - Success messages
gradients.info       // Blue - Information
gradients.warning    // Orange - Warnings
```

### Colored Shadows
Add depth with colored shadows:

```tsx
import { coloredShadows } from '../theme/theme';

<Card sx={{ boxShadow: coloredShadows.primary }}>
<Card sx={{ boxShadow: coloredShadows.hover }}> // On hover
```

### Glassmorphism
Create frosted glass effects:

```tsx
import { glassmorphism } from '../theme/theme';

<Box sx={{
  ...glassmorphism.light,
  padding: 3
}}>
```

---

## 📦 Reusable Components

### LoadingSkeleton
Replace all "Loading..." text with beautiful skeletons:

```tsx
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// Dashboard cards
{loading && <LoadingSkeleton variant="dashboard" count={4} />}

// Property/Job cards
{loading && <LoadingSkeleton variant="card" count={3} />}

// List items
{loading && <LoadingSkeleton variant="list" count={5} />}

// Text content
{loading && <LoadingSkeleton variant="text" count={3} />}

// Table rows
{loading && <LoadingSkeleton variant="table" count={10} />}
```

### EmptyState
Show when lists are empty:

```tsx
import EmptyState from '../components/common/EmptyState';
import { WorkIcon } from '@mui/icons-material';

{items.length === 0 && (
  <EmptyState
    icon={<WorkIcon />}
    title="No jobs available"
    description="Check back later for new opportunities"
    actionLabel="Refresh"
    onAction={() => refetch()}
  />
)}
```

---

## ✨ Animation Patterns

### Page Container
Fade in the entire page:

```tsx
import { motion } from 'framer-motion';

export default function MyPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Your content */}
    </motion.div>
  );
}
```

### Card List with Stagger
Cards appear one by one:

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item, i) => (
    <motion.div key={i} variants={itemVariants}>
      <Card>...</Card>
    </motion.div>
  ))}
</motion.div>
```

### Hover Effect
Lift cards on hover:

```tsx
<Card
  sx={{
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: coloredShadows.hover
    }
  }}
>
```

---

## 📊 Chart Components

### Area Chart with Gradient
```tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
    <XAxis dataKey="name" stroke="#6B7280" />
    <YAxis stroke="#6B7280" />
    <Tooltip />
    <Area
      type="monotone"
      dataKey="value"
      stroke="#2563EB"
      strokeWidth={2}
      fillOpacity={1}
      fill="url(#colorRevenue)"
    />
  </AreaChart>
</ResponsiveContainer>
```

### Pie Chart
```tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      labelLine={false}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

### Bar Chart
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
    <XAxis dataKey="name" stroke="#6B7280" />
    <YAxis stroke="#6B7280" />
    <Tooltip />
    <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

---

## 🎴 Card Patterns

### Stat Card with Gradient Indicator
```tsx
import { motion } from 'framer-motion';
import { TrendingUp } from '@mui/icons-material';

<motion.div variants={itemVariants}>
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
    {/* Gradient indicator */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: gradients.primary
      }}
    />

    <CardContent sx={{ pt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />
        <Chip label="+12%" size="small" color="success" />
      </Box>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        $12,450
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Total Revenue
      </Typography>
    </CardContent>
  </Card>
</motion.div>
```

### Card with Hover Lift
```tsx
<Card
  sx={{
    height: '100%',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: coloredShadows.hover
    }
  }}
>
  {/* Your content */}
</Card>
```

---

## 🎨 Page Header Pattern

### Gradient Header
```tsx
<Box
  sx={{
    background: gradients.hero,
    color: 'white',
    p: 4,
    borderRadius: 2,
    mb: 4,
    position: 'relative',
    overflow: 'hidden'
  }}
>
  {/* Decorative overlay */}
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.1)',
      pointerEvents: 'none'
    }}
  />

  <Box sx={{ position: 'relative', zIndex: 1 }}>
    <Typography variant="h3" fontWeight={700} gutterBottom>
      Dashboard
    </Typography>
    <Typography variant="body1" sx={{ opacity: 0.9 }}>
      Welcome back! Here's what's happening with your properties.
    </Typography>
  </Box>
</Box>
```

---

## 🔘 Button Patterns

### Primary CTA with Gradient
```tsx
<Button
  variant="contained"
  size="large"
  sx={{
    background: gradients.primary,
    '&:hover': {
      background: gradients.primary,
      transform: 'translateY(-2px)',
      boxShadow: coloredShadows.hover
    },
    transition: 'all 0.2s'
  }}
>
  Get Started
</Button>
```

### Outlined Button with Hover Fill
```tsx
<Button
  variant="outlined"
  sx={{
    borderColor: 'primary.main',
    color: 'primary.main',
    '&:hover': {
      background: gradients.primary,
      color: 'white',
      borderColor: 'transparent'
    },
    transition: 'all 0.2s'
  }}
>
  Learn More
</Button>
```

---

## 📱 Responsive Grid Patterns

### Dashboard Stats Grid
```tsx
<Grid container spacing={3}>
  {stats.map((stat, i) => (
    <Grid item xs={12} sm={6} md={3} key={i}>
      <StatCard {...stat} />
    </Grid>
  ))}
</Grid>
```

### Content Cards Grid
```tsx
<Grid container spacing={3}>
  {items.map((item, i) => (
    <Grid item xs={12} md={6} lg={4} key={i}>
      <ItemCard {...item} />
    </Grid>
  ))}
</Grid>
```

---

## 🎭 Spacing System

Use the **8px spacing grid**:

```tsx
// Padding
sx={{ p: 1 }}  // 8px
sx={{ p: 2 }}  // 16px
sx={{ p: 3 }}  // 24px
sx={{ p: 4 }}  // 32px

// Margin
sx={{ mb: 2 }} // margin-bottom: 16px
sx={{ mt: 3 }} // margin-top: 24px
sx={{ mx: 2 }} // horizontal: 16px

// Gap (flexbox)
sx={{ gap: 2 }} // 16px
```

---

## 💡 Pro Tips

1. **Always use animations** - Even subtle ones make a huge difference
2. **Loading states matter** - Never show "Loading..." use skeletons
3. **Empty states are opportunities** - Guide users to their next action
4. **Hover effects = feedback** - Let users know elements are interactive
5. **Gradients for emphasis** - Use on CTAs and important sections
6. **Shadows create depth** - Use different levels for hierarchy
7. **Icons add context** - Pair text with icons for faster recognition
8. **White space is design** - Don't fear empty space
9. **Consistent transitions** - Use 0.2-0.3s for all animations
10. **Test responsiveness** - Check on mobile, tablet, desktop

---

## 🎯 Quick Wins

Want to make any page look better instantly? Add these:

1. **Gradient header** at the top
2. **Stat cards** with numbers and icons
3. **Hover effects** on all cards (`translateY(-4px)`)
4. **LoadingSkeleton** instead of "Loading..."
5. **EmptyState** when no data
6. **Icons** from `@mui/icons-material`
7. **Colored shadows** on important cards
8. **Staggered animations** on lists
9. **Proper spacing** using 8px grid
10. **Gradient buttons** for primary actions

---

## 📚 Resources

- Material-UI Docs: https://mui.com/
- Framer Motion Docs: https://www.framer.com/motion/
- Recharts Docs: https://recharts.org/
- Color Gradients: https://uigradients.com/
- Icons: https://mui.com/material-ui/material-icons/

---

**Remember:** Good design is invisible. Focus on making the user's journey smooth and delightful, not on showing off effects. Every animation should have a purpose, every color should convey meaning.

Happy designing! 🎨✨
