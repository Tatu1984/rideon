# RideOn Admin Panel - UI Design System

## Component Library & Design Guidelines

### Color Palette

**Primary Colors:**
- `primary-50`: #F5F3FF
- `primary-100`: #EDE9FE
- `primary-500`: #8B5CF6 (Main Purple)
- `primary-600`: #7C3AED
- `primary-700`: #6D28D9
- `primary-900`: #4C1D95

**Status Colors:**
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Error: `#EF4444` (Red)
- Info: `#3B82F6` (Blue)

**Neutral Colors:**
- `gray-50`: #F9FAFB
- `gray-100`: #F3F4F6
- `gray-500`: #6B7280
- `gray-900`: #111827

### Typography

**Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
             'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

**Font Sizes:**
- Heading 1: 2rem (32px) - Bold
- Heading 2: 1.5rem (24px) - Bold
- Heading 3: 1.25rem (20px) - Semi-bold
- Body: 1rem (16px) - Regular
- Small: 0.875rem (14px) - Regular
- Tiny: 0.75rem (12px) - Regular

### Spacing Scale
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

### Border Radius
- Small: 0.375rem (6px)
- Medium: 0.5rem (8px)
- Large: 0.75rem (12px)
- XLarge: 1rem (16px)

### Shadow Levels
```css
/* Small */
box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Medium */
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);

/* Large */
box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* XLarge */
box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

## Reusable Components

### 1. Data Table Component
```jsx
<DataTable
  columns={[
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> }
  ]}
  data={items}
  onRowClick={(row) => handleRowClick(row)}
  pagination={true}
  pageSize={20}
  filters={[
    { key: 'status', type: 'select', options: ['active', 'inactive'] }
  ]}
/>
```

### 2. Status Badge Component
```jsx
<StatusBadge
  status="active" // active, pending, rejected, completed, cancelled
  size="sm" // sm, md, lg
/>
```

**Status Color Mapping:**
- `active` / `approved` / `completed`: Green
- `pending` / `in_progress`: Blue
- `rejected` / `cancelled` / `failed`: Red
- `suspended` / `maintenance`: Orange

### 3. Modal Component
```jsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Modal Title"
  size="md" // sm, md, lg, xl, full
>
  <Modal.Body>
    Content here
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={onSave}>Save</Button>
    <Button variant="secondary" onClick={onClose}>Cancel</Button>
  </Modal.Footer>
</Modal>
```

### 4. Button Component
```jsx
<Button
  variant="primary" // primary, secondary, danger, success
  size="md" // sm, md, lg
  disabled={false}
  loading={false}
  icon={<IconComponent />}
  onClick={handleClick}
>
  Button Text
</Button>
```

### 5. Form Input Component
```jsx
<Input
  label="Email Address"
  type="text"
  name="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
  required={true}
  placeholder="Enter email"
  helpText="We'll never share your email"
/>
```

### 6. Select Dropdown
```jsx
<Select
  label="Select Option"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
  value={selectedValue}
  onChange={handleChange}
  multiple={false}
  searchable={true}
/>
```

### 7. Card Component
```jsx
<Card className="hover:shadow-lg transition">
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Actions>
      <Button size="sm">Action</Button>
    </Card.Actions>
  </Card.Header>
  <Card.Body>
    Content
  </Card.Body>
  <Card.Footer>
    Footer content
  </Card.Footer>
</Card>
```

### 8. Stat Card Component
```jsx
<StatCard
  title="Total Revenue"
  value="$12,543.50"
  change="+12.5%"
  changeType="increase" // increase, decrease, neutral
  icon={<DollarIcon />}
  color="purple" // purple, blue, green, orange
/>
```

### 9. Alert/Toast Component
```jsx
<Alert
  type="success" // success, error, warning, info
  message="Action completed successfully"
  dismissible={true}
  onDismiss={() => {}}
/>
```

### 10. File Upload Component
```jsx
<FileUpload
  accept="image/*,.pdf"
  multiple={false}
  maxSize={5 * 1024 * 1024} // 5MB
  onUpload={(files) => handleUpload(files)}
  preview={true}
/>
```

### 11. Date Picker Component
```jsx
<DatePicker
  value={selectedDate}
  onChange={handleDateChange}
  minDate={new Date()}
  maxDate={null}
  showTime={false}
  format="YYYY-MM-DD"
