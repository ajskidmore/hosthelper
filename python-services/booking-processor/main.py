"""
HostHelper Booking Processor Service

This Python microservice handles:
1. Mock booking data synchronization from Airbnb/Vrbo
2. Booking data processing and transformation
3. Analytics and reporting

To run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random

app = FastAPI(title="HostHelper Booking Processor", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class BookingSync(BaseModel):
    property_id: str
    platform: str  # airbnb, vrbo, booking

class BookingSyncResult(BaseModel):
    new_bookings: int
    updated_bookings: int
    cancelled_bookings: int
    errors: List[str]

class MockBooking(BaseModel):
    external_id: str
    guest_name: str
    guest_email: str
    check_in: str
    check_out: str
    total_price: float
    status: str
    platform: str

# Mock Data Generator
def generate_mock_bookings(platform: str, count: int = 3) -> List[MockBooking]:
    """Generate mock bookings to simulate API response"""
    guest_names = ["Alice Johnson", "Bob Martinez", "Carol White", "David Lee", "Emma Garcia"]
    bookings = []

    for i in range(count):
        check_in = datetime.now() + timedelta(days=random.randint(5, 60))
        check_out = check_in + timedelta(days=random.randint(2, 7))

        booking = MockBooking(
            external_id=f"{platform}-{random.randint(100000, 999999)}",
            guest_name=random.choice(guest_names),
            guest_email=f"guest{i}@example.com",
            check_in=check_in.strftime("%Y-%m-%d"),
            check_out=check_out.strftime("%Y-%m-%d"),
            total_price=round(random.uniform(200, 1500), 2),
            status=random.choice(["confirmed", "pending"]),
            platform=platform
        )
        bookings.append(booking)

    return bookings

# Routes
@app.get("/")
async def root():
    return {
        "service": "HostHelper Booking Processor",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/sync/bookings", response_model=BookingSyncResult)
async def sync_platform_bookings(sync_request: BookingSync):
    """
    Simulate syncing bookings from external platforms (Airbnb, Vrbo, Booking.com)

    In production, this would:
    1. Authenticate with the platform API
    2. Fetch bookings for the property
    3. Compare with existing bookings in Firestore
    4. Create/update/cancel bookings as needed

    For demo purposes, this generates mock data
    """

    try:
        # Simulate API call delay
        import time
        time.sleep(0.5)

        # Generate mock bookings
        mock_bookings = generate_mock_bookings(sync_request.platform, count=random.randint(1, 4))

        # Simulate sync results
        result = BookingSyncResult(
            new_bookings=len([b for b in mock_bookings if b.status == "confirmed"]),
            updated_bookings=random.randint(0, 2),
            cancelled_bookings=random.randint(0, 1),
            errors=[]
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@app.get("/mock/bookings/{platform}")
async def get_mock_bookings(platform: str, count: int = 5):
    """
    Get mock booking data for testing

    This endpoint simulates what you'd get from real platform APIs
    """

    if platform not in ["airbnb", "vrbo", "booking"]:
        raise HTTPException(status_code=400, detail="Invalid platform")

    bookings = generate_mock_bookings(platform, count)
    return {"platform": platform, "bookings": bookings}

@app.get("/analytics/occupancy/{property_id}")
async def calculate_occupancy(property_id: str, days: int = 30):
    """
    Calculate occupancy rate for a property

    In production, this would query Firestore for actual bookings
    """

    # Mock occupancy calculation
    occupancy_rate = round(random.uniform(60, 90), 1)
    booked_days = int(days * (occupancy_rate / 100))

    return {
        "property_id": property_id,
        "period_days": days,
        "booked_days": booked_days,
        "occupancy_rate": occupancy_rate,
        "revenue_estimate": round(booked_days * random.uniform(100, 300), 2)
    }

@app.post("/process/booking-data")
async def process_booking_data(data: dict):
    """
    Process and transform booking data

    This could include:
    - Data validation
    - Price calculations
    - Automated task creation
    - Guest communication triggers
    """

    return {
        "status": "processed",
        "timestamp": datetime.now().isoformat(),
        "data": data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
