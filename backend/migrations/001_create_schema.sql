-- SocietyCare Database Schema
-- PostgreSQL Migration Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'resident' CHECK (role IN ('resident', 'admin', 'staff')),
    "houseNumber" VARCHAR(20),
    tower VARCHAR(50),
    "emergencyContact" VARCHAR(15),
    "profileImage" VARCHAR(500),
    "fcmToken" VARCHAR(500),
    "isActive" BOOLEAN DEFAULT true,
    "isEmailVerified" BOOLEAN DEFAULT false,
    "isPhoneVerified" BOOLEAN DEFAULT false,
    otp VARCHAR(6),
    "otpExpiry" TIMESTAMP WITH TIME ZONE,
    language VARCHAR(2) DEFAULT 'en' CHECK (language IN ('en', 'hi')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Members table
CREATE TABLE IF NOT EXISTS family_members (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relation VARCHAR(50) NOT NULL,
    age INTEGER,
    phone VARCHAR(15),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Personnel table
CREATE TABLE IF NOT EXISTS service_personnel (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(255),
    specialization VARCHAR(20) NOT NULL CHECK (specialization IN ('electrician', 'plumber', 'carpenter', 'cleaner', 'painter', 'pest_control', 'security', 'general')),
    "isAvailable" BOOLEAN DEFAULT true,
    rating FLOAT DEFAULT 0,
    "totalJobs" INTEGER DEFAULT 0,
    "userId" INTEGER REFERENCES users(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Requests table
CREATE TABLE IF NOT EXISTS service_requests (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('electrical', 'plumbing', 'carpentry', 'cleaning', 'painting', 'pest_control', 'security', 'other')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    "originalLanguage" VARCHAR(10),
    "originalText" TEXT,
    "aiSummary" TEXT,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'reopened', 'cancelled')),
    images TEXT[] DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    "voiceNote" VARCHAR(500),
    "helpReceived" BOOLEAN,
    "issueResolved" BOOLEAN,
    "resolvedAt" TIMESTAMP WITH TIME ZONE,
    "reopenReason" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    "requestId" INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    "personnelId" INTEGER NOT NULL REFERENCES service_personnel(id),
    "assignedBy" INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(15) DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in_progress', 'completed', 'rejected')),
    notes TEXT,
    "proofImage" VARCHAR(500),
    "digitalSignature" TEXT,
    "startedAt" TIMESTAMP WITH TIME ZONE,
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    "lateFee" DECIMAL(10, 2) DEFAULT 0,
    "totalAmount" DECIMAL(10, 2) NOT NULL,
    month VARCHAR(7) NOT NULL, -- YYYY-MM
    status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    "paymentMethod" VARCHAR(20) CHECK ("paymentMethod" IN ('razorpay', 'upi', 'bank_transfer', 'cash', 'cheque')),
    "razorpayOrderId" VARCHAR(255),
    "razorpayPaymentId" VARCHAR(255),
    "razorpaySignature" VARCHAR(500),
    "receiptUrl" VARCHAR(500),
    "paidAt" TIMESTAMP WITH TIME ZONE,
    "dueDate" DATE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(15) DEFAULT 'general' CHECK (category IN ('general', 'maintenance', 'emergency', 'event', 'payment')),
    "createdBy" INTEGER NOT NULL REFERENCES users(id),
    "isActive" BOOLEAN DEFAULT true,
    "expiresAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'general' CHECK (type IN ('service_request', 'payment', 'announcement', 'assignment', 'emergency', 'general')),
    "isRead" BOOLEAN DEFAULT false,
    "referenceId" INTEGER,
    "referenceType" VARCHAR(50),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "requestId" INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    "personnelBehavior" INTEGER CHECK ("personnelBehavior" >= 1 AND "personnelBehavior" <= 5),
    "serviceQuality" INTEGER CHECK ("serviceQuality" >= 1 AND "serviceQuality" <= 5),
    timeliness INTEGER CHECK (timeliness >= 1 AND timeliness <= 5),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visitors table
CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "visitorName" VARCHAR(100) NOT NULL,
    "visitorPhone" VARCHAR(15),
    purpose VARCHAR(200) NOT NULL,
    "vehicleNumber" VARCHAR(20),
    "qrCode" TEXT,
    "checkInTime" TIMESTAMP WITH TIME ZONE,
    "checkOutTime" TIMESTAMP WITH TIME ZONE,
    status VARCHAR(15) DEFAULT 'expected' CHECK (status IN ('expected', 'checked_in', 'checked_out', 'cancelled')),
    "expectedDate" DATE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Fees table
CREATE TABLE IF NOT EXISTS maintenance_fees (
    id SERIAL PRIMARY KEY,
    tower VARCHAR(50),
    "flatType" VARCHAR(20),
    amount DECIMAL(10, 2) NOT NULL,
    "lateFeePerDay" DECIMAL(10, 2) DEFAULT 50.00,
    "dueDay" INTEGER DEFAULT 10,
    "effectiveFrom" DATE NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_service_requests_user ON service_requests("userId");
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_category ON service_requests(category);
CREATE INDEX IF NOT EXISTS idx_assignments_request ON assignments("requestId");
CREATE INDEX IF NOT EXISTS idx_assignments_personnel ON assignments("personnelId");
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments("userId");
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_month ON payments(month);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications("isRead");
CREATE INDEX IF NOT EXISTS idx_visitors_user ON visitors("userId");
CREATE INDEX IF NOT EXISTS idx_visitors_date ON visitors("expectedDate");
