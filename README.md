<div align="center">

# EventHub

### AI-Powered Event Media Management Platform

**[event-hub-navy-delta.vercel.app](https://event-hub-navy-delta.vercel.app/)**

*Centralize your college events. Discover your photos. Powered by AI.*

</div>

---

## Overview

EventHub is an AI-powered event media management platform built for colleges, universities, clubs, and student organizations. It centralizes event management, media sharing, photo discovery, and secure content access in a single platform.

---

## Features

### Event Management
- Create and manage events
- Event-wise media organization
- Event details and dedicated media galleries

### Media Gallery
- Upload photos and videos
- Browse media across all events
- Search and filter media
- Download original files

### AI Face Recognition
- Upload a selfie
- Automatically find your photos across all events
- Browser-side facial recognition using face-api.js
- No facial data stored on the server

### User Roles
| Role | Description |
|------|-------------|
| Admin | Full platform control |
| Photographer | Upload and manage media |
| Club Member | Browse and interact with content |
| Viewer | Read-only access |

### Notifications
- Like and comment notifications
- Read/unread tracking
- Notification badge counts

### Watermark Protection
- Dynamic watermark generation
- Role-aware watermarking
- Configurable settings
- Protected media downloads

### User Profiles
- Profile management
- Activity statistics
- User-specific media views

### Authentication & Security
- JWT-based authentication
- Protected API routes
- Password hashing with bcrypt
- Role-based authorization

---

## Tech Stack

**Frontend**
- React, TypeScript, Vite
- Tailwind CSS, Lucide Icons
- face-api.js

**Backend**
- Node.js, Express.js
- MongoDB Atlas, Mongoose
- JWT Authentication, Multer

**Cloud Services**
- Cloudinary — Media Storage
- MongoDB Atlas — Database
- Render — Backend Deployment
- Vercel — Frontend Deployment

---

## Project Structure

```
EventHub/
├── EMP_CIG_DEV/               # Frontend
│   ├── src/
│   ├── public/
│   └── components/
│
├── eventhub-backend/          # Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
│
└── README.md
```

---

## Application Workflow

```
User signs in
    → Events are created and managed
        → Photos/videos are uploaded to Cloudinary
            → Media is organized event-wise
                → Users browse galleries and interact
                    → Notifications are triggered
                        → Watermarked downloads are served
                            → AI finds your face across all photos
```

---

## AI Module — Facial Recognition Search

The AI-powered photo discovery system lets users locate their photos across all uploaded event images.

**How it works:**

1. Upload a clear selfie
2. Face descriptors are extracted using face-api.js
3. Event images are scanned
4. Facial embeddings are compared
5. Matching photos are displayed

> **Privacy Note:** All face recognition processing is performed locally in the browser. No facial data is sent to or stored on the server.

---

## Security

- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- Role-Based Permissions
- Watermarked Downloads
- Secure Cloud Storage Integration

---

## Future Enhancements

- AI-generated image tags
- Advanced people tagging
- Public/Private media controls
- Mobile application
- Real-time notifications
- Event analytics dashboard

---

## Author

**Charvi**  
**24113033** 

---

## License

This project is developed for educational, academic, and demonstration purposes.
