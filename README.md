# Food Surplus Management Platform
A simple platform connecting food donors with receivers to reduce food waste.

## Donor:
![Screenshot (52)](https://github.com/user-attachments/assets/4364f668-8557-408a-8b95-410477e6046f)

## Receiver:
![Screenshot (53)](https://github.com/user-attachments/assets/59162e9f-fed7-4861-beef-656ddb6a982f)

### Donor Features
- Register/Login as donor
- Upload food donations with photos
- View and manage donation requests
- Accept/reject pickup requests
- Get email notifications with OTP

### Receiver Features
- Register/Login as receiver
- Browse available food donations
- Filter donations by city/state
- View donor locations on map
- Send pickup requests
- Track request status

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your values:
   - Set JWT_SECRET to a secure random string
   - Configure email settings for Gmail SMTP
   - Set Google Maps API key

5. Create uploads directory:
```bash
mkdir uploads
```

6. Start the server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your Google Maps API key

5. Start the development server:
```bash
npm start
```

Frontend will run on http://localhost:3000

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login

### Donations
- POST `/api/donations` - Create donation (donors only)
- GET `/api/donations` - Get available donations (with city/state filters)
- GET `/api/donations/my` - Get donor's donations
- PUT `/api/donations/:id/status` - Update donation status

### Requests
- POST `/api/requests` - Create pickup request (receivers only)
- GET `/api/requests/received` - Get requests received by donor
- GET `/api/requests/sent` - Get requests sent by receiver
- PUT `/api/requests/:id/accept` - Accept/reject request


## Environment Variables


### Frontend (.env)
- `REACT_APP_GOOGLE_MAPS_API_KEY` - Google Maps API key for location display

## Tech Stack

- **Backend**: Node.js, Express.js, MySQL
- **Frontend**: React, Tailwind CSS, Axios
- **Authentication**: JWT tokens
- **File Upload**: Multer
- **Email**: Nodemailer
- **Maps**: Google Maps API

## Usage Flow

1. **Donor registers** and logs in
2. **Donor creates food donation** with details and photo
3. **Receiver registers** and browses available donations
4. **Receiver filters donations** by location and sends request
5. **Donor reviews request** and accepts/rejects
6. **Both parties receive email** with pickup details and OTP
7. **Pickup happens** using the verification OTP

The platform is designed to be simple and focused on core functionality without unnecessary complexity.