/>
```

### 12. Map Component
```jsx
<Map
  center={[lat, lng]}
  zoom={12}
  markers={[
    { lat, lng, popup: 'Marker 1', icon: customIcon }
  ]}
  polygons={zones}
  onMarkerClick={(marker) => {}}
/>
```

### 13. Pagination Component
```jsx
<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => {}}
  showJump={true}
  showPerPage={true}
/>
```

### 14. Filter Bar Component
```jsx
<FilterBar
  filters={[
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: ['active', 'inactive']
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange'
    },
    {
      key: 'search',
      label: 'Search',
      type: 'text'
    }
  ]}
  onFilterChange={(filters) => {}}
/>
```

### 15. Breadcrumb Component
```jsx
<Breadcrumb>
  <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
  <Breadcrumb.Item href="/drivers">Drivers</Breadcrumb.Item>
  <Breadcrumb.Item active>Driver Details</Breadcrumb.Item>
</Breadcrumb>
```

---

## Page Layouts

### Standard List Page Layout
```jsx
<PageLayout>
  <PageHeader>
    <Breadcrumb />
    <PageTitle>Page Title</PageTitle>
    <PageActions>
      <Button>+ Add New</Button>
    </PageActions>
  </PageHeader>

  <FilterBar filters={filters} onFilterChange={handleFilter} />

  <PageContent>
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
    />
  </PageContent>
</PageLayout>
```

### Detail Page Layout
```jsx
<PageLayout>
  <PageHeader>
    <BackButton />
    <PageTitle>Item Details</PageTitle>
    <PageActions>
      <Button variant="danger">Delete</Button>
      <Button>Edit</Button>
    </PageActions>
  </PageHeader>

  <PageContent>
    <TabLayout tabs={['Overview', 'History', 'Documents']}>
      <Tab.Panel name="Overview">
        <DetailGrid>
          <DetailItem label="Name" value={item.name} />
          <DetailItem label="Email" value={item.email} />
        </DetailGrid>
      </Tab.Panel>
    </TabLayout>
  </PageContent>
</PageLayout>
```

### Dashboard Layout
```jsx
<DashboardLayout>
  <StatGrid>
    <StatCard title="Revenue" value="$12,543" />
    <StatCard title="Trips" value="1,234" />
    <StatCard title="Drivers" value="45" />
  </StatGrid>

  <ChartGrid>
    <Card span={2}>
      <AreaChart data={revenueData} />
    </Card>
    <Card span={1}>
      <PieChart data={statusData} />
    </Card>
  </ChartGrid>

  <DataGrid>
    <Card>
      <DataTable title="Recent Trips" data={recentTrips} />
    </Card>
  </DataGrid>
</DashboardLayout>
```

---

## Icon Library

Use Heroicons (https://heroicons.com/)

**Common Icons:**
- Home: HomeIcon
- Users: UsersIcon
- Car: TruckIcon
- Map: MapIcon
- Chart: ChartBarIcon
- Settings: CogIcon
- Wallet: CreditCardIcon
- Bell: BellIcon
- Search: MagnifyingGlassIcon
- Plus: PlusIcon
- Edit: PencilIcon
- Delete: TrashIcon
- Check: CheckIcon
- X: XMarkIcon
- Info: InformationCircleIcon

---

## Animation Guidelines

**Transitions:**
```css
/* Standard transition */
transition: all 150ms ease-in-out;

/* Hover effects */
.hover-lift {
  transition: transform 150ms ease-in-out;
}
.hover-lift:hover {
  transform: translateY(-2px);
}

/* Loading animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }

/* Large Desktop */
@media (min-width: 1280px) { }
```

---

## Accessibility Guidelines

1. **Color Contrast:** Minimum 4.5:1 for text
2. **Keyboard Navigation:** All interactive elements must be keyboard accessible
3. **ARIA Labels:** Add aria-label for icon buttons
4. **Focus Indicators:** Visible focus states on all inputs
5. **Alt Text:** All images must have alt attributes
6. **Semantic HTML:** Use proper heading hierarchy (h1, h2, h3)

---

## Code Style Guidelines

**Component Structure:**
```jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ComponentName() {
  // State
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // Hooks
  const router = useRouter()

  // Effects
  useEffect(() => {
    fetchData()
  }, [])

  // Handlers
  const handleClick = () => {
    // Logic
  }

  // API calls
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/endpoint')
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Render
  return (
    <div className="container">
      {/* JSX */}
    </div>
  )
}
```

This design system ensures consistency across all admin pages.
